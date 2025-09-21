// Enhanced SOS Alert Component with Emergency Type Selection
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  Modal,
  ScrollView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppConfig from '../../config/app';
import { SOSAPI } from '../../services/api';
import { LocationService } from '../../services/location';
import { StorageService } from '../../services/storage';

const EnhancedSOSAlert = ({ visible, onClose, onSuccess }) => {
  const [selectedType, setSelectedType] = useState('other');
  const [selectedPriority, setSelectedPriority] = useState('high');
  const [sending, setSending] = useState(false);

  const sendEnhancedSOS = async () => {
    setSending(true);
    try {
      // Get user data
      const userData = await StorageService.getUserData();
      if (!userData || !userData.email) {
        throw new Error('User email not found. Please ensure you are logged in.');
      }

      // Get current location
      const locationData = await LocationService.getSOSLocationData();
      
      // Get type and priority details
      const typeDetails = AppConfig.APP.SOS.EMERGENCY_TYPES.find(t => t.value === selectedType);
      const priorityDetails = AppConfig.APP.SOS.PRIORITY_LEVELS.find(p => p.value === selectedPriority);
      
      // Prepare enhanced SOS data according to backend schema
      const sosData = {
        email: userData.email,
        location: `${locationData.location} - ${typeDetails.label} (${priorityDetails.label})`,
        coordinates: locationData.coordinates,
        mapsLink: locationData.mapsLink,
        accuracy: locationData.accuracy || 10
      };

      // Send SOS alert
      const token = await StorageService.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await SOSAPI.sendSOSAlert(sosData, token);
      
      if (response.success) {
        Alert.alert(
          '✅ Enhanced SOS Alert Sent',
          `${typeDetails.label} alert sent successfully!\n\n` +
          `Priority: ${priorityDetails.label}\n` +
          `Alert ID: ${response.data.id}\n` +
          `Location: ${locationData.location}\n\n` +
          `Emergency services have been notified.`,
          [{ 
            text: 'OK', 
            onPress: () => {
              onSuccess && onSuccess(response.data);
              onClose();
            }
          }]
        );
      } else {
        throw new Error(response.message || 'Failed to send SOS alert');
      }
    } catch (error) {
      console.error('Enhanced SOS Alert Error:', error);
      Alert.alert(
        '❌ SOS Alert Failed',
        `Failed to send emergency alert: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setSending(false);
    }
  };

  const confirmSend = () => {
    const typeDetails = AppConfig.APP.SOS.EMERGENCY_TYPES.find(t => t.value === selectedType);
    const priorityDetails = AppConfig.APP.SOS.PRIORITY_LEVELS.find(p => p.value === selectedPriority);

    Alert.alert(
      '🚨 Confirm Emergency Alert',
      `Are you sure you want to send a ${priorityDetails.label.toLowerCase()} ${typeDetails.label.toLowerCase()} alert?\n\nThis will notify emergency contacts with your location.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Alert', style: 'destructive', onPress: sendEnhancedSOS }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#eee'
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            Emergency Alert Setup
          </Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          {/* Emergency Type Selection */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            Emergency Type
          </Text>
          {AppConfig.APP.SOS.EMERGENCY_TYPES.map((type) => (
            <Pressable
              key={type.value}
              onPress={() => setSelectedType(type.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                marginBottom: 8,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: selectedType === type.value ? '#007AFF' : '#eee',
                backgroundColor: selectedType === type.value ? '#f0f8ff' : 'white'
              }}
            >
              <Ionicons 
                name={type.icon} 
                size={24} 
                color={selectedType === type.value ? '#007AFF' : '#666'} 
              />
              <Text style={{
                marginLeft: 12,
                fontSize: 16,
                fontWeight: selectedType === type.value ? 'bold' : 'normal',
                color: selectedType === type.value ? '#007AFF' : '#333'
              }}>
                {type.label}
              </Text>
              {selectedType === type.value && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color="#007AFF" 
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </Pressable>
          ))}

          {/* Priority Selection */}
          <Text style={{ 
            fontSize: 16, 
            fontWeight: 'bold', 
            marginTop: 24, 
            marginBottom: 12 
          }}>
            Priority Level
          </Text>
          {AppConfig.APP.SOS.PRIORITY_LEVELS.map((priority) => (
            <Pressable
              key={priority.value}
              onPress={() => setSelectedPriority(priority.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                marginBottom: 8,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: selectedPriority === priority.value ? priority.color : '#eee',
                backgroundColor: selectedPriority === priority.value ? `${priority.color}20` : 'white'
              }}
            >
              <View style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: priority.color
              }} />
              <Text style={{
                marginLeft: 12,
                fontSize: 16,
                fontWeight: selectedPriority === priority.value ? 'bold' : 'normal',
                color: selectedPriority === priority.value ? priority.color : '#333'
              }}>
                {priority.label}
              </Text>
              {selectedPriority === priority.value && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color={priority.color} 
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </Pressable>
          ))}

          {/* Info Section */}
          <View style={{
            backgroundColor: '#f8f9fa',
            padding: 16,
            borderRadius: 8,
            marginTop: 24
          }}>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
              Your current location will be automatically included in the alert. 
              Emergency contacts will receive detailed information about your situation.
            </Text>
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={{ padding: 16 }}>
          <Pressable
            onPress={confirmSend}
            disabled={sending}
            style={{
              backgroundColor: sending ? '#ccc' : '#FF5722',
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold'
            }}>
              {sending ? 'Sending Alert...' : '🚨 Send Emergency Alert'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default EnhancedSOSAlert;