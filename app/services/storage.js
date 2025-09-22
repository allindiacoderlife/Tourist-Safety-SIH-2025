// Storage utilities for the Tourist Safety App
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_DATA: '@tourist_safety_user_data',
  AUTH_TOKEN: '@tourist_safety_auth_token',
  USER_PREFERENCES: '@tourist_safety_preferences',
};

export class StorageService {
  /**
   * Save user data after successful authentication
   * @param {object} userData - User data to save
   */
  static async saveUserData(userData) {
    try {
      if (!userData || typeof userData !== 'object') {
        console.error('Invalid userData provided to saveUserData:', userData);
        return false;
      }
      
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonValue);
      console.log('User data saved:', userData);
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  /**
   * Get saved user data
   * @returns {object|null} - User data or null if not found
   */
  static async getUserData() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Save authentication token
   * @param {string} token - Authentication token
   */
  static async saveAuthToken(token) {
    try {
      if (!token || typeof token !== 'string') {
        console.error('Invalid token provided to saveAuthToken:', token);
        return false;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      return true;
    } catch (error) {
      console.error('Error saving auth token:', error);
      return false;
    }
  }

  /**
   * Get authentication token
   * @returns {string|null} - Auth token or null if not found
   */
  static async getAuthToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Save user preferences
   * @param {object} preferences - User preferences
   */
  static async saveUserPreferences(preferences) {
    try {
      const jsonValue = JSON.stringify(preferences);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }

  /**
   * Get user preferences
   * @returns {object|null} - User preferences or null if not found
   */
  static async getUserPreferences() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Clear all stored data (logout)
   */
  static async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_PREFERENCES
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user data exists
   */
  static async isAuthenticated() {
    const userData = await this.getUserData();
    const authToken = await this.getAuthToken();
    return userData !== null && authToken !== null;
  }
}

export default StorageService;
