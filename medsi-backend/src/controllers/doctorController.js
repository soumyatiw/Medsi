const prisma = require("../config/prismaClient");

const bcrypt = require("bcrypt");
async function getDoctorFromUser(userId) {
  return prisma.doctor.findFirst({
    where: { userId }
  });
}

exports.getPatients = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const { search = "", page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where-clause safely:
    // - only add the user.name 'contains' filter when search is non-empty
    // - always include OR for patients assigned to this doctor or who have appointments with this doctor
    const whereClauses = [];

    if (search && String(search).trim() !== "") {
      whereClauses.push({
        user: {
          name: { contains: search, mode: "insensitive" }
        }
      });
    }

    whereClauses.push({
      OR: [
        { doctorId: doctor.id }, // directly assigned patients
        { appointments: { some: { doctorId: doctor.id } } } // patients with appointments for this doctor
      ]
    });

    const baseWhere = whereClauses.length === 1 ? whereClauses[0] : { AND: whereClauses };

    const patients = await prisma.patient.findMany({
      where: baseWhere,
      skip,
      take: Number(limit),
      include: { user: true }
    });

    const total = await prisma.patient.count({ where: baseWhere });

    res.json({
      meta: { total, page: Number(page), limit: Number(limit) },
      data: patients
    });

  } catch (error) {
    console.error("GetPatients Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getPatientDetails = async (req, res) => {
  try {
    const patientId = req.params.id;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
        appointments: {
          include: { doctor: { include: { user: true } } }
        },
        prescriptions: {
          include: { doctor: { include: { user: true } } }
        },
        reports: {
          include: { doctor: { include: { user: true } } }
        }
      }
    });

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    res.json({ patient });

  } catch (error) {
    console.error("GetPatientDetails Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const { status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { doctorId: doctor.id };

    if (status) where.status = status;

    if (dateFrom || dateTo) {
      where.appointmentDate = {
        gte: dateFrom ? new Date(dateFrom) : undefined,
        lte: dateTo ? new Date(dateTo) : undefined
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { appointmentDate: "asc" },
      include: {
        patient: { include: { user: true } }
      }
    });

    const total = await prisma.appointment.count({ where });

    res.json({
      meta: { total, page: Number(page), limit: Number(limit) },
      data: appointments
    });

  } catch (error) {
    console.error("GetAppointments Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    res.json({ message: "Appointment updated", appointment: updated });

  } catch (error) {
    console.error("UpdateAppointment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const { patientId, appointmentId, diagnosis, medicines, notes } = req.body;

    const prescription = await prisma.prescription.create({
      data: {
        doctorId: doctor.id,
        patientId,
        appointmentId,
        diagnosis,
        medicines,
        notes
      }
    });

    res.status(201).json({ message: "Prescription created", prescription });

  } catch (error) {
    console.error("CreatePrescription Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.prescription.update({
      where: { id },
      data: req.body
    });

    res.json({ message: "Prescription updated", updated });

  } catch (error) {
    console.error("UpdatePrescription Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.uploadReport = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const { patientId, fileUrl, fileType, description } = req.body;

    const report = await prisma.report.create({
      data: {
        patientId,
        doctorId: doctor.id,
        fileUrl,
        fileType,
        description
      }
    });

    res.status(201).json({ message: "Report uploaded", report });

  } catch (error) {
    console.error("UploadReport Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const patientsCount = await prisma.patient.count();
    const appointmentsCount = await prisma.appointment.count({
      where: { doctorId },
    });

    const prescriptionsCount = await prisma.prescription.count({
      where: { doctorId },
    });

    const reportsCount = await prisma.report.count({
      where: { doctorId },
    });

    res.status(200).json({
      patients: patientsCount,
      appointments: appointmentsCount,
      prescriptions: prescriptionsCount,
      reports: reportsCount,
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
};

exports.createPatient = async (req, res) => {
  try {
    // ensure the requester is a doctor and get the doctor's record
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor) {
      return res.status(403).json({ message: "Only doctors can create patients" });
    }

    const {
      name,
      email,
      password,
      dob = null,
      gender = null,
      bloodGroup = null,
      medicalNotes = null,
    } = req.body;

    // basic validation
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // prevent duplicate users
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // hash password if provided, otherwise generate a random temporary one
    const rawPassword = password || Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(rawPassword, 10);

    // create user with PATIENT role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "PATIENT",
      },
    });

    // create patient and link to the doctor
    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        dob,
        gender,
        bloodGroup,
        medicalNotes,
        doctorId: doctor.id,
      },
      include: {
        user: true,
      },
    });

    return res.status(201).json({ message: "Patient created", patient });
  } catch (err) {
    console.error("createPatient error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---- UPDATE PATIENT (patientId = patient.id) ----
exports.updatePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const { name, email, dob, gender, bloodGroup, medicalNotes } = req.body;

    // find patient
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Update patient fields
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        dob: dob ? new Date(dob) : undefined,
        gender: gender ?? undefined,
        bloodGroup: bloodGroup ?? undefined,
        medicalNotes: medicalNotes ?? undefined
      }
    });

    // Optionally update user name/email
    if (name || email) {
      const userUpdate = {};
      if (name) userUpdate.name = name;
      if (email) userUpdate.email = email;

      // If trying to change email ensure uniqueness
      if (email) {
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists && exists.id !== patient.userId) {
          return res.status(409).json({ message: "Email already in use" });
        }
      }

      await prisma.user.update({ where: { id: patient.userId }, data: userUpdate });
    }

    const full = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true }
    });

    return res.json({ message: "Patient updated", patient: full });
  } catch (err) {
    console.error("updatePatient error:", err);
    return res.status(500).json({ message: "Server error updating patient" });
  }
};

// ---- DELETE PATIENT (and its User) ----
exports.deletePatient = async (req, res) => {
  try {
    const patientId = req.params.id;

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // delete patient + user in transaction
    await prisma.$transaction(async (tx) => {
      // delete related appointments, prescriptions, reports? (prisma with cascade would be nice)
      // We'll delete appointments, prescriptions, reports referencing patientId to avoid orphaned docs.
      await tx.appointment.deleteMany({ where: { patientId } });
      await tx.prescription.deleteMany({ where: { patientId } });
      await tx.report.deleteMany({ where: { patientId } });

      await tx.patient.delete({ where: { id: patientId } });

      // delete user
      await tx.user.delete({ where: { id: patient.userId } });
    });

    return res.json({ message: "Patient and related data deleted" });
  } catch (err) {
    console.error("deletePatient error:", err);
    return res.status(500).json({ message: "Server error deleting patient" });
  }
};

