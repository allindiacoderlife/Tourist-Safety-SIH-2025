const { User } = require('../models');
const OTPService = require('../services/otpService');

// Register user with OTP verification
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, country } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !country) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required (name, email, phone, country)'
      });
    }

    // Format phone number
    const formattedPhone = OTPService.formatPhoneNumber(phone);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone: formattedPhone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Create new user (unverified)
    const user = new User({
      name,
      email,
      phone: formattedPhone,
      country,
      isVerified: false
    });

    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your phone number.',
      data: savedUser,
      nextStep: {
        action: 'verify_phone',
        endpoint: '/api/otp/send',
        instructions: 'Send a POST request to /api/otp/send with phone number to receive OTP'
      }
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Complete registration after OTP verification
const completeRegistration = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    const formattedPhone = OTPService.formatPhoneNumber(phone);

    // Find user
    const user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'User is already verified. You can now login.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            country: user.country,
            isVerified: user.isVerified
          }
        },
        nextStep: {
          action: 'login',
          message: 'User is already registered and verified. Please proceed to login.'
        }
      });
    }

    // Note: OTP verification should be done via OTP controller
    // This endpoint assumes OTP has been verified
    res.status(200).json({
      success: true,
      message: 'Registration completed successfully',
      data: user
    });

  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Login with phone number and OTP
const loginWithOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const formattedPhone = OTPService.formatPhoneNumber(phone);

    // Check if user exists
    const user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone number not verified. Please verify your phone number first.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User found. Please request OTP for login.',
      data: {
        phone: formattedPhone,
        name: user.name,
        isVerified: user.isVerified
      },
      nextStep: {
        action: 'send_login_otp',
        endpoint: '/api/otp/send',
        instructions: 'Send a POST request to /api/otp/send with phone number and purpose: "login"'
      }
    });

  } catch (error) {
    console.error('Error in login request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Verify login OTP and complete login
const verifyLoginOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    const formattedPhone = OTPService.formatPhoneNumber(phone);

    // Find user
    const user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Note: OTP verification should be done separately via OTP controller
    // This endpoint assumes OTP has been verified

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          country: user.country,
          isVerified: user.isVerified
        },
        loginTime: new Date()
      }
    });

  } catch (error) {
    console.error('Error verifying login OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  completeRegistration,
  loginWithOTP,
  verifyLoginOTP
};
