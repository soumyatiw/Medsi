// src/routes/patientRoutes.js
const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  listAppointments
} = require('../controllers/patientController');

const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All routes require PATIENT authentication ------------------------------
router.use(verifyToken);
router.use(checkRole("PATIENT"));

/* ------------------ Dashboard ------------------ */
router.get("/dashboard", getDashboardStats);
router.get(
  "/appointments",
  listAppointments
);


module.exports = router;
