const textflow = require('textflow.js');
const OTP = require('../models/OTP');

// Initialize textflow with API key
if (process.env.TEXTFLOW_API_KEY) {
  textflow.useKey(process.env.TEXTFLOW_API_KEY);
} else {
  console.warn('TEXTFLOW_API_KEY not found in environment variables');
}

class OTPService {
  
  // Format phone number to ensure consistent format
  static formatPhoneNumber(phone) {
    if (!phone) return null;
    
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it starts with +91, keep as is
    if (cleaned.startsWith('+91')) {
      return cleaned;
    }
    
    // If it starts with 91, add +
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return '+' + cleaned;
    }
    
    // If it starts with +, keep as is (for international numbers)
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // If it's a 10-digit Indian number, add +91
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      return '+91' + cleaned;
    }
    
    // Return as is for other formats
    return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
  }
  
  // Send OTP using textflow
  static async sendOTP(phone, purpose = 'phone_verification') {
    try {
      // Clean up old OTPs for this phone number
      await OTP.deleteMany({ 
        phone, 
        $or: [
          { expiresAt: { $lt: new Date() } },
          { isUsed: true }
        ]
      });
      
      // Check rate limiting - max 3 OTP requests per minute
      // For simplicity, we'll skip database rate limiting with textflow
      // textflow.js has its own rate limiting

      // Verification options for textflow
      const verificationOptions = {
        service_name: "Tourist Safety",
        seconds: (process.env.OTP_EXPIRE_TIME || 10) * 60 // Convert minutes to seconds
      };

      let result;
      
      // Development mode fallback
      if (!process.env.TEXTFLOW_API_KEY) {
        console.log(`[DEV MODE] OTP would be sent to ${phone}`);
        result = { ok: true, id: 'dev-mode-' + Date.now() };
      } else {
        // Send verification SMS using textflow
        result = await textflow.sendVerificationSMS(phone, verificationOptions);
      }
      
      if (result.ok) {
        // For textflow.js, we don't need to store OTP records on send
        // Only track rate limiting through recent attempts

        return {
          success: true,
          message: 'OTP sent successfully',
          data: {
            phone,
            expiresIn: process.env.OTP_EXPIRE_TIME || 10,
            messageId: result.id || 'sent'
          }
        };
      } else {
        throw new Error(result.message || 'Failed to send OTP');
      }

    } catch (error) {
      console.error('OTP Send Error:', error);
      throw error;
    }
  }

  // Verify OTP using textflow
  static async verifyOTP(phone, code) {
    try {
      let result;
      
      // Development mode fallback
      if (!process.env.TEXTFLOW_API_KEY) {
        console.log(`[DEV MODE] Verifying OTP ${code} for ${phone}`);
        // In dev mode, accept 123456 as valid OTP
        result = { valid: code === '123456' };
      } else {
        // Verify OTP with textflow
        result = await textflow.verifyCode(phone, code);
      }

      if (result.valid) {
        // Create a verification record for successful verification
        const verificationRecord = new OTP({
          phone,
          purpose: 'phone_verification',
          expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)), // 24 hours
          isUsed: true,
          attempts: 1,
          otp: code, // Store the verified code
          otpHash: 'verified' // Mark as verified
        });

        await verificationRecord.save();

        return {
          success: true,
          message: 'OTP verified successfully',
          data: {
            phone,
            verified: true,
            verifiedAt: new Date()
          }
        };
      } else {
        return {
          success: false,
          message: 'Invalid OTP code'
        };
      }

    } catch (error) {
      console.error('OTP Verification Error:', error);
      throw error;
    }
  }

  // Resend OTP
  static async resendOTP(phone) {
    try {
      // Delete existing OTP records for this phone
      await OTP.deleteMany({ phone });
      
      // Send new OTP
      return await this.sendOTP(phone);
    } catch (error) {
      console.error('OTP Resend Error:', error);
      throw error;
    }
  }

  // Check if phone number is verified
  static async isPhoneVerified(phone) {
    try {
      const verifiedOTP = await OTP.findOne({
        phone,
        isUsed: true,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24 hours
      });

      return !!verifiedOTP;
    } catch (error) {
      console.error('Phone Verification Check Error:', error);
      return false;
    }
  }

  // Clean up expired OTPs (can be used in a cron job)
  static async cleanupExpiredOTPs() {
    try {
      const result = await OTP.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      console.log(`Cleaned up ${result.deletedCount} expired OTP records`);
      return result;
    } catch (error) {
      console.error('OTP Cleanup Error:', error);
      throw error;
    }
  }
}

module.exports = OTPService;
