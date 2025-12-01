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

module.exports = router;
