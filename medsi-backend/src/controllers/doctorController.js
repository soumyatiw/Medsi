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

    // Count patients
    const patientsCount = await prisma.doctorPatient.count({
      where: { doctorId: doctor.id }
    });

    // Count appointments
    const appointmentsCount = await prisma.appointment.count({
      where: { doctorId: doctor.id }
    });

    // Count doctor slots
    const slotsCount = await prisma.doctorSlot.count({
      where: { doctorId: doctor.id }
    });

    // Count reports
    const reportsCount = await prisma.report.count({
      where: { doctorId: doctor.id }
    });

    return res.json({
      patients: patientsCount,
      appointments: appointmentsCount,
      slots: slotsCount,
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


/* ---------------------------------------------------------
   GET ALL APPOINTMENTS (FILTER + PAGINATION)
--------------------------------------------------------- */
exports.getAppointments = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor)
      return res.status(403).json({ message: "Doctor profile not found" });

    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const status = req.query.status || "";
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const filters = {
      doctorId: doctor.id,
    };

    if (status) filters.status = status;

    const total = await prisma.appointment.count({
      where: filters,
    });

    const appointments = await prisma.appointment.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { appointmentDate: "desc" },
      include: {
        patient: {
          include: { user: true }
        }
      }
    });

    // Apply search filter manually (Mongo + Prisma limitation)
    const filtered = search
      ? appointments.filter(a =>
          a.patient.user.name.toLowerCase().includes(search.toLowerCase()) ||
          a.patient.user.email.toLowerCase().includes(search.toLowerCase())
        )
      : appointments;

    res.json({
      data: filtered,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error("getAppointments error:", err);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

/* ---------------------------------------------------------
   UPDATE APPOINTMENT STATUS
--------------------------------------------------------- */
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor)
      return res.status(403).json({ message: "Doctor profile not found" });

    const { id } = req.params;
    const { status } = req.body;

    if (!["UPCOMING", "COMPLETED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await prisma.appointment.findUnique({ where: { id } });

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (appointment.doctorId !== doctor.id)
      return res.status(403).json({ message: "Not your appointment" });

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    res.json({
      message: "Status updated",
      appointment: updated,
    });

  } catch (err) {
    console.error("updateAppointmentStatus error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/* ---------------------------------------------------------
   DELETE APPOINTMENT
--------------------------------------------------------- */
exports.deleteAppointment = async (req, res) => {
  try {
    const doctor = await getDoctorFromUser(req.user.id);
    if (!doctor)
      return res.status(403).json({ message: "Doctor profile not found" });

    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({ where: { id } });

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (appointment.doctorId !== doctor.id)
      return res.status(403).json({ message: "Not your appointment" });

    await prisma.appointment.delete({ where: { id } });

    res.json({ message: "Appointment deleted" });

  } catch (err) {
    console.error("deleteAppointment error:", err);
    res.status(500).json({ message: "Failed to delete appointment" });
  }
};

/* ---------------------------------------------------------*/
exports.addOrUpdatePrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { diagnosis, medicines, notes } = req.body;

    if (!diagnosis || (!medicines || medicines.length === 0)) {
      return res.status(400).json({ message: "Diagnosis and medicines are required" });
    }

    // Find doctor profile for logged-in user
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.id }
    });
    if (!doctor) return res.status(403).json({ message: "Doctor profile not found" });

    // Find appointment and ensure doctor owns it
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.doctorId !== doctor.id) {
      return res.status(403).json({ message: "You are not allowed to add prescription to this appointment" });
    }

    // Normalize medicines: accept array or comma-separated string
    let meds = medicines;
    if (!Array.isArray(meds)) {
      // If a string like "Paracetamol - 500mg, Vitamin C" => convert to array
      if (typeof meds === "string") {
        meds = meds.split(",").map((m) => m.trim()).filter(Boolean);
      } else {
        meds = [];
      }
    }

    // Upsert by appointmentId (appointmentId is unique in Prescription model)
    const prescription = await prisma.prescription.upsert({
      where: { appointmentId },
      update: {
        diagnosis,
        medicines: meds,
        notes: notes ?? null,
        doctorId: doctor.id,
        patientId: appointment.patientId,
      },
      create: {
        appointmentId,
        diagnosis,
        medicines: meds,
        notes: notes ?? null,
        doctorId: doctor.id,
        patientId: appointment.patientId,
      },
    });

    return res.json({ message: "Prescription saved", prescription });
  } catch (err) {
    console.error("addOrUpdatePrescription error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.getSingleAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true
          }
        },
        doctor: {
          include: {
            user: true
          }
        },
        prescription: true,
        doctorSlot: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.json({ appointment });
  } catch (err) {
    console.error("getSingleAppointment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
