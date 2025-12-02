const prisma = require("../config/prismaClient");

/* --------------------------------------------------------------
   PATIENT DASHBOARD STATS 
   - appointments count
   - prescriptions count
   - reports count
---------------------------------------------------------------*/
exports.getDashboardStats = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id }
    });

    if (!patient) {
      return res.status(403).json({ message: "Patient profile not found" });
    }

    const appointments = await prisma.appointment.count({
      where: { patientId: patient.id }
    });

    const prescriptions = await prisma.prescription.count({
      where: { patientId: patient.id }
    });

    const reports = await prisma.report.count({
      where: { patientId: patient.id }
    });

    return res.json({
      appointments,
      prescriptions,
      reports
    });

  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};


exports.listAppointments = async (req, res) => {
  try {
    // STEP 1 — Find patient by userId
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id }
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    // STEP 2 — Fetch appointments using patient.id
    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          include: { user: true }
        },
        doctorSlot: true
      },
      orderBy: { appointmentDate: "asc" }
    });

    return res.json({ appointments });

  } catch (error) {
    console.error("listAppointments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

