const express = require('express');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', verifyToken, checkRole('PATIENT'), (req, res) => {
  res.json({
    message: `Welcome ${req.user.email}! You are logged in as a ${req.user.role}.`,
  });
});

module.exports = router;

