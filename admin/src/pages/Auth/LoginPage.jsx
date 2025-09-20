import React, { useState } from 'react';
import { MdError, MdAutorenew } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);
    setTimeout(() => {
      const success = login(credentials.email, credentials.password);
      if (success) {
        if (credentials.email === "admin@central.gov") {
          navigate("/central-admin");
        } else {
          navigate("/police-admin");
        }
      } else {
        setError("Invalid credentials. Please try again.");
      }
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-100 rounded-full opacity-20 animate-pulse"></div>
      </div>
      
      <div className="relative max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tourist Safety System
            </h2>
            <p className="text-gray-600 text-sm">
              Secure monitoring and management platform
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                <MdError className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <MdAutorenew className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</h4>
              <div className="space-y-1 text-xs text-blue-700">
                <div className="flex justify-between">
                  <span className="font-medium">Central Admin:</span>
                  <span className="font-mono">admin@central.gov / admin123</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Police Admin:</span>
                  <span className="font-mono">john@police1.gov / police123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Secure access to tourist safety monitoring and management tools
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;