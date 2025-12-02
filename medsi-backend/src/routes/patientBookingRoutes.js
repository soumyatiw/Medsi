const express = require("express");
const router = express.Router();

const {
  getDoctors,
  getDoctorSlots,
  bookAppointment,
} = require("../controllers/patientBookingController");

const { verifyToken, checkRole } = require("../middleware/authMiddleware");

router.get(
  "/doctors",
  verifyToken,
  checkRole("PATIENT"),
  getDoctors
);

router.get(
  "/doctors/:doctorId/slots",
  verifyToken,
  checkRole("PATIENT"),
  getDoctorSlots
);

router.post(
  "/appointments",
  verifyToken,
  checkRole("PATIENT"),
  bookAppointment
);

module.exports = router;
