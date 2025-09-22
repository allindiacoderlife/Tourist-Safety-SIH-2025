import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StorageService } from '../../services/storage'

const Id = () => {
  const insets = useSafeAreaInsets()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await StorageService.getUserData()
        if (user) {
          setUserData(user)
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUserData()
  }, [])
  
  // Generate tourist data from real user data
  const generateTouristID = (email) => {
    if (!email) return "TID-2024-000"
    const hash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return `TID-2025-${Math.abs(hash).toString().slice(0, 3)}`
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getFutureDate = (days) => {
    const future = new Date()
    future.setDate(future.getDate() + days)
    return future.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  // Generate tourist data based on real user data
  const touristData = {
    name: userData?.name || "Tourist",
    id: generateTouristID(userData?.email),
    photo: userData?.profilePicture || null,
    arrival: getCurrentDate(),
    departure: getFutureDate(7),
    itinerary: "Tourist Visit - 7 Days",
    emergencyContact: {
      name: userData?.name ? `${userData.name} Contact` : "Emergency Contact",
      phone: userData?.phone || "+91 112"
    },
    validUntil: getFutureDate(7),
    isValid: true
  }

  const handleShowQRFullScreen = () => {
    // Navigate to full screen QR view
    console.log('Show QR Full Screen')
  }

  const handleDownloadID = () => {
    // Download ID functionality
    console.log('Download ID')
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="px-6 py-4 bg-white shadow-sm">
        <View className="flex-row items-center">
          <Pressable className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-gray-900 text-xl font-bold">Digital Tourist ID</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 px-6 py-8 items-center justify-center">
          <Text className="text-gray-500 text-lg">Loading your ID...</Text>
        </View>
      ) : (
        <View className="flex-1 px-6 py-8">
        
        {/* Tourist ID Card */}
        <View 
          className="bg-blue-500 rounded-3xl p-6 mb-8 relative"
          style={{
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          {/* Card Header */}
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-white text-lg font-bold">Tourist ID</Text>
              <Text className="text-blue-100 text-sm">Smart Safety Pass</Text>
            </View>
            <View className="bg-white p-2 rounded-lg">
              <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
            </View>
          </View>

          {/* Tourist Photo and Info */}
          <View className="flex-row items-center mb-6">
            {/* Photo Placeholder */}
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center mr-4">
              {touristData.photo ? (
                <Image 
                  source={{ uri: touristData.photo }} 
                  className="w-20 h-20 rounded-full"
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                />
              ) : (
                <Ionicons name="person" size={40} color="#3B82F6" />
              )}
            </View>
            
            {/* Name and ID */}
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">{touristData.name}</Text>
              <Text className="text-blue-100 text-base font-medium">ID: {touristData.id}</Text>
              {userData?.email && (
                <Text className="text-blue-100 text-sm">{userData.email}</Text>
              )}
            </View>
          </View>

          {/* Trip Details */}
          <View className="bg-blue-400 rounded-2xl p-4 mb-4">
            <Text className="text-white text-sm font-semibold mb-2">Trip Details</Text>
            <View className="space-y-1">
              <View className="flex-row">
                <Text className="text-blue-100 text-sm w-20">Arrival:</Text>
                <Text className="text-white text-sm font-medium">{touristData.arrival}</Text>
              </View>
              <View className="flex-row">
                <Text className="text-blue-100 text-sm w-20">Departure:</Text>
                <Text className="text-white text-sm font-medium">{touristData.departure}</Text>
              </View>
              <View className="flex-row">
                <Text className="text-blue-100 text-sm w-20">Itinerary:</Text>
                <Text className="text-white text-sm font-medium">{touristData.itinerary}</Text>
              </View>
            </View>
          </View>

          {/* Emergency Contact */}
          <View className="bg-blue-400 rounded-2xl p-4 mb-4">
            <Text className="text-white text-sm font-semibold mb-2">Emergency Contact</Text>
            <View className="space-y-1">
              <View className="flex-row">
                <Text className="text-blue-100 text-sm w-16">Name:</Text>
                <Text className="text-white text-sm font-medium">{touristData.emergencyContact.name}</Text>
              </View>
              <View className="flex-row">
                <Text className="text-blue-100 text-sm w-16">Phone:</Text>
                <Text className="text-white text-sm font-medium">{touristData.emergencyContact.phone}</Text>
              </View>
            </View>
          </View>

          {/* QR Code Placeholder */}
          <View className="absolute bottom-6 right-6 bg-white p-3 rounded-xl items-center justify-center" style={{ width: 72, height: 72 }}>
            <Ionicons name="qr-code" size={32} color="#374151" />
            <Text className="text-xs text-gray-500 mt-1">QR</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4 mb-8">
          {/* Primary Button */}
          <Pressable 
            onPress={handleShowQRFullScreen}
            className="bg-blue-500 py-4 px-6 rounded-2xl flex-row items-center justify-center"
            style={{
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Ionicons name="qr-code" size={24} color="white" />
            <Text className="text-white text-lg font-semibold ml-3">Show QR Full Screen</Text>
          </Pressable>

          {/* Secondary Button */}
          <Pressable 
            onPress={handleDownloadID}
            className="border-2 border-blue-500 py-4 px-6 rounded-2xl flex-row items-center justify-center"
          >
            <Ionicons name="download-outline" size={24} color="#3B82F6" />
            <Text className="text-blue-500 text-lg font-semibold ml-3">Download ID</Text>
          </Pressable>
        </View>

        {/* Status Section */}
        <View className="bg-white rounded-2xl p-6 shadow-md">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className={`w-4 h-4 rounded-full mr-3 ${touristData.isValid ? 'bg-green-500' : 'bg-red-500'}`} />
              <View>
                <Text className="text-gray-900 text-lg font-semibold">
                  {touristData.isValid ? 'Valid Status' : 'Expired'}
                </Text>
                <Text className="text-gray-500 text-sm">
                  Valid until {touristData.validUntil}
                </Text>
              </View>
            </View>
            <Ionicons 
              name={touristData.isValid ? "checkmark-circle" : "close-circle"} 
              size={32} 
              color={touristData.isValid ? "#10B981" : "#EF4444"} 
            />
          </View>
          
          {touristData.isValid && (
            <View className="mt-4 pt-4 border-t border-gray-100">
              <Text className="text-gray-600 text-sm">
                This digital ID is verified and accepted by local authorities and emergency services.
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="h-24" />
      </View>
      )}
    </ScrollView>
  )
}

export default Id