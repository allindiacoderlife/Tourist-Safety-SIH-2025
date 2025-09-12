// Network connectivity test component
import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { APIService } from '../../services/api';

const NetworkTest = () => {
  const [testing, setTesting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const testConnection = async () => {
    setTesting(true);
    try {
      const isConnected = await APIService.testConnection();
      const result = isConnected ? 'SUCCESS' : 'FAILED';
      setLastResult(result);
      
      Alert.alert(
        'Connection Test',
        isConnected 
          ? 'Successfully connected to backend server!' 
          : 'Failed to connect to backend server. Please check if the server is running.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      setLastResult('ERROR');
      Alert.alert('Connection Test', `Error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#f0f0f0', margin: 10, borderRadius: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Network Connectivity Test
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>
        Backend URL: http://10.68.145.252:7001
      </Text>
      {lastResult && (
        <Text style={{ 
          fontSize: 14, 
          marginBottom: 10,
          color: lastResult === 'SUCCESS' ? 'green' : 'red'
        }}>
          Last Test: {lastResult}
        </Text>
      )}
      <Pressable
        onPress={testConnection}
        disabled={testing}
        style={{
          backgroundColor: testing ? '#ccc' : '#007AFF',
          padding: 12,
          borderRadius: 6,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {testing ? 'Testing...' : 'Test Connection'}
        </Text>
      </Pressable>
    </View>
  );
};

export default NetworkTest;
