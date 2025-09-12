// API Configuration and Services for Tourist Safety App
import AppConfig from '../config/app';

const API_BASE_URL = AppConfig.API.BASE_URL;

class APIService {
  static async testConnection() {
    const testUrl = `${API_BASE_URL.replace('/api', '')}/`;
    try {
      const response = await fetch(testUrl, { 
        method: 'GET',
        timeout: 5000 
      });
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  static async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: AppConfig.API.TIMEOUT,
    };
    
    const config = {
      ...defaultOptions,
      ...options,
    };
    
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }
    
    try {
      if (AppConfig.DEV.ENABLE_LOGS) {
        console.log('API Request:', { url, config });
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AppConfig.API.TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (AppConfig.DEV.ENABLE_LOGS) {
        console.log('API Response:', { url, status: response.status, data });
      }
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      
      // Provide more specific error messages
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection.');
      } else if (error.message === 'Network request failed') {
        throw new Error(`Cannot connect to server at ${url}. Please check if the backend server is running.`);
      } else if (error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  }
}

// Authentication API calls
export class AuthAPI {
  // Register a new user
  static async register(userData) {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: userData,
    });
  }
  
  // Complete registration after OTP verification
  static async completeRegistration(phone, otp) {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.AUTH.COMPLETE_REGISTRATION, {
      method: 'POST',
      body: { phone, otp },
    });
  }
  
  // Login with phone number (first step)
  static async login(phone) {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: { phone },
    });
  }
  
  // Verify login OTP (second step)
  static async verifyLogin(phone, otp) {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.AUTH.VERIFY_LOGIN, {
      method: 'POST',
      body: { phone, otp },
    });
  }
}

// OTP API calls
export class OTPAPI {
  // Send OTP to phone number
  static async sendOTP(phone, purpose = 'phone_verification') {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.OTP.SEND, {
      method: 'POST',
      body: { phone, purpose },
    });
  }
  
  // Verify OTP
  static async verifyOTP(phone, code) {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.OTP.VERIFY, {
      method: 'POST',
      body: { phone, code },
    });
  }
}

// User API calls
export class UserAPI {
  // Get user profile
  static async getProfile(userId) {
    return APIService.makeRequest(`/user/${userId}`, {
      method: 'GET',
    });
  }
  
  // Update user profile
  static async updateProfile(userId, profileData) {
    return APIService.makeRequest(`/user/${userId}`, {
      method: 'PUT',
      body: profileData,
    });
  }
  
  // Get user emergency contacts
  static async getEmergencyContacts(userId) {
    return APIService.makeRequest(`/user/${userId}/emergency-contacts`, {
      method: 'GET',
    });
  }
  
  // Add emergency contact
  static async addEmergencyContact(userId, contactData) {
    return APIService.makeRequest(`/user/${userId}/emergency-contacts`, {
      method: 'POST',
      body: contactData,
    });
  }
  
  // Update emergency contact
  static async updateEmergencyContact(userId, contactId, contactData) {
    return APIService.makeRequest(`/user/${userId}/emergency-contacts/${contactId}`, {
      method: 'PUT',
      body: contactData,
    });
  }
  
  // Delete emergency contact
  static async deleteEmergencyContact(userId, contactId) {
    return APIService.makeRequest(`/user/${userId}/emergency-contacts/${contactId}`, {
      method: 'DELETE',
    });
  }
}

export { APIService };
