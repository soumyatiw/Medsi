const express = require('express');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const router = express.Router();

// Admin-only protected route
router.get('/profile', verifyToken, checkRole('ADMIN'), (req, res) => {
  res.json({
    message: `Welcome ${req.user.email}! You are logged in as an ${req.user.role}.`,
  });
});

// example placeholder route
router.get('/users', verifyToken, checkRole('ADMIN'), (req, res) => {
  res.json({ message: 'Admin users route working' });
});

module.exports = router;

