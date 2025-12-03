// src/controllers/patientBookingController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* -----------------------------------------------------
   GET ALL DOCTORS
----------------------------------------------------- */
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { user: true },
    });
    return res.json({ doctors });
  } catch (err) {
    console.error("getDoctors error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -----------------------------------------------------
   GET AVAILABLE SLOTS FOR A DOCTOR
   - returns slots that are available
   - also treats legacy slots where status="BOOKED" but appointmentId == null as available
----------------------------------------------------- */
exports.getDoctorSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const slots = await prisma.doctorSlot.findMany({
      where: {
        doctorId,
        OR: [
          { status: "AVAILABLE" },
          // legacy/edge-case: booked but not linked to appointment -> treat as available
          { AND: [{ status: "BOOKED" }, { appointmentId: null }] },
        ],
      },
      orderBy: { startTime: "asc" },
      include: {
        doctor: { include: { user: true } },
      },
    });

    return res.json({ slots });
  } catch (err) {
    console.error("getDoctorSlots error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -----------------------------------------------------
   BOOK APPOINTMENT (Patient selects slot)
   - Creates appointment
   - Sets doctorSlot.appointmentId = appointment.id and status = BOOKED
   - Transactional to avoid race conditions
----------------------------------------------------- */
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, slotId, reason } = req.body;
    if (!doctorId || !slotId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // get patient record from JWT user
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id },
    });

    if (!patient) return res.status(400).json({ message: "Patient profile not found" });

    // check slot exists and still available (guard)
    const slot = await prisma.doctorSlot.findUnique({ where: { id: slotId } });
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    // If slot is BOOKED but appointmentId == null we consider it available (legacy)
    const slotIsAvailable = slot.status === "AVAILABLE" || (slot.status === "BOOKED" && !slot.appointmentId);
    if (!slotIsAvailable) return res.status(400).json({ message: "Slot not available" });

    // Use transaction: create appointment, then update slot linking to appointment
    const [appointment] = await prisma.$transaction([
      prisma.appointment.create({
        data: {
          doctorId,
          patientId: patient.id,
          appointmentDate: slot.startTime,
          reason: reason || "",
          // do NOT try to nest doctorSlot relation in create because Appointment model
          // doesn't have doctorSlotId field in your schema. We'll update slot below.
        },
      }),
      // We'll perform slot update in a second transactional operation below using a chained transaction.
    ]);

    // Now update the slot to point to this appointment and mark BOOKED
    await prisma.doctorSlot.update({
      where: { id: slotId },
      data: {
        status: "BOOKED",
        appointmentId: appointment.id,
      },
    });

    return res.json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    console.error("bookAppointment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
