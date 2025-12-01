// src/controllers/patientController.js
const prisma = require('../config/prismaClient');

// Helper: convert string to Date safely
function toDateMaybe(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

// ---------------- GET PROFILE ----------------
exports.getProfile = async (req, res, next) => {
  try {
    // req.user.id is the User id (string)
    const userId = req.user.id;

    // Find the patient profile by userId
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, createdAt: true } }
      }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    return res.json({ patient });
  } catch (err) {
    next(err);
  }
};

// ---------------- UPDATE PROFILE ----------------
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { dob, gender, bloodGroup, medicalNotes, name } = req.body;

    // Update patient fields
    const updatedPatient = await prisma.patient.updateMany({
      where: { userId },
      data: {
        dob: dob ? new Date(dob) : undefined,
        gender: gender ?? undefined,
        bloodGroup: bloodGroup ?? undefined,
        medicalNotes: medicalNotes ?? undefined,
      },
    });

    // Also optionally update User.name
    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name }
      });
    }

    // Check if update matched a document
    if (updatedPatient.count === 0) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Return fresh profile
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    return res.json({ message: 'Profile updated', patient });
  } catch (err) {
    next(err);
  }
};

// ---------------- LIST APPOINTMENTS ----------------
// Supports query params: status (UPCOMING/COMPLETED/CANCELLED), page, limit, dateFrom, dateTo
exports.listAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // find patient id first
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const { status, page = 1, limit = 10, dateFrom, dateTo } = req.query;
    const take = Math.min(parseInt(limit, 10) || 10, 100);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const where = { patientId: patient.id };
    if (status) where.status = status;
    if (dateFrom || dateTo) where.appointmentDate = {};
    if (dateFrom) where.appointmentDate.gte = new Date(dateFrom);
    if (dateTo) where.appointmentDate.lte = new Date(dateTo);

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        orderBy: { appointmentDate: 'asc' },
        skip,
        take,
        include: {
          doctor: { include: { user: { select: { name: true, email: true } } } },
          patient: { include: { user: { select: { name: true, email: true } } } }
        }
      })
    ]);

    return res.json({
      meta: { total, page: parseInt(page, 10), limit: take, totalPages: Math.ceil(total / take) },
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// ---------------- BOOK APPOINTMENT ----------------
// Body: { doctorId, appointmentDate (ISO string), reason }
exports.bookAppointment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { doctorId, appointmentDate, reason } = req.body;

    if (!doctorId || !appointmentDate) {
      return res.status(400).json({ message: 'doctorId and appointmentDate are required' });
    }

    // ensure doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: { select: { name: true, email: true } } }
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // find patient
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const apptDateObj = new Date(appointmentDate);
    if (isNaN(apptDateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid appointmentDate' });
    }

    // Optional: basic conflict check — doctor can't have two appointments at same date/time
    const conflict = await prisma.appointment.findFirst({
      where: { doctorId: doctor.id, appointmentDate: apptDateObj, status: 'UPCOMING' }
    });
    if (conflict) {
      return res.status(409).json({ message: 'Selected slot is already booked for this doctor' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        appointmentDate: apptDateObj,
        reason: reason ?? null,
      },
    });

    return res.status(201).json({ message: 'Appointment booked', appointment });
  } catch (err) {
    next(err);
  }
};

// ---------------- UPDATE APPOINTMENT (reschedule/cancel) ----------------
// Body for reschedule: { appointmentDate }
// Body for cancel: { action: 'cancel' } or set status = 'CANCELLED'
exports.updateAppointment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const { appointmentDate, action } = req.body;

    // find patient
    const patient = await prisma.patient.findUnique({ where: { userId }});
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // find appointment
    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId }});
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // ensure the appointment belongs to this patient
    if (appointment.patientId !== patient.id) {
      return res.status(403).json({ message: 'You are not authorized to modify this appointment' });
    }

    if (action === 'cancel') {
      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CANCELLED' }
      });
      return res.json({ message: 'Appointment cancelled', appointment: updated });
    }

    if (appointmentDate) {
      const apptDateObj = new Date(appointmentDate);
      if (isNaN(apptDateObj.getTime())) {
        return res.status(400).json({ message: 'Invalid appointmentDate' });
      }

      // conflict check with same doctor
      const conflict = await prisma.appointment.findFirst({
        where: {
          id: { not: appointmentId },
          doctorId: appointment.doctorId,
          appointmentDate: apptDateObj,
          status: 'UPCOMING'
        }
      });
      if (conflict) {
        return res.status(409).json({ message: 'Selected new slot is already booked for this doctor' });
      }

      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { appointmentDate: apptDateObj, status: 'UPCOMING' }
      });

      return res.json({ message: 'Appointment rescheduled', appointment: updated });
    }

    return res.status(400).json({ message: 'No valid action provided' });
  } catch (err) {
    next(err);
  }
};

// ---------------- LIST PRESCRIPTIONS ----------------
exports.listPrescriptions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const patient = await prisma.patient.findUnique({ where: { userId }});
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const { page = 1, limit = 10 } = req.query;
    const take = Math.min(parseInt(limit, 10) || 10, 100);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const [total, prescriptions] = await Promise.all([
      prisma.prescription.count({ where: { patientId: patient.id } }),
      prisma.prescription.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          doctor: { include: { user: { select: { name: true, email: true } } } },
          appointment: true
        }
      })
    ]);

    return res.json({
      meta: { total, page: parseInt(page, 10), limit: take, totalPages: Math.ceil(total / take) },
      data: prescriptions
    });
  } catch (err) {
    next(err);
  }
};

// ---------------- LIST REPORTS ----------------
exports.listReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const patient = await prisma.patient.findUnique({ where: { userId }});
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const reports = await prisma.report.findMany({
      where: { patientId: patient.id },
      orderBy: { uploadedAt: 'desc' }
    });

    return res.json({ data: reports });
  } catch (err) {
    next(err);
  }
};
