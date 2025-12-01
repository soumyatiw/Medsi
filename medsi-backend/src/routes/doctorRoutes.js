const express = require("express");
const router = express.Router();

const doctorController = require("../controllers/doctorController");
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All doctor routes require AUTH + DOCTOR ROLE
router.use(verifyToken);
router.use(checkRole("DOCTOR"));

// Doctor APIs
router.get("/patients", doctorController.getPatients);
router.get("/patients/:id", doctorController.getPatientDetails);

router.get("/appointments", doctorController.getAppointments);
router.put("/appointments/:id", doctorController.updateAppointmentStatus);

router.post("/prescriptions", doctorController.createPrescription);
router.put("/prescriptions/:id", doctorController.updatePrescription);

router.post("/reports", doctorController.uploadReport);

module.exports = router;
