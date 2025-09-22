import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StorageService } from '../../services/storage'
import { EmergencyContactsAPI } from '../../services/api'
import AddEditContactModal from '../modals/AddEditContactModal'

const EmergencyContacts = () => {
  const insets = useSafeAreaInsets()
  const [contacts, setContacts] = useState([])
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  // Load user data and emergency contacts
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load user data
      const user = await StorageService.getUserData()
      if (user) {
        setUserData(user)
        
        // Load emergency contacts
        const token = await StorageService.getAuthToken()
        if (token) {
          const response = await EmergencyContactsAPI.getContacts(token)
          if (response.success) {
            setContacts(response.data || [])
          } else {
            console.log('No emergency contacts found or error:', response.message)
            setContacts([])
          }
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddContact = () => {
    setEditingContact(null)
    setShowAddModal(true)
  }

  const handleEditContact = (contact) => {
    setEditingContact(contact)
    setShowAddModal(true)
  }

  const handleDeleteContact = (contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteContact(contact._id)
        }
      ]
    )
  }

  const deleteContact = async (contactId) => {
    try {
      const token = await StorageService.getAuthToken()
      if (!token) {
        Alert.alert('Error', 'Authentication required. Please login again.')
        return
      }

      const response = await EmergencyContactsAPI.deleteContact(contactId, token)
      if (response.success) {
        Alert.alert('Success', 'Contact deleted successfully')
        loadData() // Reload the contacts
      } else {
        Alert.alert('Error', response.message || 'Failed to delete contact')
      }
    } catch (error) {
      console.error('Delete contact error:', error)
      Alert.alert('Error', 'Failed to delete contact')
    }
  }

  const handleContactSaved = () => {
    setShowAddModal(false)
    setEditingContact(null)
    loadData() // Reload the contacts
  }

  const renderContactCard = (contact) => (
    <View key={contact._id} className="bg-white rounded-2xl p-6 shadow-md mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-red-50 p-3 rounded-full mr-4">
            <Ionicons name="person" size={24} color="#EF4444" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-lg font-semibold">{contact.name}</Text>
            <Text className="text-gray-600 text-sm">{contact.phone}</Text>
            <Text className="text-gray-500 text-xs">{contact.relationship}</Text>
          </View>
        </View>
        
        <View className="flex-row">
          <Pressable
            onPress={() => handleEditContact(contact)}
            className="bg-blue-50 p-2 rounded-lg mr-2"
          >
            <Ionicons name="pencil" size={18} color="#3B82F6" />
          </Pressable>
          
          <Pressable
            onPress={() => handleDeleteContact(contact)}
            className="bg-red-50 p-2 rounded-lg"
          >
            <Ionicons name="trash" size={18} color="#EF4444" />
          </Pressable>
        </View>
      </View>
      
      {contact.isPrimary && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text className="text-yellow-600 text-sm font-medium ml-1">Primary Contact</Text>
          </View>
        </View>
      )}
    </View>
  )

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="px-6 py-4 bg-white shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 text-xl font-bold">Emergency Contacts</Text>
            <Text className="text-gray-600 text-sm">Manage your emergency contacts</Text>
          </View>
          <Pressable 
            onPress={handleAddContact}
            className="bg-red-500 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-medium ml-1">Add</Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-1 px-6 py-6">
        
        {/* Info Card */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="text-blue-800 font-medium ml-2">Important Information</Text>
          </View>
          <Text className="text-blue-700 text-sm mt-1">
            Add trusted contacts who will be notified during emergencies. Set one as primary for priority alerts.
          </Text>
        </View>

        {/* Contacts List */}
        {loading ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-gray-500 text-lg">Loading contacts...</Text>
          </View>
        ) : contacts.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <View className="items-center">
              <View className="bg-gray-100 p-6 rounded-full mb-4">
                <Ionicons name="people-outline" size={48} color="#6B7280" />
              </View>
              <Text className="text-gray-700 text-lg font-semibold mb-2">No Emergency Contacts</Text>
              <Text className="text-gray-500 text-sm text-center mb-6">
                Add trusted contacts who can be{'\n'}reached during emergencies
              </Text>
              <Pressable 
                onPress={handleAddContact}
                className="bg-red-500 px-6 py-3 rounded-lg flex-row items-center"
              >
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-medium ml-2">Add First Contact</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View>
            <Text className="text-gray-700 text-lg font-semibold mb-4">
              Your Emergency Contacts ({contacts.length})
            </Text>
            {contacts.map(contact => renderContactCard(contact))}
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-24" />
      </View>

      {/* Add/Edit Contact Modal */}
      <AddEditContactModal
        visible={showAddModal}
        contact={editingContact}
        onClose={() => {
          setShowAddModal(false)
          setEditingContact(null)
        }}
        onSave={handleContactSaved}
      />
    </ScrollView>
  )
}

export default EmergencyContacts