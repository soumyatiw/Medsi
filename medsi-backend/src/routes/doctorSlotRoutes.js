const express = require("express");
const router = express.Router();

const { verifyToken, checkRole } = require("../middleware/authMiddleware");
const slotController = require("../controllers/doctorSlotController");

// All doctor slot routes require authentication
router.use(verifyToken);
router.use(checkRole("DOCTOR"));

// AUTO EXPIRE SLOTS BEFORE ANY RESPONSE
router.use(async (req, res, next) => {
  await slotController.expireOldSlots();
  next();
});

/* CRUD Routes */
router.post("/create", slotController.createSlot);
router.get("/", slotController.getSlots);
router.get("/available", slotController.getAvailableSlots);
router.delete("/:id", slotController.deleteSlot);

module.exports = router;
