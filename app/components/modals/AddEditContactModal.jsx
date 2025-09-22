import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import { 
  Alert, 
  Modal, 
  Pressable, 
  ScrollView, 
  Text, 
  TextInput, 
  View, 
  Switch 
} from 'react-native'
import { StorageService } from '../../services/storage'
import { EmergencyContactsAPI } from '../../services/api'

const AddEditContactModal = ({ visible, contact, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    isPrimary: false
  })
  const [loading, setLoading] = useState(false)

  // Relationship options
  const relationshipOptions = [
    'Family Member',
    'Spouse',
    'Parent',
    'Sibling',
    'Child',
    'Friend',
    'Colleague',
    'Doctor',
    'Lawyer',
    'Other'
  ]

  // Initialize form data when modal opens
  useEffect(() => {
    if (visible) {
      if (contact) {
        // Editing existing contact
        setFormData({
          name: contact.name || '',
          phone: contact.phone || '',
          email: contact.email || '',
          relationship: contact.relationship || '',
          isPrimary: contact.isPrimary || false
        })
      } else {
        // Adding new contact
        setFormData({
          name: '',
          phone: '',
          email: '',
          relationship: '',
          isPrimary: false
        })
      }
    }
  }, [visible, contact])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter contact name')
      return false
    }
    
    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Please enter phone number')
      return false
    }
    
    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    if (!phoneRegex.test(formData.phone)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number')
      return false
    }
    
    if (!formData.relationship.trim()) {
      Alert.alert('Validation Error', 'Please select relationship')
      return false
    }
    
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      const token = await StorageService.getAuthToken()
      
      if (!token) {
        Alert.alert('Error', 'Authentication required. Please login again.')
        return
      }

      let response
      if (contact?._id) {
        // Update existing contact
        response = await EmergencyContactsAPI.updateContact(contact._id, formData, token)
      } else {
        // Create new contact
        response = await EmergencyContactsAPI.addContact(formData, token)
      }

      if (response.success) {
        Alert.alert(
          'Success', 
          contact ? 'Contact updated successfully!' : 'Contact added successfully!',
          [{ text: 'OK', onPress: onSave }]
        )
      } else {
        Alert.alert('Error', response.message || 'Failed to save contact')
      }
    } catch (error) {
      console.error('Save contact error:', error)
      Alert.alert('Error', 'Failed to save contact. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderRelationshipOptions = () => {
    return relationshipOptions.map(option => (
      <Pressable
        key={option}
        onPress={() => handleInputChange('relationship', option)}
        className={`p-3 mb-2 rounded-lg border ${
          formData.relationship === option 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-200 bg-white'
        }`}
      >
        <Text className={`text-center ${
          formData.relationship === option 
            ? 'text-red-700 font-medium' 
            : 'text-gray-700'
        }`}>
          {option}
        </Text>
      </Pressable>
    ))
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
          <View>
            <Text className="text-xl font-bold text-gray-900">
              {contact ? 'Edit Contact' : 'Add Emergency Contact'}
            </Text>
            <Text className="text-gray-600 text-sm">
              {contact ? 'Update contact information' : 'Add a trusted person to contact during emergencies'}
            </Text>
          </View>
          <Pressable 
            onPress={onClose}
            className="bg-gray-100 p-2 rounded-full"
          >
            <Ionicons name="close" size={24} color="#374151" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          
          {/* Contact Name */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Full Name *</Text>
            <TextInput
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter contact name"
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Phone Number */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Phone Number *</Text>
            <TextInput
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Email (Optional) */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Email (Optional)</Text>
            <TextInput
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="contact@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Relationship */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-3">Relationship *</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              <View className="flex-row space-x-2">
                {relationshipOptions.slice(0, 5).map(option => (
                  <Pressable
                    key={option}
                    onPress={() => handleInputChange('relationship', option)}
                    className={`px-4 py-2 rounded-full ${
                      formData.relationship === option 
                        ? 'bg-red-500' 
                        : 'bg-gray-200'
                    }`}
                  >
                    <Text className={`text-sm ${
                      formData.relationship === option 
                        ? 'text-white font-medium' 
                        : 'text-gray-700'
                    }`}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            
            {/* Other relationships dropdown */}
            <Pressable
              onPress={() => {
                // Show all options in alert
                Alert.alert(
                  'Select Relationship',
                  'Choose the relationship type:',
                  relationshipOptions.map(option => ({
                    text: option,
                    onPress: () => handleInputChange('relationship', option)
                  })).concat([{ text: 'Cancel', style: 'cancel' }])
                )
              }}
              className="border border-gray-200 rounded-lg p-4 flex-row items-center justify-between"
            >
              <Text className={formData.relationship ? 'text-gray-900' : 'text-gray-400'}>
                {formData.relationship || 'Select relationship'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* Primary Contact Toggle */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-lg">
              <View className="flex-1">
                <Text className="text-gray-700 text-base font-medium">Primary Contact</Text>
                <Text className="text-gray-500 text-sm">
                  This contact will be notified first during emergencies
                </Text>
              </View>
              <Switch
                value={formData.isPrimary}
                onValueChange={(value) => handleInputChange('isPrimary', value)}
                trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
                thumbColor={formData.isPrimary ? '#EF4444' : '#F3F4F6'}
              />
            </View>
          </View>

          {/* Important Note */}
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="warning" size={16} color="#F59E0B" />
              <Text className="text-yellow-800 text-sm font-medium ml-2">Important</Text>
            </View>
            <Text className="text-yellow-700 text-sm mt-1">
              Ensure the contact information is accurate. This person will be contacted during emergencies.
            </Text>
          </View>

        </ScrollView>

        {/* Footer Buttons */}
        <View className="flex-row p-6 border-t border-gray-200">
          <Pressable
            onPress={onClose}
            className="flex-1 bg-gray-200 py-4 rounded-lg mr-3"
          >
            <Text className="text-gray-700 text-center font-medium">Cancel</Text>
          </Pressable>
          
          <Pressable
            onPress={handleSave}
            disabled={loading}
            className={`flex-1 py-4 rounded-lg ml-3 ${
              loading ? 'bg-gray-400' : 'bg-red-500'
            }`}
          >
            <Text className="text-white text-center font-medium">
              {loading ? 'Saving...' : (contact ? 'Update Contact' : 'Add Contact')}
            </Text>
          </Pressable>
        </View>

      </View>
    </Modal>
  )
}

export default AddEditContactModal