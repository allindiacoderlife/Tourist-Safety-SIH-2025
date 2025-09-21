// SOS Testing Component - for development/testing purposes
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SOSAPI } from '../../services/api';
import { LocationService } from '../../services/location';
import { StorageService } from '../../services/storage';

const SOSTest = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (test, result, details = '') => {
    setResults(prev => [...prev, { test, result, details, timestamp: new Date() }]);
  };

  const testLocationService = async () => {
    try {
      addResult('Location Permission', 'TESTING...', 'Requesting permissions');
      const hasPermission = await LocationService.requestLocationPermission();
      addResult('Location Permission', hasPermission ? 'PASS' : 'FAIL', `Permission: ${hasPermission}`);
      
      if (hasPermission) {
        addResult('Get Location', 'TESTING...', 'Getting current location');
        const location = await LocationService.getCurrentLocation();
        addResult('Get Location', location.success ? 'PASS' : 'FAIL', 
          location.success ? `Lat: ${location.coordinates.latitude}, Long: ${location.coordinates.longitude}` : location.error);
        
        if (location.success) {
          addResult('Format Location', 'TESTING...', 'Formatting for SOS');
          const sosLocation = await LocationService.getSOSLocationData();
          addResult('Format Location', 'PASS', `Location: ${sosLocation.location}`);
        }
      }
    } catch (error) {
      addResult('Location Service', 'ERROR', error.message);
    }
  };

  const testSOSAPI = async () => {
    try {
      addResult('SOS API', 'TESTING...', 'Testing SOS API endpoint');
      
      const token = await StorageService.getAuthToken();
      if (!token) {
        addResult('SOS API', 'ERROR', 'No authentication token found');
        return;
      }
      
      const mockSOSData = {
        email: 'test@example.com',
        location: 'Test Location for SOS API',
        coordinates: { latitude: 27.4924, longitude: 77.6737 },
        mapsLink: 'https://maps.google.com/?q=27.4924,77.6737',
        timestamp: new Date().toISOString(),
        accuracy: 10
      };
      
      const response = await SOSAPI.sendSOSAlert(mockSOSData, token);
      addResult('SOS API', response.success ? 'PASS' : 'FAIL', 
        response.success ? 'SOS alert sent successfully' : response.message);
    } catch (error) {
      addResult('SOS API', 'ERROR', error.message);
    }
  };

  const testUserData = async () => {
    try {
      addResult('User Data', 'TESTING...', 'Checking stored user data');
      const userData = await StorageService.getUserData();
      addResult('User Data', userData ? 'PASS' : 'FAIL', 
        userData ? `Email: ${userData.email}` : 'No user data found');
    } catch (error) {
      addResult('User Data', 'ERROR', error.message);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    
    await testUserData();
    await testLocationService();
    await testSOSAPI();
    
    setTesting(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          SOS System Test Console
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <Pressable
            onPress={runAllTests}
            disabled={testing}
            style={{
              backgroundColor: testing ? '#ccc' : '#007AFF',
              padding: 12,
              borderRadius: 6,
              flex: 1,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {testing ? 'Testing...' : 'Run All Tests'}
            </Text>
          </Pressable>
          
          <Pressable
            onPress={clearResults}
            style={{
              backgroundColor: '#666',
              padding: 12,
              borderRadius: 6,
              flex: 1,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Clear</Text>
          </Pressable>
        </View>
      </View>

      <View>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          Test Results ({results.length})
        </Text>
        
        {results.map((result, index) => (
          <View
            key={index}
            style={{
              backgroundColor: 'white',
              padding: 12,
              marginBottom: 8,
              borderRadius: 6,
              borderLeftWidth: 4,
              borderLeftColor: 
                result.result === 'PASS' ? '#4CAF50' : 
                result.result === 'FAIL' ? '#F44336' : 
                result.result === 'ERROR' ? '#FF9800' : '#2196F3'
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{result.test}</Text>
              <Text style={{ 
                fontWeight: 'bold', 
                color: 
                  result.result === 'PASS' ? '#4CAF50' : 
                  result.result === 'FAIL' ? '#F44336' : 
                  result.result === 'ERROR' ? '#FF9800' : '#2196F3'
              }}>
                {result.result}
              </Text>
            </View>
            {result.details && (
              <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {result.details}
              </Text>
            )}
            <Text style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
              {result.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        ))}
        
        {results.length === 0 && (
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 6,
            alignItems: 'center'
          }}>
            <Text style={{ color: '#666' }}>No test results yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SOSTest;