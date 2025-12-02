const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* -----------------------------------------------------
   GET ALL DOCTORS
----------------------------------------------------- */
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await prisma.doctor.findMany({
            include: {
                user: true,
            },
        });

        return res.json({ doctors });
    } catch (err) {
        console.error("getDoctors error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

/* -----------------------------------------------------
   GET AVAILABLE SLOTS FOR A DOCTOR
----------------------------------------------------- */
exports.getDoctorSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const allSlot = await prisma.doctorSlot.findMany();
        console.log("All slots in DB:", allSlot);

        const slots = await prisma.doctorSlot.findMany({
            where: {
                doctorId,
                status: "AVAILABLE",
            },
            orderBy: { startTime: "asc" },
            include: {
                doctor: {
                    include: { user: true },
                },
            },
        });

        console.log("Requested doctorId:", doctorId);
        console.log("Requested doctorId:", doctorId, typeof doctorId);

        const allSlots = await prisma.doctorSlot.findMany({
            where: { doctorId },
        });
        console.log("All slots for doctor:", allSlots);

        return res.json({ slots });
    } catch (err) {
        console.error("getDoctorSlots error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

/* -----------------------------------------------------
   BOOK APPOINTMENT (Patient selects slot)
----------------------------------------------------- */
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, slotId, reason } = req.body;
        const patientId = req.user.patientId;

        if (!doctorId || !slotId || !patientId) {
            return res.status(400).json({ message: "Missing fields" });
        }

        // Get slot info (so we know appointmentDate)
        const slot = await prisma.doctorSlot.findUnique({
            where: { id: slotId }
        });

        if (!slot || slot.status !== "AVAILABLE") {
            return res.status(400).json({ message: "Slot not available" });
        }

        // Create appointment WITHOUT nested relation
        const appointment = await prisma.appointment.create({
            data: {
                doctorId,
                patientId,
                appointmentDate: slot.startTime,  // important!
                reason: reason || "",
                doctorSlot: {
                    connect: { id: slotId }
                }             // correct relation
            }
        });

        // Mark slot as booked
        await prisma.doctorSlot.update({
            where: { id: slotId },
            data: { status: "BOOKED" }
        });

        return res.json({
            message: "Appointment booked successfully",
            appointment
        });

    } catch (err) {
        console.error("bookAppointment error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
