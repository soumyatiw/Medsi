const express = require('express');
const {
  signup,
  login,
  refresh,
  logout,
} = require('../controllers/authController');

const router = express.Router();

// use real controller functions now
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;

