// Debug script to test deployed backend API
import AppConfig from './config/app.js';

const testAPI = async () => {
  console.log('Testing deployed backend API...');
  console.log('Base URL:', AppConfig.API.BASE_URL);
  
  try {
    // Test basic connectivity
    const response = await fetch(`${AppConfig.API.BASE_URL.replace('/api', '')}/`);
    console.log('Base server status:', response.status);
    
    // Test API endpoint
    const apiResponse = await fetch(`${AppConfig.API.BASE_URL}/health`);
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log('API health check:', data);
    } else {
      console.log('API health check failed:', apiResponse.status);
    }
    
    // Test auth endpoints structure
    console.log('Auth endpoints:');
    console.log('- Register:', `${AppConfig.API.BASE_URL}${AppConfig.API.ENDPOINTS.AUTH.REGISTER}`);
    console.log('- Complete Registration:', `${AppConfig.API.BASE_URL}${AppConfig.API.ENDPOINTS.AUTH.COMPLETE_REGISTRATION}`);
    console.log('- Login:', `${AppConfig.API.BASE_URL}${AppConfig.API.ENDPOINTS.AUTH.LOGIN}`);
    console.log('- Verify Phone:', `${AppConfig.API.BASE_URL}${AppConfig.API.ENDPOINTS.AUTH.VERIFY_LOGIN_PHONE}`);
    console.log('- Verify Email:', `${AppConfig.API.BASE_URL}${AppConfig.API.ENDPOINTS.AUTH.VERIFY_LOGIN_EMAIL}`);
    
  } catch (error) {
    console.error('API test failed:', error);
  }
};

testAPI();