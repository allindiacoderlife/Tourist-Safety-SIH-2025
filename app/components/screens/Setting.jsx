import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Alert, Image, Pressable, ScrollView, Switch, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../context/AuthContext'

const Setting = () => {
  const insets = useSafeAreaInsets()
  const { logout, user } = useAuth()
  
  // State for toggles
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true)
  
  // Mock user data - replace with actual user data from context
  const userData = user ? {
    name: user.name || "User",
    touristId: `TID-${user._id?.slice(-7) || '0000000'}`,
    photo: user.profilePicture || null,
    isVerified: user.isVerified || false
  } : {
    name: "User",
    touristId: "TID-0000000",
    photo: null,
    isVerified: false
  }

  const handleEditProfile = () => {
    console.log('Edit Profile')
  }

  const handleChangePassword = () => {
    console.log('Change Password')
  }

  const handleManageDigitalID = () => {
    console.log('Manage Digital ID')
  }

  const handleLogout = async () => {
    try {
      await logout();
      // The AuthContext will handle updating the authentication state
      // and the app will automatically navigate back to the auth screens
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  }

  const handleLanguageSelection = () => {
    console.log('Language Selection')
  }

  const handleManageEmergencyContacts = () => {
    console.log('Manage Emergency Contacts')
  }

  const handleTestPanicButton = () => {
    console.log('Test Panic Button')
  }

  const handleAboutApp = () => {
    console.log('About App')
  }

  const handlePrivacyPolicy = () => {
    console.log('Privacy Policy & Terms')
  }

  const handleContactSupport = () => {
    console.log('Contact Support')
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="px-6 py-4 bg-blue-500">
        <Text className="text-white text-xl font-bold">Profile & Settings</Text>
      </View>

      <View className="flex-1 px-6 py-6">
        
        {/* Profile Section */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-md">
          <View className="items-center">
            {/* Profile Photo */}
            <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
              {userData.photo ? (
                <Image 
                  source={{ uri: userData.photo }} 
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <Ionicons name="person" size={48} color="#9CA3AF" />
              )}
            </View>
            
            {/* User Info */}
            <Text className="text-gray-900 text-2xl font-bold">{userData.name}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-500 text-base">Tourist ID: {userData.touristId}</Text>
              {userData.isVerified && (
                <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginLeft: 8 }} />
              )}
            </View>
            
            {/* Edit Profile Button */}
            <Pressable 
              onPress={handleEditProfile}
              className="bg-blue-500 py-3 px-8 rounded-full mt-4"
            >
              <Text className="text-white text-base font-semibold">Edit Profile</Text>
            </Pressable>
          </View>
        </View>

        {/* Account Section */}
        <View className="mb-6">
          <Text className="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-3 px-2">
            ACCOUNT
          </Text>
          <View className="bg-white rounded-2xl shadow-md">
            {/* Change Password */}
            <Pressable 
              onPress={handleChangePassword}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="bg-blue-50 p-3 rounded-full mr-4">
                <Ionicons name="key-outline" size={24} color="#3B82F6" />
              </View>
              <Text className="flex-1 text-gray-900 text-base font-medium">Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {/* Manage Digital ID */}
            <Pressable 
              onPress={handleManageDigitalID}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="bg-green-50 p-3 rounded-full mr-4">
                <Ionicons name="id-card-outline" size={24} color="#10B981" />
              </View>
              <Text className="flex-1 text-gray-900 text-base font-medium">Manage Digital ID</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {/* Logout */}
            <Pressable 
              onPress={handleLogout}
              className="flex-row items-center p-4"
            >
              <View className="bg-red-50 p-3 rounded-full mr-4">
                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              </View>
              <Text className="flex-1 text-red-500 text-base font-medium">Logout</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mb-6">
          <Text className="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-3 px-2">
            PREFERENCES
          </Text>
          <View className="bg-white rounded-2xl shadow-md">
            {/* Language Selection */}
            <Pressable 
              onPress={handleLanguageSelection}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="bg-purple-50 p-3 rounded-full mr-4">
                <Ionicons name="language-outline" size={24} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-base font-medium">Language</Text>
                <Text className="text-gray-500 text-sm">English</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {/* Real-time Tracking */}
            <View className="flex-row items-center p-4 border-b border-gray-100">
              <View className="bg-orange-50 p-3 rounded-full mr-4">
                <Ionicons name="location-outline" size={24} color="#F97316" />
              </View>
              <Text className="flex-1 text-gray-900 text-base font-medium">Real-time Tracking</Text>
              <Switch
                value={isTrackingEnabled}
                onValueChange={setIsTrackingEnabled}
                trackColor={{ false: '#F3F4F6', true: '#3B82F6' }}
                thumbColor={isTrackingEnabled ? '#ffffff' : '#ffffff'}
              />
            </View>

            {/* Notifications Header */}
            <View className="p-4 border-b border-gray-100">
              <Text className="text-gray-900 text-base font-medium mb-3">Notifications</Text>
              
              {/* Sound */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-600 text-sm">Sound</Text>
                <Switch
                  value={isSoundEnabled}
                  onValueChange={setIsSoundEnabled}
                  trackColor={{ false: '#F3F4F6', true: '#3B82F6' }}
                  thumbColor={isSoundEnabled ? '#ffffff' : '#ffffff'}
                />
              </View>
              
              {/* Vibration */}
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600 text-sm">Vibration</Text>
                <Switch
                  value={isVibrationEnabled}
                  onValueChange={setIsVibrationEnabled}
                  trackColor={{ false: '#F3F4F6', true: '#3B82F6' }}
                  thumbColor={isVibrationEnabled ? '#ffffff' : '#ffffff'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Settings Section */}
        <View className="mb-6">
          <Text className="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-3 px-2">
            EMERGENCY SETTINGS
          </Text>
          <View className="bg-white rounded-2xl shadow-md">
            {/* Manage Emergency Contacts */}
            <Pressable 
              onPress={handleManageEmergencyContacts}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="bg-red-50 p-3 rounded-full mr-4">
                <Ionicons name="people-outline" size={24} color="#EF4444" />
              </View>
              <Text className="flex-1 text-gray-900 text-base font-medium">Manage Emergency Contacts</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {/* Test Panic Button */}
            <Pressable 
              onPress={handleTestPanicButton}
              className="flex-row items-center p-4"
            >
              <View className="bg-red-50 p-3 rounded-full mr-4">
                <Ionicons name="warning-outline" size={24} color="#EF4444" />
              </View>
              <Text className="flex-1 text-gray-900 text-base font-medium">Test Panic Button</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* General Section */}
        <View className="mb-6">
          <Text className="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-3 px-2">
            GENERAL
          </Text>
          <View className="bg-white rounded-2xl shadow-md">
            {/* About App */}
            <Pressable 
              onPress={handleAboutApp}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="bg-gray-50 p-3 rounded-full mr-4">
                <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
              </View>
              <Text className="flex-1 text-gray-900 text-base font-medium">About App</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {/* Privacy Policy & Terms */}
            <Pressable 
              onPress={handlePrivacyPolicy}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="bg-gray-50 p-3 rounded-full mr-4">
                <Ionicons name="shield-outline" size={24} color="#6B7280" />
              </View>
              <Text className="flex-1 text-gray-900 text-base font-medium">Privacy Policy & Terms</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {/* Contact Support */}
            <Pressable 
              onPress={handleContactSupport}
              className="flex-row items-center p-4"
            >
              <View className="bg-gray-50 p-3 rounded-full mr-4">
                <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
              </View>
              <Text className="flex-1 text-gray-900 text-base font-medium">Contact Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-24" />
      </View>
    </ScrollView>
  )
}

export default Setting