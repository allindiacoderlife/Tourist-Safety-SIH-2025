const express = require('express');
const router = express.Router();
const {
  registerUser,
  completeRegistration,
  loginWithOTP,
  verifyLoginOTP
} = require('../controllers/authController');

// Authentication routes
router.post('/register', registerUser);              // POST /api/auth/register
router.post('/complete-registration', completeRegistration); // POST /api/auth/complete-registration
router.post('/login', loginWithOTP);                 // POST /api/auth/login
router.post('/verify-login', verifyLoginOTP);        // POST /api/auth/verify-login

module.exports = router;
