const express = require("express");
const router = express.Router();

const doctorController = require("../controllers/doctorController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

// Auth middleware
router.use(verifyToken);
router.use(checkRole("DOCTOR"));

/* ------------------ Patient Routes ------------------ */
router.get("/dashboard", doctorController.getDashboardStats);
// Get all linked patients
router.get("/patients", doctorController.getDoctorPatients);

// Get single linked patient
router.get("/patients/:id", doctorController.getDoctorPatientById);

// Create OR link patient
router.post("/patients", doctorController.createPatientAndLink);

// Link existing patient
router.post("/patients/link", doctorController.linkExistingPatientToDoctor);

// Update linked patient
router.put("/patients/:id", doctorController.updatePatient);

// Unlink patient
router.delete("/patients/:id", doctorController.deletePatient);


router.post(
  "/appointments/:appointmentId/prescription",
  doctorController.addOrUpdatePrescription // OR addOrUpdatePrescription if you exported separately
);

/* ------------------ Appointment Routes ------------------ */

// Get appointments (with filters & pagination)
router.get("/appointments", doctorController.getAppointments);
router.delete("/appointments/:id", doctorController.deleteAppointment);
// Update appointment status
router.put("/appointments/:id/status", doctorController.updateAppointmentStatus);

router.get("/appointments/:id", doctorController.getSingleAppointment);

module.exports = router;
