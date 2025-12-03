const prisma = require("../config/prismaClient");

/* -----------------------------------------------------
   Helper to get doctor from logged-in user
----------------------------------------------------- */
async function getDoctor(userId) {
  return prisma.doctor.findUnique({ where: { userId } });
}

/* -----------------------------------------------------
   CREATE SLOT
----------------------------------------------------- */
exports.createSlot = async (req, res) => {
  try {
    const doctor = await getDoctor(req.user.id);
    if (!doctor) return res.status(403).json({ message: "Doctor not found" });

    const { startTime, endTime, duration } = req.body;

    if (!startTime || !endTime || !duration) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const slot = await prisma.doctorSlot.create({
      data: {
        doctorId: doctor.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: Number(duration),
        status: "AVAILABLE",
      },
    });

    res.status(201).json({ message: "Slot created", slot });
  } catch (err) {
    console.error("createSlot err:", err);
    res.status(500).json({ message: "Failed to create slot" });
  }
};

/* -----------------------------------------------------
   GET ALL SLOTS (with appointment manually attached)
----------------------------------------------------- */
exports.getSlots = async (req, res) => {
  try {
    const doctor = await getDoctor(req.user.id);
    if (!doctor) return res.status(403).json({ message: "Doctor not found" });

    // 1) Fetch slots WITHOUT relations
    const rawSlots = await prisma.doctorSlot.findMany({
      where: { doctorId: doctor.id },
      orderBy: { startTime: "asc" },
    });

    // 2) Manually add appointment (safe on Render)
    const slots = await Promise.all(
      rawSlots.map(async (slot) => {
        if (!slot.appointmentId) return { ...slot, appointment: null };

        const appt = await prisma.appointment.findUnique({
          where: { id: slot.appointmentId },
          include: {
            patient: {
              include: { user: true }
            }
          }
        });

        return { ...slot, appointment: appt };
      })
    );

    res.json({ slots });
  } catch (err) {
    console.error("getSlots err:", err);
    res.status(500).json({ message: "Failed to fetch slots" });
  }
};

/* -----------------------------------------------------
   GET ONLY AVAILABLE SLOTS
----------------------------------------------------- */
exports.getAvailableSlots = async (req, res) => {
  try {
    const doctor = await getDoctor(req.user.id);
    if (!doctor) return res.status(403).json({ message: "Doctor not found" });

    const now = new Date();

    const slots = await prisma.doctorSlot.findMany({
      where: {
        doctorId: doctor.id,
        status: "AVAILABLE",
        startTime: { gte: now },
      },
      orderBy: { startTime: "asc" },
    });

    res.json({ slots });
  } catch (err) {
    console.error("getAvailableSlots err:", err);
    res.status(500).json({ message: "Failed to fetch available slots" });
  }
};

/* -----------------------------------------------------
   DELETE SLOT (even if booked → FIXED)
----------------------------------------------------- */
exports.deleteSlot = async (req, res) => {
  try {
    const doctor = await getDoctor(req.user.id);
    if (!doctor) return res.status(403).json({ message: "Doctor not found" });

    const slotId = req.params.id;

    const slot = await prisma.doctorSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.doctorId !== doctor.id)
      return res.status(403).json({ message: "Not your slot" });

    // If slot is booked → free appointment & delete slot
    if (slot.appointmentId) {
      await prisma.appointment.delete({
        where: { id: slot.appointmentId }
      });
    }

    await prisma.doctorSlot.delete({ where: { id: slotId } });

    res.json({ message: "Slot deleted" });
  } catch (err) {
    console.error("deleteSlot err:", err);
    res.status(500).json({ message: "Failed to delete slot" });
  }
};

/* -----------------------------------------------------
   AUTO EXPIRE SLOTS
----------------------------------------------------- */
exports.expireOldSlots = async () => {
  const now = new Date();

  await prisma.doctorSlot.updateMany({
    where: {
      endTime: { lt: now },
      status: "AVAILABLE",
    },
    data: { status: "EXPIRED" },
  });
};
