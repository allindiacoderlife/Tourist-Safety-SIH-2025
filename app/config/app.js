// Configuration for the Tourist Safety App
export const Config = {
  // API Configuration
  API: {
    // Change this to your production API URL
    // Using local IP address instead of localhost for React Native compatibility
    // BASE_URL: __DEV__ ? 'http://192.168.1.7:7001/api' : 'https://sih-backend.allindiacoderlife.tech/api',
    BASE_URL: 'https://sih-backend.allindiacoderlife.tech/api',
    // BASE_URL: 'http://192.168.1.7:7001/api',
    
    // Request timeout in milliseconds
    TIMEOUT: 10000,

    // Endpoints - Updated to match new backend
    ENDPOINTS: {
      AUTH: {
        REGISTER: '/auth/register',
        COMPLETE_REGISTRATION: '/auth/complete-registration',
        LOGIN: '/auth/login',
        VERIFY_LOGIN_EMAIL: '/auth/verify-login-email',
        VERIFY_LOGIN_PHONE: '/auth/verify-login-phone',
        PROFILE: '/auth/profile',
      },
      USER: {
        LIST: '/users',
        GET_BY_ID: '/users/:id',
        CREATE: '/users',
        UPDATE: '/users/:id',
        DELETE: '/users/:id',
        VERIFY: '/users/:id/verify',
        GET_BY_EMAIL: '/users/email/:email',
        GET_BY_PHONE: '/users/phone/:phone',
      },
      SOS: {
        SEND: '/sos/send',
        LIST: '/sos',
        GET_BY_ID: '/sos/:id',
        UPDATE_STATUS: '/sos/:id/status',
      },
      EMERGENCY_CONTACTS: {
        LIST: '/emergency-contacts',
        CREATE: '/emergency-contacts',
        UPDATE: '/emergency-contacts/:id',
        DELETE: '/emergency-contacts/:id',
        SET_PRIMARY: '/emergency-contacts/:id/primary',
        GET_PRIMARY: '/emergency-contacts/primary',
      }
    }
  },

  // App Configuration
  APP: {
    NAME: 'Tourist Safety',
    VERSION: '1.0.0',

    // OTP Configuration
    OTP: {
      LENGTH: 5,
      RESEND_TIMER: 60, // seconds
    },

    // Phone number validation
    PHONE: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 15,
      COUNTRY_CODE: '+91', // Default country code for India
    },

    // Emergency Configuration - Quick access features
    EMERGENCY: {
      POLICE_NUMBER: '112', // Universal emergency number
      FIRE_NUMBER: '101',
      AMBULANCE_NUMBER: '108',
      SOS_COUNTDOWN: 3, // seconds
      VIBRATION_PATTERN: [0, 500, 200, 500, 200, 500],
    },

    // SOS Configuration
    SOS: {
      COUNTDOWN_SECONDS: 3,
      VIBRATION_PATTERN: [0, 500, 200, 500, 200, 500],
      EMERGENCY_TYPES: [
        { value: 'medical', label: 'Medical Emergency', icon: 'medical' },
        { value: 'accident', label: 'Accident', icon: 'car' },
        { value: 'crime', label: 'Crime/Safety Threat', icon: 'shield' },
        { value: 'natural_disaster', label: 'Natural Disaster', icon: 'thunderstorm' },
        { value: 'other', label: 'Other Emergency', icon: 'warning' }
      ],
      PRIORITY_LEVELS: [
        { value: 'low', label: 'Low Priority', color: '#4CAF50' },
        { value: 'medium', label: 'Medium Priority', color: '#FF9800' },
        { value: 'high', label: 'High Priority', color: '#FF5722' },
        { value: 'critical', label: 'Critical Emergency', color: '#F44336' }
      ]
    }
  },

  // Development settings
  DEV: {
    ENABLE_LOGS: true, // Temporarily force enable for debugging deployed backend
    MOCK_API: false, // Set to true to use mock responses
  }
};

export default Config;
