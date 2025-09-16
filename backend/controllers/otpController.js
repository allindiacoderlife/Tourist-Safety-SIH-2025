const OTPService = require('../services/otpService');
const { User } = require('../models');

// Send OTP to phone number
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate input
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Send OTP using textflow
    const result = await OTPService.sendOTP(phone);
    

    res.status(200).json(result);

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { phone, code } = req.body;

    // Validate input
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP code are required'
      });
    }

    // Verify OTP using textflow
    const result = await OTPService.verifyOTP(phone, code);

    if (result.success) {
      // If verification successful, update user verification status
      try {
        const user = await User.findOne({ phone });
        if (user) {
          user.isVerified = true;
          await user.save();
          
          result.data.userUpdated = true;
        }
      } catch (userError) {
        console.log('User update error (non-critical):', userError.message);
      }
    }

    res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP'
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate input
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Resend OTP using textflow
    const result = await OTPService.resendOTP(phone);

    res.status(200).json(result);

  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend OTP'
    });
  }
};

// Check verification status
const checkVerificationStatus = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const isVerified = await OTPService.isPhoneVerified(phone);

    res.status(200).json({
      success: true,
      message: 'Verification status retrieved',
      data: {
        phone,
        isVerified
      }
    });

  } catch (error) {
    console.error('Check Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check verification status'
    });
  }
};

// Register user with OTP verification
const registerWithOTP = async (req, res) => {
  try {
    const { name, email, phone, country, code } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !country || !code) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // First verify the OTP
    const verificationResult = await OTPService.verifyOTP(phone, code);
    
    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Create new user with verified status
    const user = new User({
      name,
      email,
      phone,
      country,
      isVerified: true // Set to true since OTP is verified
    });

    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully with verified phone number',
      data: savedUser
    });

  } catch (error) {
    console.error('Register with OTP Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP,
  checkVerificationStatus,
  registerWithOTP
};
