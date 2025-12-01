const express = require("express");
const router = express.Router();

const doctorController = require("../controllers/doctorController");
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All doctor routes require AUTH + DOCTOR ROLE
router.use(verifyToken);
router.use(checkRole("DOCTOR"));

// Doctor APIs
router.get("/dashboard", doctorController.getDashboardStats);

// Patients
router.get("/patients", doctorController.getPatients); // list/search/paginate
router.post("/patients", doctorController.createPatient); // create
router.get("/patients/:id", doctorController.getPatientDetails); // details
router.put("/patients/:id", doctorController.updatePatient); // update
router.delete("/patients/:id", doctorController.deletePatient); // delete


router.get("/appointments", doctorController.getAppointments);
router.put("/appointments/:id", doctorController.updateAppointmentStatus);

router.post("/prescriptions", doctorController.createPrescription);
router.put("/prescriptions/:id", doctorController.updatePrescription);

router.post("/reports", doctorController.uploadReport);

module.exports = router;
