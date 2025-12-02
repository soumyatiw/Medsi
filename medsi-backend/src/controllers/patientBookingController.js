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
----------------------------------------------------- */
exports.getDoctorSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const slots = await prisma.doctorSlot.findMany({
            where: {
                doctorId,
                status: "AVAILABLE",
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
----------------------------------------------------- */
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, slotId, reason } = req.body;

        if (!doctorId || !slotId) {
            return res.status(400).json({ message: "Missing fields" });
        }

        // ✔ Fetch the logged-in patient's record using userId from JWT
        const patient = await prisma.patient.findUnique({
            where: { userId: req.user.id }
        });

        if (!patient) {
            return res.status(400).json({ message: "Patient profile not found" });
        }

        // ✔ Check slot availability
        const slot = await prisma.doctorSlot.findUnique({
            where: { id: slotId }
        });

        if (!slot || slot.status !== "AVAILABLE") {
            return res.status(400).json({ message: "Slot not available" });
        }

        // ✔ Create appointment correctly
        const appointment = await prisma.appointment.create({
            data: {
                doctorId,
                patientId: patient.id,     // ✔ correct patient ID
                appointmentDate: slot.startTime,
                reason: reason || "",
                doctorSlot: {
                    connect: { id: slotId }
                }
            }
        });

        // ✔ Mark slot as booked
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
