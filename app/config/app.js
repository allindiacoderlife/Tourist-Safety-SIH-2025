// Configuration for the Tourist Safety App
export const Config = {
  // API Configuration
  API: {
    // Change this to your production API URL
    // Using local IP address instead of localhost for React Native compatibility
    BASE_URL: __DEV__ ? 'http://10.68.145.252:7001/api' : 'https://your-production-api.com/api',
    
    // Request timeout in milliseconds
    TIMEOUT: 10000,
    
    // Endpoints
    ENDPOINTS: {
      AUTH: {
        REGISTER: '/auth/register',
        COMPLETE_REGISTRATION: '/auth/complete-registration',
        LOGIN: '/auth/login',
        VERIFY_LOGIN: '/auth/verify-login',
      },
      OTP: {
        SEND: '/otp/send',
        VERIFY: '/otp/verify',
      },
      USER: {
        PROFILE: '/user',
        EMERGENCY_CONTACTS: '/user/:userId/emergency-contacts',
      }
    }
  },
  
  // App Configuration
  APP: {
    NAME: 'Tourist Safety',
    VERSION: '1.0.0',
    
    // OTP Configuration
    OTP: {
      LENGTH: 6,
      RESEND_TIMER: 60, // seconds
    },
    
    // Phone number validation
    PHONE: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 15,
      COUNTRY_CODE: '+91', // Default country code for India
    }
  },
  
  // Development settings
  DEV: {
    ENABLE_LOGS: __DEV__,
    MOCK_API: false, // Set to true to use mock responses
  }
};

export default Config;
