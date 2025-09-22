import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await StorageService.isAuthenticated();
        const userData = await StorageService.getUserData();

        setIsAuthenticated(authenticated);
        setUser(userData);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData, token) => {
    try {
      // Validate inputs
      if (!userData || typeof userData !== 'object') {
        console.error('Invalid userData provided to login:', userData);
        throw new Error('Invalid user data provided');
      }
      
      if (!token || typeof token !== 'string') {
        console.error('Invalid token provided to login:', token);
        throw new Error('Invalid token provided');
      }
      
      await StorageService.saveUserData(userData);
      await StorageService.saveAuthToken(token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await StorageService.clearAllData();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};