// src/routes/patientRoutes.js
const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  listAppointments,
  updateAppointment,
  deleteAppointment
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

module.exports = router;
