const prisma = require("../config/prismaClient");
const bcrypt = require("bcrypt");

/* ---------------------------------------------------------
   Helper: Get doctor record for logged-in user
--------------------------------------------------------- */
async function getDoctorFromUser(userId) {
  return prisma.doctor.findUnique({
    where: { userId }
  });
}

exports.getDashboardStats = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.id }
    });

    if (!doctor) {
      return res.status(403).json({ message: "Doctor profile not found" });
    }

    // Count only THIS doctor's patients via linking table
    const patientsCount = await prisma.doctorPatient.count({
      where: { doctorId: doctor.id }
    });

    // Count only this doctor's appointments
    const appointmentsCount = await prisma.appointment.count({
      where: { doctorId: doctor.id }
    });

    // Count only prescriptions written by this doctor
    const prescriptionsCount = await prisma.prescription.count({
      where: { doctorId: doctor.id }
    });

    // Count only reports uploaded by this doctor OR belonging to their linked patients
    const reportsCount = await prisma.report.count({
      where: {
        OR: [
          { doctorId: doctor.id }, // uploaded by doctor
          {
            patientId: {
              in: (
                await prisma.doctorPatient.findMany({
                  where: { doctorId: doctor.id },
                  select: { patientId: true }
                })
              ).map(r => r.patientId)
            }
          }
        ]
      }
    });

    return res.json({
      patients: patientsCount,
      appointments: appointmentsCount,
      prescriptions: prescriptionsCount,
      reports: reportsCount,
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);
    return res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
};


/* ---------------------------------------------------------
   CREATE + LINK PATIENT
   - If user exists → create patient profile if missing → link
   - If user doesn't exist → create user + patient → link
--------------------------------------------------------- */
exports.createPatientAndLink = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor)
      return res.status(403).json({ message: "Doctor profile not found" });

    const { name, email, dob, gender, bloodGroup, medicalNotes, password } =
      req.body;

    let existingUser = await prisma.user.findUnique({ where: { email } });

    /* ------------------------- USER EXISTS ------------------------- */
    if (existingUser) {
      let patient = await prisma.patient.findUnique({
        where: { userId: existingUser.id },
      });

      if (!patient) {
        // Create missing patient profile
        patient = await prisma.patient.create({
          data: {
            userId: existingUser.id,
            dob: dob ? new Date(dob) : null,
            gender,
            bloodGroup,
            medicalNotes,
          },
        });
      }

      // Link to doctor
      const existingLink = await prisma.doctorPatient.findFirst({
        where: { doctorId: doctor.id, patientId: patient.id },
      });

      if (!existingLink) {
        await prisma.doctorPatient.create({
          data: { doctorId: doctor.id, patientId: patient.id },
        });
      }

      return res
        .status(200)
        .json({ message: "Existing patient linked", patient });
    }

    /* ------------------------- USER DOES NOT EXIST ------------------------- */
    const tempPass = password || Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(tempPass, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashed, role: "PATIENT" },
    });

    const newPatient = await prisma.patient.create({
      data: {
        userId: newUser.id,
        dob: dob ? new Date(dob) : null,
        gender,
        bloodGroup,
        medicalNotes,
      },
    });

    await prisma.doctorPatient.create({
      data: { doctorId: doctor.id, patientId: newPatient.id },
    });

    res.status(201).json({
      message: "Patient created and linked",
      patient: newPatient,
      tempPassword: tempPass,
    });
  } catch (err) {
    console.error("createPatientAndLink error:", err);
    res.status(500).json({ message: "Failed to create patient" });
  }
};

/* ---------------------------------------------------------
   LINK EXISTING PATIENT
--------------------------------------------------------- */
exports.linkExistingPatientToDoctor = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor)
      return res.status(403).json({ message: "Doctor profile not found" });

    const { patientId, email } = req.body;

    let patient;

    if (patientId) {
      patient = await prisma.patient.findUnique({ where: { id: patientId } });
    } else if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        patient = await prisma.patient.findUnique({
          where: { userId: user.id },
        });
      }
    }

    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    const exists = await prisma.doctorPatient.findFirst({
      where: { doctorId: doctor.id, patientId: patient.id },
    });

    if (exists) return res.json({ message: "Already linked", patient });

    await prisma.doctorPatient.create({
      data: { doctorId: doctor.id, patientId: patient.id },
    });

    res.status(201).json({ message: "Patient linked", patient });
  } catch (err) {
    console.error("linkExistingPatientToDoctor err:", err);
    res.status(500).json({ message: "Failed to link patient" });
  }
};

/* ---------------------------------------------------------
   GET DOCTOR'S PATIENTS (search + pagination)
--------------------------------------------------------- */
exports.getDoctorPatients = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor)
      return res.status(403).json({ message: "Doctor profile not found" });

    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const whereFilter = search
      ? {
          OR: [
            { user: { name: { contains: search, mode: "insensitive" } } },
            { user: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    const total = await prisma.doctorPatient.count({
      where: { doctorId: doctor.id, patient: whereFilter },
    });

    const links = await prisma.doctorPatient.findMany({
      where: { doctorId: doctor.id, patient: whereFilter },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          include: {
            user: true,
            appointments: true,
            reports: true,
            prescriptions: true,
          },
        },
      },
    });

    const patients = links.map((l) => l.patient);

    res.json({
      data: patients,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getDoctorPatients err:", err);
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};

/* ---------------------------------------------------------
   GET SINGLE PATIENT IF LINKED
--------------------------------------------------------- */
exports.getDoctorPatientById = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor)
      return res.status(403).json({ message: "Doctor profile not found" });

    const { id } = req.params;

    const link = await prisma.doctorPatient.findFirst({
      where: { doctorId: doctor.id, patientId: id },
      include: {
        patient: {
          include: {
            user: true,
            appointments: {
              include: { doctor: { include: { user: true } } },
            },
            prescriptions: {
              include: { doctor: { include: { user: true } } },
            },
            reports: true,
          },
        },
      },
    });

    if (!link)
      return res
        .status(404)
        .json({ message: "Patient not linked to this doctor" });

    res.json({ patient: link.patient });
  } catch (err) {
    console.error("getDoctorPatientById err:", err);
    res.status(500).json({ message: "Failed to fetch patient" });
  }
};

/* ---------------------------------------------------------
   UPDATE PATIENT (only if linked)
--------------------------------------------------------- */
exports.updatePatient = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor)
      return res.status(403).json({ message: "Doctor profile not found" });

    const patientId = req.params.id;

    const link = await prisma.doctorPatient.findFirst({
      where: { doctorId: doctor.id, patientId },
    });

    if (!link)
      return res
        .status(403)
        .json({ message: "You are not linked to this patient" });

    const { name, email, dob, gender, bloodGroup, medicalNotes } = req.body;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    // Update user table
    if (name || email) {
      const updateUser = {};
      if (name) updateUser.name = name;
      if (email) {
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists && exists.id !== patient.userId) {
          return res.status(409).json({ message: "Email already in use" });
        }
        updateUser.email = email;
      }
      await prisma.user.update({
        where: { id: patient.userId },
        data: updateUser,
      });
    }

    // Update patient table
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        dob: dob ? new Date(dob) : undefined,
        gender: gender ?? undefined,
        bloodGroup: bloodGroup ?? undefined,
        medicalNotes: medicalNotes ?? undefined,
      },
      include: { user: true },
    });

    res.json({ message: "Patient updated", patient: updatedPatient });
  } catch (err) {
    console.error("updatePatient err:", err);
    res.status(500).json({ message: "Failed to update patient" });
  }
};

/* ---------------------------------------------------------
   DELETE PATIENT LINK ONLY
   (doctor cannot delete patient account)
--------------------------------------------------------- */
exports.deletePatient = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor)
      return res.status(403).json({ message: "Doctor profile not found" });

    const patientId = req.params.id;

    const link = await prisma.doctorPatient.findFirst({
      where: { doctorId: doctor.id, patientId },
    });

    if (!link)
      return res
        .status(404)
        .json({ message: "Patient is not linked to this doctor" });

    await prisma.doctorPatient.delete({ where: { id: link.id } });

    res.json({ message: "Patient unlinked successfully" });
  } catch (err) {
    console.error("deletePatient err:", err);
    res.status(500).json({ message: "Failed to unlink patient" });
  }
};
