// SOS History and Management Component
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  Alert,
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SOSAPI } from '../../services/api';
import { StorageService } from '../../services/storage';

const SOSHistory = () => {
  const [sosHistory, setSOSHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadSOSHistory();
  }, []);

  const loadSOSHistory = async (page = 1, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = await StorageService.getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await SOSAPI.getSOSHistory(token, {
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (response.success) {
        setSOSHistory(response.data.sosAlerts);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load SOS history:', error);
      Alert.alert('Error', 'Failed to load SOS history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSOSHistory(1, false);
  };

  const updateSOSStatus = async (sosId, currentStatus) => {
    const statuses = ['pending', 'acknowledged', 'resolved', 'cancelled'];
    const statusOptions = statuses
      .filter(status => status !== currentStatus)
      .map(status => ({
        text: status.charAt(0).toUpperCase() + status.slice(1),
        onPress: () => performStatusUpdate(sosId, status)
      }));

    Alert.alert(
      'Update SOS Status',
      `Current status: ${currentStatus}`,
      [
        { text: 'Cancel', style: 'cancel' },
        ...statusOptions
      ]
    );
  };

  const performStatusUpdate = async (sosId, newStatus) => {
    try {
      const token = await StorageService.getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await SOSAPI.updateSOSStatus(sosId, newStatus, token);
      if (response.success) {
        Alert.alert('Success', `SOS status updated to ${newStatus}`);
        loadSOSHistory();
      }
    } catch (error) {
      console.error('Failed to update SOS status:', error);
      Alert.alert('Error', 'Failed to update SOS status');
    }
  };

  const viewSOSDetails = async (sosId) => {
    try {
      const token = await StorageService.getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await SOSAPI.getSOSById(sosId, token);
      if (response.success) {
        const sos = response.data;
        Alert.alert(
          'SOS Details',
          `ID: ${sos.id}\n` +
          `Email: ${sos.email}\n` +
          `Location: ${sos.location}\n` +
          `Coordinates: ${sos.coordinates.latitude}, ${sos.coordinates.longitude}\n` +
          `Accuracy: ±${sos.accuracy} meters\n` +
          `Status: ${sos.status}\n` +
          `Created: ${new Date(sos.createdAt).toLocaleString()}\n` +
          `Updated: ${new Date(sos.updatedAt).toLocaleString()}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to get SOS details:', error);
      Alert.alert('Error', 'Failed to load SOS details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'acknowledged': return '#2196F3';
      case 'resolved': return '#4CAF50';
      case 'cancelled': return '#9E9E9E';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading SOS history...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
          SOS History ({pagination.totalCount || 0})
        </Text>
        
        {sosHistory.length === 0 ? (
          <View style={{
            backgroundColor: 'white',
            padding: 40,
            borderRadius: 8,
            alignItems: 'center'
          }}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16, color: '#666' }}>
              No SOS Alerts
            </Text>
            <Text style={{ color: '#999', textAlign: 'center', marginTop: 8 }}>
              You haven&apos;t sent any emergency alerts yet.
            </Text>
          </View>
        ) : (
          sosHistory.map((sos, index) => (
            <View
              key={sos._id}
              style={{
                backgroundColor: 'white',
                padding: 16,
                marginBottom: 12,
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2
              }}
            >
              {/* Header */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons 
                    name="alert-circle" 
                    size={24} 
                    color={getStatusColor(sos.status)} 
                  />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginLeft: 8,
                    color: '#333'
                  }}>
                    SOS Alert
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: getStatusColor(sos.status),
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12
                  }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                      {sos.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Content */}
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                📧 {sos.email}
              </Text>
              <Text style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                📍 {sos.location}
              </Text>
              <Text style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
                📅 {new Date(sos.createdAt).toLocaleString()}
              </Text>

              {/* Actions */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => viewSOSDetails(sos._id)}
                  style={{
                    backgroundColor: '#007AFF',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                    View Details
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => updateSOSStatus(sos._id, sos.status)}
                  style={{
                    backgroundColor: '#4CAF50',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                    Update Status
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
        
        {/* Pagination Info */}
        {pagination.totalCount > 0 && (
          <View style={{
            backgroundColor: 'white',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 8
          }}>
            <Text style={{ color: '#666', fontSize: 12 }}>
              Page {pagination.currentPage} of {pagination.totalPages} 
              ({pagination.totalCount} total alerts)
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SOSHistory;