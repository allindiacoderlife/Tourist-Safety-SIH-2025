import { Ionicons } from '@expo/vector-icons'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Home = () => {
  const insets = useSafeAreaInsets()
  const touristName = "Sarah Johnson" // This would come from user data
  const safetyScore = 85 // This would be calculated based on various factors
  
  const getSafetyStatus = (score) => {
    if (score >= 80) return { status: 'Safe', color: 'bg-green-500', textColor: 'text-green-700' }
    if (score >= 60) return { status: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-700' }
    return { status: 'Risk', color: 'bg-red-500', textColor: 'text-red-700' }
  }

  const safetyInfo = getSafetyStatus(safetyScore)

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View className="px-6 py-4 bg-white shadow-sm">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-gray-500 text-sm">Welcome,</Text>
            <Text className="text-gray-900 text-xl font-bold">{touristName}</Text>
          </View>
          <Pressable className="bg-blue-50 p-3 rounded-full">
            <Ionicons name="qr-code-outline" size={24} color="#3B82F6" />
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 py-8">
        
        {/* Panic Button Section */}
        <View className="items-center mb-12">
          <Text className="text-gray-600 text-base mb-6 text-center">
            Press and hold for 3 seconds to send{'\n'}emergency alert
          </Text>
          
          {/* Large Panic Button */}
          <Pressable 
            className="bg-red-500 w-48 h-48 rounded-full items-center justify-center shadow-2xl"
            style={{
              shadowColor: '#EF4444',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 15,
            }}
          >
            <View className="items-center">
              <Ionicons name="warning" size={48} color="white" />
              <Text className="text-white text-2xl font-bold mt-2">PANIC</Text>
              <Text className="text-white text-sm opacity-90">Emergency</Text>
            </View>
          </Pressable>
        </View>

        {/* Feature Cards Grid */}
        <View className="space-y-4 mb-8">
          
          {/* Digital ID Card */}
          <Pressable className="bg-white p-6 rounded-2xl shadow-md flex-row items-center">
            <View className="bg-blue-50 p-4 rounded-full mr-4">
              <Ionicons name="id-card-outline" size={28} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-semibold">View Digital ID</Text>
              <Text className="text-gray-500 text-sm">Tourist ID • 2024 • Valid</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          {/* Map & Location Alerts Card */}
          <Pressable className="bg-white p-6 rounded-2xl shadow-md flex-row items-center">
            <View className="bg-green-50 p-4 rounded-full mr-4">
              <Ionicons name="map-outline" size={28} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-semibold">Map & Location Alerts</Text>
              <Text className="text-gray-500 text-sm">Get live alerts about safe zones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          {/* Emergency Contacts Card */}
          <Pressable className="bg-white p-6 rounded-2xl shadow-md flex-row items-center">
            <View className="bg-red-50 p-4 rounded-full mr-4">
              <Ionicons name="call-outline" size={28} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-semibold">Emergency Contacts</Text>
              <Text className="text-gray-500 text-sm">Quick access to help</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Safety Score Section */}
        <View className="bg-white p-6 rounded-2xl shadow-md">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-lg font-semibold">Safety Score</Text>
            <View className="flex-row items-center">
              <View className={`w-3 h-3 rounded-full mr-2 ${safetyInfo.color}`} />
              <Text className={`text-sm font-medium ${safetyInfo.textColor}`}>
                {safetyInfo.status}
              </Text>
            </View>
          </View>
          
          <Text className="text-3xl font-bold text-gray-900 mb-2">{safetyScore}%</Text>
          <Text className="text-gray-500 text-sm">
            Based on location, time and local conditions
          </Text>
          
          {/* Progress Bar */}
          <View className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <View 
              className={`h-2 rounded-full ${safetyInfo.color}`}
              style={{ width: `${safetyScore}%` }}
            />
          </View>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View className="h-24" />
      </View>
    </ScrollView>
  )
}

export default Home