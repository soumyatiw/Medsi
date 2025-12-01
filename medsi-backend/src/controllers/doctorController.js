const prisma = require("../config/prismaClient");


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

    const patients = await prisma.patient.findMany({
      where: {
        appointments: {
          some: { doctorId: doctor.id }
        },
        user: {
          name: { contains: search, mode: "insensitive" }
        }
      },
      skip,
      take: Number(limit),
      include: { user: true }
    });

    const total = await prisma.patient.count({
      where: {
        appointments: {
          some: { doctorId: doctor.id }
        }
      }
    });

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
