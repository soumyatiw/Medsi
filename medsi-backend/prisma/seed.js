const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password for all users
  const passwordHash = await bcrypt.hash('123456', 10);

  // --- Admin ---
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@medsi.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  // --- Doctor ---
  const doctorUser = await prisma.user.create({
    data: {
      name: 'Dr. Meena Sharma',
      email: 'doctor@medsi.com',
      password: passwordHash,
      role: 'DOCTOR',
      doctor: {
        create: {
          specialization: 'Cardiology',
          licenseNo: 'DOC12345',
        },
      },
    },
    include: { doctor: true },
  });

  // --- Patient ---
  const patientUser = await prisma.user.create({
    data: {
      name: 'Soumya Tiwari',
      email: 'patient@medsi.com',
      password: passwordHash,
      role: 'PATIENT',
      patient: {
        create: {
          gender: 'Female',
          bloodGroup: 'B+',
          medicalNotes: 'No known allergies.',
        },
      },
    },
    include: { patient: true },
  });

  console.log('✅ Seeding completed!');
  console.log({ admin, doctorUser, patientUser });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
