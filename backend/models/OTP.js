const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: [15, 'Phone number cannot exceed 15 characters']
  },
  otp: {
    type: String,
    required: false, // Optional when using textflow.js
    length: 6
  },
  otpHash: {
    type: String,
    required: false // Optional when using textflow.js
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    index: { expireAfterSeconds: 0 } // TTL index - automatically delete expired documents
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5 // Maximum 5 attempts
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  purpose: {
    type: String,
    enum: ['registration', 'login', 'password_reset', 'phone_verification'],
    default: 'phone_verification'
  }
}, {
  timestamps: true,
  collection: 'otps'
});

// Indexes for better performance (avoiding duplicates)
otpSchema.index({ phone: 1, purpose: 1 });

// Static method to clean up expired OTPs
otpSchema.statics.cleanupExpired = function() {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

// Instance method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Instance method to check if OTP attempts exceeded
otpSchema.methods.isAttemptsExceeded = function() {
  return this.attempts >= 5;
};

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
