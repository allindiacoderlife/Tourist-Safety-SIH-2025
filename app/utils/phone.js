// Utility functions for phone number handling
import AppConfig from '../config/app';

export class PhoneUtils {
  /**
   * Format phone number to ensure consistent format
   * @param {string} phone - The phone number to format
   * @returns {string} - Formatted phone number
   */
  static formatPhoneNumber(phone) {
    if (!phone) return '';
    
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
      return AppConfig.APP.PHONE.COUNTRY_CODE + cleaned;
    }
    
    // Return as is for other formats
    return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
  }

  /**
   * Validate phone number format
   * @param {string} phone - The phone number to validate
   * @returns {object} - Validation result with isValid boolean and message
   */
  static validatePhoneNumber(phone) {
    if (!phone) {
      return {
        isValid: false,
        message: 'Phone number is required'
      };
    }

    const cleaned = phone.replace(/[^\d]/g, '');
    
    if (cleaned.length < AppConfig.APP.PHONE.MIN_LENGTH) {
      return {
        isValid: false,
        message: `Phone number must be at least ${AppConfig.APP.PHONE.MIN_LENGTH} digits`
      };
    }
    
    if (cleaned.length > AppConfig.APP.PHONE.MAX_LENGTH) {
      return {
        isValid: false,
        message: `Phone number cannot exceed ${AppConfig.APP.PHONE.MAX_LENGTH} digits`
      };
    }
    
    // Basic phone number pattern validation
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(phone)) {
      return {
        isValid: false,
        message: 'Invalid phone number format'
      };
    }
    
    return {
      isValid: true,
      message: 'Valid phone number'
    };
  }

  /**
   * Display phone number in a user-friendly format
   * @param {string} phone - The phone number to display
   * @returns {string} - Formatted display phone number
   */
  static displayPhoneNumber(phone) {
    if (!phone) return '';
    
    const formatted = this.formatPhoneNumber(phone);
    
    // For Indian numbers, format as +91 XXXXX XXXXX
    if (formatted.startsWith('+91')) {
      const number = formatted.substring(3);
      return `+91 ${number.substring(0, 5)} ${number.substring(5)}`;
    }
    
    return formatted;
  }

  /**
   * Mask phone number for privacy (show only last 4 digits)
   * @param {string} phone - The phone number to mask
   * @returns {string} - Masked phone number
   */
  static maskPhoneNumber(phone) {
    if (!phone) return '';
    
    const formatted = this.formatPhoneNumber(phone);
    
    if (formatted.length <= 4) return formatted;
    
    const lastFour = formatted.substring(formatted.length - 4);
    const masked = '*'.repeat(formatted.length - 4) + lastFour;
    
    return masked;
  }
}

export default PhoneUtils;
