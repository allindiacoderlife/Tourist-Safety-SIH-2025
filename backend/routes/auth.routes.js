const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  registerUser,
  completeRegistration,
  loginWithOTP,
  verifyLoginOTPWithEmail,
  verifyLoginOTPWithPhone,
} = require("../controller/auth.controller");

// Authentication routes
router.post("/register", registerUser); // POST /api/auth/register
router.post("/complete-registration", completeRegistration); // POST /api/auth/complete-registration
router.post("/login", loginWithOTP); // POST /api/auth/login
router.post("/verify-login-email", verifyLoginOTPWithEmail); // POST /api/auth/verify-login-email
router.post("/verify-login-phone", verifyLoginOTPWithPhone); // POST /api/auth/verify-login-phone

// Protected routes
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    }
  });
});

module.exports = router;
