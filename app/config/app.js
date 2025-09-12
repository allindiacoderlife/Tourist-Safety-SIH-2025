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
      },
      SOS: {
        SEND: '/sos/send',
        LIST: '/sos',
        GET_BY_ID: '/sos/:id',
        UPDATE_STATUS: '/sos/:id/status',
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
    },
    
    // SOS Configuration
    SOS: {
      COUNTDOWN_SECONDS: 3, // Countdown before SOS activation
      LOCATION_TIMEOUT: 10000, // Location request timeout in ms
      VIBRATION_PATTERN: [0, 500, 200, 500, 200, 500], // Emergency vibration pattern
      
      // Emergency types available
      EMERGENCY_TYPES: [
        { value: 'medical', label: 'Medical Emergency', icon: 'medical' },
        { value: 'accident', label: 'Accident', icon: 'car-crash' },
        { value: 'crime', label: 'Crime/Safety', icon: 'shield-alert' },
        { value: 'natural_disaster', label: 'Natural Disaster', icon: 'thunderstorm' },
        { value: 'other', label: 'Other Emergency', icon: 'alert-circle' }
      ],
      
      // Priority levels
      PRIORITY_LEVELS: [
        { value: 'low', label: 'Low Priority', color: '#4CAF50' },
        { value: 'medium', label: 'Medium Priority', color: '#FF9800' },
        { value: 'high', label: 'High Priority', color: '#FF5722' },
        { value: 'critical', label: 'Critical', color: '#F44336' }
      ],
      
      // Status types
      STATUS_TYPES: [
        { value: 'pending', label: 'Pending', color: '#FF9800' },
        { value: 'acknowledged', label: 'Acknowledged', color: '#2196F3' },
        { value: 'resolved', label: 'Resolved', color: '#4CAF50' },
        { value: 'cancelled', label: 'Cancelled', color: '#9E9E9E' }
      ]
    }
  },
  
  // Development settings
  DEV: {
    ENABLE_LOGS: __DEV__,
    MOCK_API: false, // Set to true to use mock responses
  }
};

export default Config;
