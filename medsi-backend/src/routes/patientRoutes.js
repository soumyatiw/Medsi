// src/routes/patientRoutes.js
const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  listAppointments,
  updateAppointment,
  deleteAppointment,
  getPatientPrescriptions,
  getPatientPrescriptionById
} = require('../controllers/patientController');

const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// requireToken + role guard for all patient routes
router.use(verifyToken);
router.use(checkRole("PATIENT"));

/* Dashboard */
router.get("/dashboard", getDashboardStats);

/* Appointments */
router.get("/appointments", listAppointments);
router.put("/appointments/:id", updateAppointment);
router.delete("/appointments/:id", deleteAppointment);



// listing is protected by the router.use verifyToken & checkRole
router.get("/prescriptions", getPatientPrescriptions);
router.get("/prescriptions/:id", getPatientPrescriptionById);


module.exports = router;
