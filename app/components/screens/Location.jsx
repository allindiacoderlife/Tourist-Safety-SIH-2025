import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MapView, { Circle, Marker } from 'react-native-maps'

const LocationScr = () => {
  const insets = useSafeAreaInsets()
  const slideAnim = useRef(new Animated.Value(150)).current
  const warningAnim = useRef(new Animated.Value(-100)).current
  const fabRotation = useRef(new Animated.Value(0)).current
  const mapRef = useRef(null)
  
  // State management
  const [location, setLocation] = useState(null)
  const [address, setAddress] = useState('Loading location...')
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [safetyStatus, setSafetyStatus] = useState('Safe Zone')
  const [fabExpanded, setFabExpanded] = useState(false)
  const [panelExpanded, setPanelExpanded] = useState(false)

  const safeZones = [
    { id: 1, lat: 40.7140, lng: -74.0065, radius: 0.002, name: "Tourist Safe Area" },
    { id: 2, lat: 40.7115, lng: -74.0045, radius: 0.0015, name: "Police Station Zone" },
    { id: 3, lat: 40.7145, lng: -74.0040, radius: 0.001, name: "Embassy District" }
  ]

  const restrictedZones = [
    { id: 1, lat: 40.7135, lng: -74.0075, radius: 0.001, name: "Construction Area" },
    { id: 2, lat: 40.7110, lng: -74.0070, radius: 0.0008, name: "High Crime Area" }
  ]

  const checkLocationSafety = (coords) => {
    // Check if user is in a restricted zone
    const inRestrictedZone = restrictedZones.some(zone => {
      const distance = Math.sqrt(
        Math.pow(coords.latitude - zone.lat, 2) + 
        Math.pow(coords.longitude - zone.lng, 2)
      )
      return distance < zone.radius
    })
    
    if (inRestrictedZone && safetyStatus !== 'Risk Area') {
      setSafetyStatus('Risk Area')
      showWarningAlert()
    } else if (!inRestrictedZone && safetyStatus !== 'Safe Zone') {
      setSafetyStatus('Safe Zone')
      hideWarningAlert()
    }
  }

  const requestLocationPermission = async () => {
    try {
      // Try to dynamically import expo-location
      let Location = null
      try {
        Location = await import('expo-location')
      } catch (_importError) {
        console.warn('expo-location module not available, using mock data')
      }
      
      if (!Location || !Location.requestForegroundPermissionsAsync) {
        console.log('Using mock location data for demo')
        setAddress('Times Square, Manhattan, NY 10036')
        setLocation({ latitude: 40.7128, longitude: -74.0060 })
        setSafetyStatus('Safe Zone')
        return
      }

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for safety features.')
        // Fallback to mock data
        setAddress('Times Square, Manhattan, NY 10036')
        setLocation({ latitude: 40.7128, longitude: -74.0060 })
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({})
      setLocation(currentLocation.coords)
      
      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      })
      
      if (addressResponse.length > 0) {
        const addr = addressResponse[0]
        setAddress(`${addr.street || ''} ${addr.city || ''}, ${addr.region || ''} ${addr.postalCode || ''}`)
      }

      checkLocationSafety(currentLocation.coords)
      
    } catch (_error) {
      console.log('Location services unavailable, using demo mode')
      // Fallback to mock data
      setAddress('Times Square, Manhattan, NY 10036')
      setLocation({ latitude: 40.7128, longitude: -74.0060 })
      setSafetyStatus('Safe Zone')
    }
  }

  useEffect(() => {
    requestLocationPermission()
    
    // Animate info panel slide up
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update map region when location changes
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000)
    }
  }, [location])

  const showWarningAlert = () => {
    setShowWarning(true)
    Animated.timing(warningAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start()

    // Auto hide after 5 seconds
    setTimeout(() => {
      hideWarningAlert()
    }, 5000)
  }

  const hideWarningAlert = () => {
    Animated.timing(warningAnim, {
      toValue: -100,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setShowWarning(false)
    })
  }

  const toggleFab = () => {
    const toValue = fabExpanded ? 0 : 1
    setFabExpanded(!fabExpanded)
    
    Animated.timing(fabRotation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const handleSendLocation = () => {
    Alert.alert(
      'Send Location', 
      'Share your current location with emergency contacts?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => {
          console.log('Location sent to emergency contacts')
          Alert.alert('Success', 'Location shared with emergency contacts')
        }}
      ]
    )
    toggleFab()
  }

  const toggleTracking = () => {
    setIsTrackingEnabled(!isTrackingEnabled)
    console.log('Tracking toggled:', !isTrackingEnabled)
    toggleFab()
  }

  const togglePanel = () => {
    const toValue = panelExpanded ? 150 : 0
    setPanelExpanded(!panelExpanded)
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then(camera => {
        camera.zoom += 1
        mapRef.current.animateCamera(camera, { duration: 500 })
      })
    }
  }

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then(camera => {
        camera.zoom -= 1
        mapRef.current.animateCamera(camera, { duration: 500 })
      })
    }
  }

  const centerToUserLocation = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000)
    }
  }

  const getSafetyStatusColor = () => {
    return safetyStatus === 'Safe Zone' ? 'bg-green-500' : 'bg-red-500'
  }

  const getSafetyStatusIcon = () => {
    return safetyStatus === 'Safe Zone' ? 'shield-checkmark' : 'warning'
  }

  const fabRotationStyle = {
    transform: [{
      rotate: fabRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg']
      })
    }]
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Map Container */}
      <View 
        className="flex-1 relative"
        style={{ paddingTop: insets.top }}
      >
        {/* Live Map using Expo Maps */}
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location?.latitude || 40.7128,
            longitude: location?.longitude || -74.0060,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
        >
          {/* Safe Zones as Green Circles */}
          {safeZones.map((zone) => (
            <Circle
              key={`safe-${zone.id}`}
              center={{
                latitude: zone.lat,
                longitude: zone.lng,
              }}
              radius={zone.radius * 111320} // Convert degrees to meters
              strokeColor="rgba(34, 197, 94, 0.8)"
              fillColor="rgba(34, 197, 94, 0.2)"
              strokeWidth={2}
            />
          ))}

          {/* Safe Zone Markers */}
          {safeZones.map((zone) => (
            <Marker
              key={`safe-marker-${zone.id}`}
              coordinate={{
                latitude: zone.lat,
                longitude: zone.lng,
              }}
              title={zone.name}
              description="Safe Zone"
            >
              <View className="bg-green-500 rounded-full p-2">
                <Ionicons name="shield-checkmark" size={16} color="white" />
              </View>
            </Marker>
          ))}

          {/* Restricted Zones as Red Circles */}
          {restrictedZones.map((zone) => (
            <Circle
              key={`restricted-${zone.id}`}
              center={{
                latitude: zone.lat,
                longitude: zone.lng,
              }}
              radius={zone.radius * 111320} // Convert degrees to meters
              strokeColor="rgba(239, 68, 68, 0.8)"
              fillColor="rgba(239, 68, 68, 0.3)"
              strokeWidth={2}
            />
          ))}

          {/* Restricted Zone Markers */}
          {restrictedZones.map((zone) => (
            <Marker
              key={`restricted-marker-${zone.id}`}
              coordinate={{
                latitude: zone.lat,
                longitude: zone.lng,
              }}
              title={zone.name}
              description="Restricted Area - Stay Alert"
            >
              <View className="bg-red-500 rounded-full p-2">
                <Ionicons name="warning" size={16} color="white" />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Map Controls */}
        <View className="absolute top-4 right-4 space-y-2" style={{ paddingTop: insets.top }}>
          {/* Zoom In */}
          <Pressable 
            onPress={handleZoomIn}
            className="w-10 h-10 bg-white rounded-lg shadow-md items-center justify-center"
          >
            <Ionicons name="add" size={20} color="#374151" />
          </Pressable>
          
          {/* Zoom Out */}
          <Pressable 
            onPress={handleZoomOut}
            className="w-10 h-10 bg-white rounded-lg shadow-md items-center justify-center"
          >
            <Ionicons name="remove" size={20} color="#374151" />
          </Pressable>
          
          {/* Center Location */}
          <Pressable 
            onPress={centerToUserLocation}
            className="w-10 h-10 bg-white rounded-lg shadow-md items-center justify-center"
          >
            <Ionicons name="locate" size={18} color="#3B82F6" />
          </Pressable>
        </View>

        {/* Warning Alert Banner */}
        {showWarning && (
          <Animated.View 
            className="absolute left-4 right-4 bg-red-500 rounded-xl p-4 shadow-xl z-50"
            style={{
              top: insets.top + 60,
              transform: [{ translateY: warningAnim }],
            }}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-white rounded-full items-center justify-center mr-3">
                <Text className="text-red-500 text-lg">⚠️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Restricted Zone Alert</Text>
                <Text className="text-white text-sm opacity-90 mt-1">
                  You are entering a restricted zone. Stay cautious.
                </Text>
              </View>
              <Pressable onPress={hideWarningAlert} className="p-2">
                <Ionicons name="close" size={20} color="white" />
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Floating Action Button */}
        <View className="absolute bottom-40 right-6 z-40">
          {fabExpanded && (
            <View className="mb-4 space-y-3">
              {/* Send Location Button */}
              <Pressable 
                onPress={handleSendLocation}
                className="bg-blue-500 rounded-full px-6 py-4 shadow-lg flex-row items-center"
              >
                <Ionicons name="share-outline" size={20} color="white" />
                <Text className="text-white font-semibold ml-3">Send Location</Text>
              </Pressable>
              
              {/* Toggle Tracking Button */}
              <Pressable 
                onPress={toggleTracking}
                className={`rounded-full px-6 py-4 shadow-lg flex-row items-center ${
                  isTrackingEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <Ionicons 
                  name={isTrackingEnabled ? "location" : "location-outline"} 
                  size={20} 
                  color="white" 
                />
                <Text className="text-white font-semibold ml-3">
                  {isTrackingEnabled ? 'Stop Tracking' : 'Enable Tracking'}
                </Text>
              </Pressable>
            </View>
          )}
          
          {/* Main FAB */}
          <Animated.View style={fabRotationStyle}>
            <Pressable 
              onPress={toggleFab}
              className="bg-blue-500 w-16 h-16 rounded-full items-center justify-center shadow-xl"
            >
              <Ionicons name="add" size={32} color="white" />
            </Pressable>
          </Animated.View>
        </View>
      </View>

      {/* Bottom Info Panel */}
      <Animated.View 
        className="bg-white rounded-t-3xl shadow-2xl absolute bottom-0 left-0 right-0 z-30"
        style={{
          transform: [{ translateY: slideAnim }],
          paddingBottom: insets.bottom,
        }}
      >
        {/* Pull Handle */}
        <Pressable onPress={togglePanel} className="items-center py-3">
          <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </Pressable>
        
        <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
          <View className="px-6 pb-6">
            {/* Current Status Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View className={`w-3 h-3 rounded-full mr-3 ${getSafetyStatusColor()}`} />
                <Text className="text-gray-900 text-xl font-bold">Current Status</Text>
              </View>
              <View className={`px-4 py-2 rounded-full flex-row items-center ${getSafetyStatusColor()}`}>
                <Ionicons name={getSafetyStatusIcon()} size={16} color="white" />
                <Text className="text-white text-sm font-semibold ml-2">{safetyStatus}</Text>
              </View>
            </View>

            {/* Location Information Cards */}
            <View className="space-y-4">
              {/* Address Card */}
              <View className="bg-gray-50 rounded-2xl p-4">
                <View className="flex-row items-start">
                  <View className="bg-blue-100 p-3 rounded-full mr-4">
                    <Ionicons name="location" size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-600 text-sm font-medium mb-1">Current Address</Text>
                    <Text className="text-gray-900 font-semibold text-base leading-relaxed">
                      {address}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Coordinates Card */}
              <View className="bg-gray-50 rounded-2xl p-4">
                <View className="flex-row items-start">
                  <View className="bg-green-100 p-3 rounded-full mr-4">
                    <Ionicons name="navigate" size={20} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-600 text-sm font-medium mb-1">GPS Coordinates</Text>
                    <Text className="text-gray-900 font-mono text-sm">
                      {location ? 
                        `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 
                        '40.712800, -74.006000'
                      }
                    </Text>
                  </View>
                </View>
              </View>

              {/* Last Updated Card */}
              <View className="bg-gray-50 rounded-2xl p-4">
                <View className="flex-row items-start">
                  <View className="bg-purple-100 p-3 rounded-full mr-4">
                    <Ionicons name="time" size={20} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-600 text-sm font-medium mb-1">Last Updated</Text>
                    <Text className="text-gray-900 font-semibold">
                      {new Date().toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Safety Statistics */}
              <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
                  <Text className="text-blue-900 font-semibold ml-2">Safety Statistics</Text>
                </View>
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-green-600 font-bold text-lg">{safeZones.length}</Text>
                    <Text className="text-gray-600 text-xs">Safe Zones</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-red-600 font-bold text-lg">{restrictedZones.length}</Text>
                    <Text className="text-gray-600 text-xs">Risk Areas</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-blue-600 font-bold text-lg">
                      {isTrackingEnabled ? 'ON' : 'OFF'}
                    </Text>
                    <Text className="text-gray-600 text-xs">Tracking</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  )
}

export default LocationScr
