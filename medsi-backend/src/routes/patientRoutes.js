// src/routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  listAppointments,
  bookAppointment,
  updateAppointment,
  listPrescriptions,
  listReports
} = require('../controllers/patientController');

const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All patient routes require authentication and PATIENT role
router.get('/profile', verifyToken, checkRole('PATIENT'), getProfile);
router.put('/profile', verifyToken, checkRole('PATIENT'), updateProfile);

router.get('/appointments', verifyToken, checkRole('PATIENT'), listAppointments);
router.post('/appointments', verifyToken, checkRole('PATIENT'), bookAppointment);
router.put('/appointments/:id', verifyToken, checkRole('PATIENT'), updateAppointment);

router.get('/prescriptions', verifyToken, checkRole('PATIENT'), listPrescriptions);

router.get('/reports', verifyToken, checkRole('PATIENT'), listReports);

module.exports = router;
