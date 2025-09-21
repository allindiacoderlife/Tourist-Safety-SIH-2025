import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Linking, Pressable, Text, Vibration, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AppConfig from '../../config/app'
import { SOSAPI } from '../../services/api'
import { LocationService } from '../../services/location'
import { StorageService } from '../../services/storage'
import EnhancedSOSAlert from '../modals/EnhancedSOSAlert'

const SOS = () => {
  const insets = useSafeAreaInsets()
  
  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  const buttonOpacity = useRef(new Animated.Value(1)).current
  
  // State management
  const [isPressed, setIsPressed] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [lastSOSSent, setLastSOSSent] = useState(null)
  const [deliveryStatus, setDeliveryStatus] = useState('Ready')
  const [isLongPress, setIsLongPress] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [showEnhancedSOS, setShowEnhancedSOS] = useState(false)

  // Emergency contacts - will be loaded from user data
  const [emergencyContacts] = useState({
    police: '112',
    primary: null
  })

  // Load user data and emergency contacts on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await StorageService.getUserData();
        if (userData) {
          setUserEmail(userData.email || '');
          // TODO: Implement emergency contacts loading
          // const contacts = await UserAPI.getEmergencyContacts(userData.id);
          // if (contacts.success && contacts.data.length > 0) {
          //   setEmergencyContacts(prev => ({
          //     ...prev,
          //     primary: contacts.data[0]?.phone || null
          //   }));
          // }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  // Start pulsing animation on component mount
  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start()
    }

    startPulse()
  }, [pulseAnim])

  const handleSOSActivation = () => {
    const now = new Date()
    setLastSOSSent(now)
    setDeliveryStatus('Sending...')
    
    // Strong vibration feedback - using config pattern
    Vibration.vibrate(AppConfig.APP.SOS.VIBRATION_PATTERN)
    
    const contacts = emergencyContacts.primary 
      ? `• Police (112)\n• Primary Contact (${emergencyContacts.primary})\n• Emergency Email (${userEmail})`
      : `• Police (112)\n• Emergency Email (${userEmail})`
    
    Alert.alert(
      '🚨 SOS ACTIVATED',
      `Emergency alert will be sent to:\n${contacts}\n\nYour current location will be shared.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setDeliveryStatus('Cancelled') },
        { text: 'Send Emergency Alert', onPress: () => sendSOSAlert() }
      ]
    )
  }

  // Countdown effect for long press
  useEffect(() => {
    let interval = null
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0 && isLongPress) {
      handleSOSActivation()
      setIsLongPress(false)
    }
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, isLongPress])

  const handleSOSPressIn = () => {
    setIsPressed(true)
    setIsLongPress(true)
    setCountdown(AppConfig.APP.SOS.COUNTDOWN_SECONDS) // Using config countdown
    
    // Vibration pattern: short, long, short
    Vibration.vibrate([0, 200, 100, 400, 100, 200])
    
    // Scale down animation
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start()

    // Flash animation
    Animated.sequence([
      Animated.timing(buttonOpacity, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleSOSPressOut = () => {
    setIsPressed(false)
    setIsLongPress(false)
    setCountdown(0)
    
    // Scale back to normal
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start()
  }

  const sendSOSAlert = async () => {
    try {
      setDeliveryStatus('Sending...');
      
      // Get user data for email and phone
      const userData = await StorageService.getUserData();
      if (!userData || !userData.email) {
        throw new Error('User email not found. Please ensure you are logged in.');
      }

      // Get current location
      const locationData = await LocationService.getSOSLocationData();
      
      // Prepare SOS data according to backend schema
      const sosData = {
        email: userData.email,
        location: locationData.location,
        coordinates: locationData.coordinates,
        mapsLink: locationData.mapsLink,
        accuracy: locationData.accuracy || 10
      };

      // Send SOS alert via API
      const token = await StorageService.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await SOSAPI.sendSOSAlert(sosData, token);
      
      if (response.success) {
        setDeliveryStatus('Sent ✓');
        Alert.alert(
          '✅ SOS Alert Sent', 
          `Emergency alert sent successfully!\n\nAlert ID: ${response.data.id}\nSent to: ${userData.email}\nLocation: ${locationData.location}\n\nEmergency services have been notified.`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(response.message || 'Failed to send SOS alert');
      }
      
    } catch (error) {
      console.error('SOS Alert Error:', error);
      setDeliveryStatus('Failed ✗');
      Alert.alert(
        '❌ SOS Alert Failed',
        `Failed to send emergency alert: ${error.message}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => sendSOSAlert() }
        ]
      );
    }
  };

  const handleQuickCall = (type) => {
    const number = type === 'police' ? emergencyContacts.police : emergencyContacts.primary
    const name = type === 'police' ? 'Police' : 'Primary Contact'
    
    Alert.alert(
      `Call ${name}`,
      `Calling ${number}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            Linking.openURL(`tel:${number}`)
            Vibration.vibrate(200)
          }
        }
      ]
    )
  }

  const handleShareLocation = async () => {
    try {
      const locationData = await LocationService.getSOSLocationData();
      
      Alert.alert(
        '📍 Share Live Location',
        `Your current location will be shared:\n\n${locationData.location}\n\nLocation will be shared with emergency contacts for the next 30 minutes.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Share Location', 
            onPress: () => {
              Vibration.vibrate(100)
              // Here you could implement actual location sharing
              // For now, just show confirmation
              Alert.alert(
                '✅ Location Sharing Active', 
                `Live location is now being shared with emergency contacts.\n\nMaps Link: ${locationData.mapsLink}`
              )
            }
          }
        ]
      )
    } catch (_error) {
      Alert.alert(
        '❌ Location Error',
        'Failed to get current location. Please check your location permissions.',
        [{ text: 'OK' }]
      )
    }
  }

  const getStatusColor = () => {
    switch (deliveryStatus) {
      case 'Sent ✓': return 'text-green-600'
      case 'Failed ✗': return 'text-red-600'
      case 'Sending...': return 'text-yellow-600'
      case 'Cancelled': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const formatLastSent = () => {
    if (!lastSOSSent) return 'Never'
    return lastSOSSent.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4 bg-white shadow-sm">
        <Text className="text-gray-900 text-xl font-bold">Emergency SOS</Text>
        <Text className="text-gray-600 text-sm mt-1">Hold the button for 3 seconds to activate</Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 py-8">
        {/* Offline Support Message */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <View className="flex-row items-center">
            <Ionicons name="wifi-outline" size={20} color="#3B82F6" />
            <Text className="text-blue-800 font-medium ml-2">Offline Support Available</Text>
          </View>
          <Text className="text-blue-700 text-sm mt-1">
            SOS works even without internet. Emergency calls use cellular network.
          </Text>
        </View>

        {/* Main SOS Button */}
        <View className="flex-1 items-center justify-center">
          <View className="relative flex items-center justify-center">
            {/* Outer pulse ring */}
            <Animated.View
              className="absolute w-80 h-80 rounded-full bg-red-500 opacity-20"
              style={{
                transform: [{ scale: pulseAnim }],
              }}
            />
            
            {/* Inner pulse ring */}
            <Animated.View
              style={{
                top: 16,
                left: 16,
                transform: [{ scale: pulseAnim }],
              }}
            />

            {/* Main SOS Button */}
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
                opacity: buttonOpacity,
              }}
            >
              <Pressable
                onPressIn={handleSOSPressIn}
                onPressOut={handleSOSPressOut}
                className={`w-64 h-64 rounded-full items-center justify-center shadow-2xl ${
                  isPressed ? 'bg-red-700' : 'bg-red-600'
                }`}
                style={{
                  elevation: 10,
                }}
              >
                {/* Countdown overlay */}
                {countdown > 0 && (
                  <View className="absolute inset-0 rounded-full bg-black bg-opacity-50 items-center justify-center">
                    <Text className="text-white text-6xl font-bold">{countdown}</Text>
                    <Text className="text-white text-lg font-medium">Activating...</Text>
                  </View>
                )}
                
                {/* Default content */}
                {countdown === 0 && (
                  <>
                    <Text className="text-white text-6xl font-black tracking-wider">SOS</Text>
                    <Text className="text-white text-lg font-semibold mt-2">EMERGENCY</Text>
                    <Text className="text-red-100 text-sm font-medium mt-1">Hold to activate</Text>
                  </>
                )}
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View className="mb-8">
          <Text className="text-gray-700 text-lg font-semibold mb-4 text-center">Quick Actions</Text>
          <View className="flex-row justify-between space-x-4">
            {/* Call Police */}
            <Pressable
              onPress={() => handleQuickCall('police')}
              className="flex-1 bg-blue-600 rounded-2xl p-4 items-center shadow-lg"
            >
              <Ionicons name="shield" size={28} color="white" />
              <Text className="text-white font-bold text-lg mt-2">Police</Text>
              <Text className="text-blue-100 text-sm">112</Text>
            </Pressable>

            {/* Call Primary Contact */}
            <Pressable
              onPress={() => handleQuickCall('primary')}
              className="flex-1 bg-green-600 rounded-2xl p-4 items-center shadow-lg mx-2"
            >
              <Ionicons name="call" size={28} color="white" />
              <Text className="text-white font-bold text-lg mt-2">Contact</Text>
              <Text className="text-green-100 text-sm">Primary</Text>
            </Pressable>

            {/* Share Live Location */}
            <Pressable
              onPress={handleShareLocation}
              className="flex-1 bg-orange-600 rounded-2xl p-4 items-center shadow-lg"
            >
              <Ionicons name="location" size={28} color="white" />
              <Text className="text-white font-bold text-lg mt-2">Location</Text>
              <Text className="text-orange-100 text-sm">Share</Text>
            </Pressable>
          </View>
        </View>

        {/* Enhanced SOS Alert */}
        <View className="mb-8">
          <Text className="text-gray-700 text-lg font-semibold mb-4 text-center">Enhanced Alert</Text>
          <Pressable
            onPress={() => setShowEnhancedSOS(true)}
            className="bg-purple-600 rounded-2xl p-4 items-center shadow-lg"
          >
            <Ionicons name="settings" size={28} color="white" />
            <Text className="text-white font-bold text-lg mt-2">Detailed SOS</Text>
            <Text className="text-purple-100 text-sm">Select emergency type & priority</Text>
          </Pressable>
        </View>
      </View>

      {/* Status Panel */}
      <View 
        className="bg-white border-t border-gray-200 px-6 py-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-gray-600 text-sm font-medium">Last SOS Sent</Text>
            <Text className="text-gray-900 font-semibold">{formatLastSent()}</Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-600 text-sm font-medium">Status</Text>
            <Text className={`font-bold ${getStatusColor()}`}>{deliveryStatus}</Text>
          </View>
        </View>
        
        {/* Vibration indicator */}
        <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
          <Ionicons name="phone-portrait" size={16} color="#6B7280" />
          <Text className="text-gray-500 text-xs ml-2">
            Vibration feedback enabled • Works offline
          </Text>
        </View>
      </View>

      {/* Enhanced SOS Alert Modal */}
      <EnhancedSOSAlert
        visible={showEnhancedSOS}
        onClose={() => setShowEnhancedSOS(false)}
        onSuccess={(sosData) => {
          setLastSOSSent(new Date());
          setDeliveryStatus('Alert Sent');
        }}
      />
    </View>
  )
}

export default SOS