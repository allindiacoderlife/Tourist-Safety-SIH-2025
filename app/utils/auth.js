// Authentication flow utilities
import { AuthAPI } from '../services/api';
import { PhoneUtils } from './phone';

export class AuthFlowUtils {
  /**
   * Check if a phone number is already registered
   * @param {string} phone - Phone number to check
   * @returns {Promise<object>} - Registration status and user info
   */
  static async checkRegistrationStatus(phone) {
    try {
      const formattedPhone = PhoneUtils.formatPhoneNumber(phone);
      
      // Try to initiate login to check if user exists
      await AuthAPI.login(formattedPhone);
      
      return {
        exists: true,
        isVerified: true,
        phone: formattedPhone,
        shouldLogin: true,
        message: 'User is already registered. Please login.'
      };
      
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('Please register')) {
        return {
          exists: false,
          isVerified: false,
          phone: PhoneUtils.formatPhoneNumber(phone),
          shouldLogin: false,
          message: 'Phone number is not registered. Please register first.'
        };
      } else if (error.message.includes('not verified')) {
        return {
          exists: true,
          isVerified: false,
          phone: PhoneUtils.formatPhoneNumber(phone),
          shouldLogin: false,
          message: 'Phone number is registered but not verified. Please verify your phone number.'
        };
      }
      
      // For other errors, assume user doesn't exist
      return {
        exists: false,
        isVerified: false,
        phone: PhoneUtils.formatPhoneNumber(phone),
        shouldLogin: false,
        message: 'Unable to check registration status. Please try registering.'
      };
    }
  }

  /**
   * Determine the appropriate authentication flow for a phone number
   * @param {string} phone - Phone number to check
   * @returns {Promise<object>} - Recommended flow and actions
   */
  static async getRecommendedFlow(phone) {
    const status = await this.checkRegistrationStatus(phone);
    
    if (status.exists && status.isVerified) {
      return {
        flow: 'login',
        title: 'Welcome Back',
        message: 'Please verify your phone number to login.',
        primaryAction: 'Send Login OTP',
        secondaryAction: 'Register New Account'
      };
    } else if (status.exists && !status.isVerified) {
      return {
        flow: 'verify-registration',
        title: 'Verify Phone Number',
        message: 'Your account exists but phone number is not verified.',
        primaryAction: 'Send Verification OTP',
        secondaryAction: 'Login with Different Number'
      };
    } else {
      return {
        flow: 'register',
        title: 'Create New Account',
        message: 'This phone number is not registered.',
        primaryAction: 'Register',
        secondaryAction: 'Login Existing Account'
      };
    }
  }

  /**
   * Validate if user can proceed with registration
   * @param {object} formData - Registration form data
   * @returns {Promise<object>} - Validation result
   */
  static async validateRegistrationData(formData) {
    const phoneValidation = PhoneUtils.validatePhoneNumber(formData.phone);
    if (!phoneValidation.isValid) {
      return {
        isValid: false,
        field: 'phone',
        message: phoneValidation.message
      };
    }

    if (!formData.name || formData.name.trim().length < 2) {
      return {
        isValid: false,
        field: 'name',
        message: 'Name must be at least 2 characters long'
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      return {
        isValid: false,
        field: 'email',
        message: 'Please enter a valid email address'
      };
    }

    if (!formData.country || formData.country.trim().length < 2) {
      return {
        isValid: false,
        field: 'country',
        message: 'Please enter your country'
      };
    }

    // Check if phone is already registered
    const regStatus = await this.checkRegistrationStatus(formData.phone);
    if (regStatus.exists) {
      return {
        isValid: false,
        field: 'phone',
        message: 'This phone number is already registered. Please login instead.',
        shouldSwitchToLogin: true
      };
    }

    return {
      isValid: true,
      message: 'Registration data is valid'
    };
  }
}

export default AuthFlowUtils;
