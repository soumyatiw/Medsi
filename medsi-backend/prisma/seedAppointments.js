// prisma/seedAppointments.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const statuses = ["UPCOMING", "COMPLETED", "CANCELLED"];
const reasons = [
  "General Checkup",
  "Follow-up Visit",
  "Chest Pain",
  "High Blood Pressure",
  "Diabetes Consultation",
  "Routine Screening",
  "Allergy Symptoms",
  "Prescription Renewal",
  "Flu Symptoms",
  "Test Results Discussion"
];

// Generate random future/past date
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log("🌱 Seeding dummy appointment data...");

  // Fetch existing doctor + patient
  const doctor = await prisma.doctor.findFirst();
  const patient = await prisma.patient.findFirst();

  if (!doctor || !patient) {
    console.log("❌ Doctor or Patient not found. Run main seed first.");
    return;
  }

  // Create 25 dummy appointments
  const appointments = [];

  for (let i = 0; i < 25; i++) {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];

    const appointmentDate = randomDate(
      new Date("2024-01-01"),
      new Date("2026-01-01")
    );

    appointments.push({
      doctorId: doctor.id,
      patientId: patient.id,
      appointmentDate,
      reason: randomReason,
      status: randomStatus
    });
  }

  // Insert all appointments
  await prisma.appointment.createMany({
    data: appointments
  });

  console.log("✅ Dummy appointments seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
