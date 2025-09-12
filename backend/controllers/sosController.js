const { SOS, User } = require('../models');
const notificationService = require('../services/notificationService');

// Trigger SOS Alert
const triggerSOS = async (req, res) => {
  try {
    const { userId, location, description, emergencyContacts } = req.body;

    // Validate required fields
    if (!userId || !location) {
      return res.status(400).json({
        success: false,
        message: 'User ID and location are required'
      });
    }

    if (!location.latitude || !location.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required in location'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new SOS alert
    const sosAlert = new SOS({
      userId,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || ''
      },
      description: description || '',
      emergencyContacts: emergencyContacts || []
    });

    await sosAlert.save();

    // Populate user data for the response
    await sosAlert.populate('userId', 'name email phone country');

    // Send notifications (Socket.IO + SMS/Email)
    try {
      const notificationResults = await notificationService.sendSOSNotification(sosAlert);
      console.log('Notification results:', notificationResults);
      
      // Update notification status in the alert
      if (notificationResults.emergencyContacts) {
        sosAlert.notificationsSent.sms = notificationResults.emergencyContacts.sms?.length > 0;
        sosAlert.notificationsSent.email = notificationResults.emergencyContacts.email?.length > 0;
      }
      sosAlert.notificationsSent.dashboard = notificationResults.dashboard;
      await sosAlert.save();
      
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't fail the request if notifications fail, just log it
    }

    res.status(201).json({
      success: true,
      message: 'SOS alert triggered successfully',
      data: {
        alert: sosAlert,
        triggeredAt: sosAlert.createdAt
      }
    });

  } catch (error) {
    console.error('Error triggering SOS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger SOS alert',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get Active Alerts (for Dashboard)
const getActiveAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 10, priority, userId } = req.query;
    
    const query = { status: 'active' };
    
    // Filter by priority if provided
    if (priority && ['low', 'medium', 'high', 'critical'].includes(priority)) {
      query.priority = priority;
    }
    
    // Filter by user if provided
    if (userId) {
      query.userId = userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const alerts = await SOS.find(query)
      .populate('userId', 'name email phone country')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalAlerts = await SOS.countDocuments(query);
    const totalPages = Math.ceil(totalAlerts / parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Active alerts retrieved successfully',
      data: {
        alerts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAlerts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting active alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve active alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get All Alerts (with status filter)
const getAllAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, userId } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status && ['active', 'resolved', 'cancelled'].includes(status)) {
      query.status = status;
    }
    
    // Filter by priority if provided
    if (priority && ['low', 'medium', 'high', 'critical'].includes(priority)) {
      query.priority = priority;
    }
    
    // Filter by user if provided
    if (userId) {
      query.userId = userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const alerts = await SOS.find(query)
      .populate('userId', 'name email phone country')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalAlerts = await SOS.countDocuments(query);
    const totalPages = Math.ceil(totalAlerts / parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Alerts retrieved successfully',
      data: {
        alerts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAlerts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get Single Alert
const getAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await SOS.findById(alertId)
      .populate('userId', 'name email phone country')
      .populate('resolvedBy', 'name email');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert retrieved successfully',
      data: { alert }
    });

  } catch (error) {
    console.error('Error getting alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alert',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update Alert Status (Dashboard)
const updateAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status, resolvedBy, resolutionNotes, priority } = req.body;

    // Validate status
    if (status && !['active', 'resolved', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, resolved, or cancelled'
      });
    }

    // Validate priority
    if (priority && !['low', 'medium', 'high', 'critical'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be low, medium, high, or critical'
      });
    }

    const alert = await SOS.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    // Update fields if provided
    if (status) alert.status = status;
    if (priority) alert.priority = priority;
    
    // If resolving the alert
    if (status === 'resolved') {
      alert.resolvedAt = new Date();
      if (resolvedBy) alert.resolvedBy = resolvedBy;
      if (resolutionNotes) alert.resolutionNotes = resolutionNotes;
    }

    await alert.save();
    await alert.populate('userId', 'name email phone country');
    await alert.populate('resolvedBy', 'name email');

    // Send update notifications
    try {
      await notificationService.sendSOSUpdateNotification(alert, status || 'updated');
    } catch (notificationError) {
      console.error('Error sending update notifications:', notificationError);
    }

    res.status(200).json({
      success: true,
      message: `SOS alert ${status || 'updated'} successfully`,
      data: { alert }
    });

  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get User's SOS History
const getUserSOSHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const query = { userId };
    if (status && ['active', 'resolved', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const alerts = await SOS.find(query)
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalAlerts = await SOS.countDocuments(query);
    const totalPages = Math.ceil(totalAlerts / parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'User SOS history retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        alerts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAlerts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting user SOS history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user SOS history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get Nearby Active Alerts
const getNearbyAlerts = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates or radius'
      });
    }

    const alerts = await SOS.findNearbyAlerts(lat, lng, radiusKm);

    res.status(200).json({
      success: true,
      message: 'Nearby alerts retrieved successfully',
      data: {
        alerts,
        searchCriteria: {
          latitude: lat,
          longitude: lng,
          radius: radiusKm
        },
        count: alerts.length
      }
    });

  } catch (error) {
    console.error('Error getting nearby alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve nearby alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete Alert (Admin only)
const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await SOS.findByIdAndDelete(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'SOS alert deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  triggerSOS,
  getActiveAlerts,
  getAllAlerts,
  getAlert,
  updateAlert,
  getUserSOSHistory,
  getNearbyAlerts,
  deleteAlert
};
