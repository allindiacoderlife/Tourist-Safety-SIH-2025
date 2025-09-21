const User = require('../models/User');
const { sendRegistrationOTP, sendLoginOTP } = require('../config/email');
const { sendLoginOTPSMS } = require('../config/sms');

// Generate a random 5-digit OTP
const generateOTP = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Register user (send OTP)
const registerUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Generate OTP (in a real app, you'd send this via SMS/email)
    const otp = generateOTP();

    // For now, we'll store OTP in memory (in production, use Redis or database)
    // This is just for demonstration - implement proper OTP storage
    global.tempOTP = {
      email,
      phone,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      userData: { name, email, phone }
    };

    // Send OTP to both email and phone
    const emailResult = await sendRegistrationOTP(email, name, otp);
    let smsResult = { success: false };

    // Send SMS OTP if phone is provided
    if (phone) {
      smsResult = await sendLoginOTPSMS(phone, otp);
    }

    if (!emailResult.success && !smsResult.success) {
      console.error('Failed to send OTP to both email and SMS');
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    console.log(`Registration OTP for ${email}/${phone}: ${otp}`); // Keep for debugging

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Please check your email and phone.',
      data: {
        email,
        phone,
        otpSent: true,
        emailSent: emailResult.success,
        smsSent: smsResult.success
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Complete registration (verify OTP and create user)
const completeRegistration = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    // Check if OTP exists and is valid (can verify with either email or phone)
    if (!global.tempOTP ||
        ((email && global.tempOTP.email !== email) && (phone && global.tempOTP.phone !== phone)) ||
        global.tempOTP.otp !== otp ||
        global.tempOTP.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const { userData } = global.tempOTP;

    // Create user (no password required)
    const user = new User({
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone.trim(),
      isVerified: true // Mark as verified since OTP was confirmed
    });

    await user.save();

    // Clear temporary OTP
    delete global.tempOTP;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });
  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing registration',
      error: error.message
    });
  }
};

// Login with OTP (send OTP to email or phone)
const loginWithOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone is required'
      });
    }

    // Find user
    let user;
    if (email) {
      user = await User.findByEmail(email);
    } else {
      user = await User.findByPhone(phone);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP temporarily
    global.loginOTP = {
      userId: user._id,
      email: user.email,
      phone: user.phone,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      loginMethod: email ? 'email' : 'phone'
    };

    // Send OTP based on login method
    let emailResult = { success: false };
    let smsResult = { success: false };

    if (email) {
      // Send OTP email
      emailResult = await sendLoginOTP(email, user.name, otp);
      if (!emailResult.success) {
        console.error('Failed to send login OTP email:', emailResult.error);
      }
    } else if (phone) {
      // Send OTP SMS
      smsResult = await sendLoginOTPSMS(phone, otp);
      if (!smsResult.success) {
        console.error('Failed to send login OTP SMS:', smsResult.error);
      }
    }

    console.log(`Login OTP for ${email || phone}: ${otp}`); // Keep for debugging

    res.status(200).json({
      success: true,
      message: email ? 'OTP sent successfully. Please check your email.' : 'OTP sent successfully. Please check your phone.',
      data: {
        loginMethod: email ? 'email' : 'phone',
        otpSent: true,
        emailSent: emailResult.success,
        smsSent: smsResult.success
      }
    });
  } catch (error) {
    console.error('Error sending login OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending login OTP',
      error: error.message
    });
  }
};

// Verify login OTP with email
const verifyLoginOTPWithEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists and is valid
    if (!global.loginOTP ||
        global.loginOTP.email !== email ||
        global.loginOTP.otp !== otp ||
        global.loginOTP.expiresAt < Date.now() ||
        global.loginOTP.loginMethod !== 'email') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const user = await User.findById(global.loginOTP.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clear temporary OTP
    delete global.loginOTP;

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Error verifying login OTP with email:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying login OTP',
      error: error.message
    });
  }
};

// Verify login OTP with phone
const verifyLoginOTPWithPhone = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Check if OTP exists and is valid
    if (!global.loginOTP ||
        global.loginOTP.phone !== phone ||
        global.loginOTP.otp !== otp ||
        global.loginOTP.expiresAt < Date.now() ||
        global.loginOTP.loginMethod !== 'phone') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const user = await User.findById(global.loginOTP.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clear temporary OTP
    delete global.loginOTP;

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Error verifying login OTP with phone:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying login OTP',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  completeRegistration,
  loginWithOTP,
  verifyLoginOTPWithEmail,
  verifyLoginOTPWithPhone
};