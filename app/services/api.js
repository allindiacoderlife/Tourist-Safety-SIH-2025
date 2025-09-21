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
  // Register a new user (sends OTP to email and phone)
  static async register(userData) {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: userData,
    });
  }
  
  // Complete registration after OTP verification
  static async completeRegistration(verificationData) {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.AUTH.COMPLETE_REGISTRATION, {
      method: 'POST',
      body: verificationData,
    });
  }
  
  // Login with phone or email (sends OTP)
  static async login(loginData) {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: loginData,
    });
  }
  
  // Verify login OTP with email
  static async verifyLoginEmail(email, otp) {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.AUTH.VERIFY_LOGIN_EMAIL, {
      method: 'POST',
      body: { email, otp },
    });
  }
  
  // Verify login OTP with phone
  static async verifyLoginPhone(phone, otp) {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.AUTH.VERIFY_LOGIN_PHONE, {
      method: 'POST',
      body: { phone, otp },
    });
  }
  
  // Get user profile (protected route)
  static async getProfile(token) {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.AUTH.PROFILE, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}


export class UserAPI {
  // Get user profile
  static async getProfile(token) {
    return AuthAPI.getProfile(token);
  }
  
  // Update user profile
  static async updateProfile(userId, profileData, token) {
    return APIService.makeRequest(`/users/${userId}`, {
      method: 'PUT',
      body: profileData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  // Get user emergency contacts
  static async getEmergencyContacts(userId, token) {
    return APIService.makeRequest(`/users/${userId}/emergency-contacts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  // Add emergency contact
  static async addEmergencyContact(userId, contactData, token) {
    return APIService.makeRequest(`/users/${userId}/emergency-contacts`, {
      method: 'POST',
      body: contactData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  // Update emergency contact
  static async updateEmergencyContact(userId, contactId, contactData, token) {
    return APIService.makeRequest(`/users/${userId}/emergency-contacts/${contactId}`, {
      method: 'PUT',
      body: contactData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  // Delete emergency contact
  static async deleteEmergencyContact(userId, contactId, token) {
    return APIService.makeRequest(`/users/${userId}/emergency-contacts/${contactId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

// SOS API calls
export class SOSAPI {
  // Send SOS alert
  static async sendSOSAlert(sosData, token) {
    return APIService.makeRequest(AppConfig.API.ENDPOINTS.SOS.SEND, {
      method: 'POST',
      body: sosData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  // Get SOS history
  static async getSOSHistory(token, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${AppConfig.API.ENDPOINTS.SOS.LIST}?${queryString}` : AppConfig.API.ENDPOINTS.SOS.LIST;
    return APIService.makeRequest(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  // Get single SOS by ID
  static async getSOSById(sosId, token) {
    const endpoint = AppConfig.API.ENDPOINTS.SOS.GET_BY_ID.replace(':id', sosId);
    return APIService.makeRequest(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  
  // Update SOS status
  static async updateSOSStatus(sosId, status, token) {
    const endpoint = AppConfig.API.ENDPOINTS.SOS.UPDATE_STATUS.replace(':id', sosId);
    return APIService.makeRequest(endpoint, {
      method: 'PUT',
      body: { status },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export { APIService };
