const prisma = require("../config/prismaClient");

/* --------------------------------------------------------------
   PATIENT DASHBOARD STATS 
---------------------------------------------------------------*/
exports.getDashboardStats = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id },
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const patientId = patient.id;

    const totalAppointments = await prisma.appointment.count({
      where: { patientId },
    });

    const nextAppointment = await prisma.appointment.findFirst({
      where: {
        patientId,
        status: "UPCOMING",
        appointmentDate: { gte: new Date() },
      },
      include: {
        doctor: { include: { user: true } },
      },
      orderBy: { appointmentDate: "asc" },
    });

    const totalPrescriptions = await prisma.prescription.count({
      where: { patientId },
    });

    const recentPrescriptions = await prisma.prescription.findMany({
      where: { patientId },
      include: {
        doctor: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    const totalReports = await prisma.report.count({
      where: { patientId },
    });

    let recentReports = [];
    try {
      recentReports = await prisma.report.findMany({
        where: { patientId },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
    } catch (err) {
      recentReports = await prisma.report.findMany({
        where: { patientId },
        orderBy: { uploadedAt: "desc" },
        take: 6,
      });
    }

    return res.json({
      totalAppointments,
      nextAppointment,
      totalPrescriptions,
      totalReports,
      recentPrescriptions,
      recentReports,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};

/* --------------------------------------------------------------
   LIST APPOINTMENTS FOR LOGGED-IN PATIENT
---------------------------------------------------------------*/
exports.listAppointments = async (req, res) => {
  try {
    // STEP 1 — ensure patient exists
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id }
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    // STEP 2 — fetch appointments WITHOUT doctorSlot
    const appts = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          include: { user: true }
        },
        prescription: true
      },
      orderBy: { appointmentDate: "asc" }
    });

    // STEP 3 — manually attach doctorSlot (Render friendly)
    const appointments = await Promise.all(
      appts.map(async (appt) => {
        let slot = null;

        // Find slot manually using appointmentId
        if (appt.id) {
          slot = await prisma.doctorSlot.findFirst({
            where: { appointmentId: appt.id }
          });
        }

        return { ...appt, doctorSlot: slot };
      })
    );

    return res.json({ appointments });

  } catch (error) {
    console.error("listAppointments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* --------------------------------------------------------------
   UPDATE / CANCEL APPOINTMENT
---------------------------------------------------------------*/
exports.updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { status } = req.body;

    if (!status || !["CANCELLED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // find patient by userId
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    // ensure appointment belongs to patient
    const appointment = await prisma.appointment.findFirst({ where: { id: appointmentId, patientId: patient.id } });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Update appointment status
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    // If cancelled, free the slot(s) that referenced this appointment
    if (status === "CANCELLED") {
      await prisma.doctorSlot.updateMany({
        where: { appointmentId: appointmentId },
        data: { status: "AVAILABLE", appointmentId: null },
      });
    }

    return res.json({ message: "Appointment updated successfully", appointment: updated });
  } catch (err) {
    console.error("updateAppointment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


/* --------------------------------------------------------------
   PERMANENT DELETE APPOINTMENT
---------------------------------------------------------------*/
exports.deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    const appointment = await prisma.appointment.findFirst({ where: { id: appointmentId, patientId: patient.id } });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // free slot if linked
    await prisma.doctorSlot.updateMany({
      where: { appointmentId },
      data: { appointmentId: null, status: "AVAILABLE" },
    });

    await prisma.appointment.delete({ where: { id: appointmentId } });

    return res.json({ message: "Appointment permanently deleted" });
  } catch (err) {
    console.error("deleteAppointment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.getPatientPrescriptions = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id }
    });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: { include: { user: true } },
        appointment: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ prescriptions });
  } catch (err) {
    console.error("getPatientPrescriptions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/patient/prescriptions/:id
 * Get single prescription (patient only)
 */
exports.getPatientPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id }
    });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const prescription = await prisma.prescription.findFirst({
      where: { id, patientId: patient.id },
      include: {
        doctor: { include: { user: true } },
        appointment: true
      }
    });
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    return res.json({ prescription });
  } catch (err) {
    console.error("getPatientPrescriptionById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
