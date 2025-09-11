const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  resendOTP,
  checkVerificationStatus,
  registerWithOTP
} = require('../controllers/otpController');

// OTP routes
router.post('/send', sendOTP);                           // POST /api/otp/send
router.post('/verify', verifyOTP);                       // POST /api/otp/verify
router.post('/resend', resendOTP);                       // POST /api/otp/resend
router.get('/status/:phone', checkVerificationStatus);   // GET /api/otp/status/:phone
router.post('/register', registerWithOTP);               // POST /api/otp/register

module.exports = router;
