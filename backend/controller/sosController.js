const SOS = require('../models/SOS');
const { sendSOSAlertEmail } = require('../config/email');
const { sos_emergency_email } = require('../config/secret');

// Send SOS alert
const sendSOS = async (req, res) => {
  try {
    const { email, location, coordinates, mapsLink, accuracy } = req.body;

    // Emergency contact email from environment or fallback to hardcoded
    const emergencyContactEmail = sos_emergency_email || 'chiragsaxena728@gmail.com';

    // Validate required fields
    if (!location || !coordinates || !mapsLink || accuracy === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Location, coordinates, mapsLink, and accuracy are required'
      });
    }

    // Validate coordinates
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Valid coordinates (latitude and longitude) are required'
      });
    }

    // Create SOS alert
    const sosAlert = new SOS({
      user: req.user._id,
      email: emergencyContactEmail, // Use hardcoded emergency email
      location: location.trim(),
      coordinates: {
        latitude: parseFloat(coordinates.latitude),
        longitude: parseFloat(coordinates.longitude)
      },
      mapsLink: mapsLink.trim(),
      accuracy: parseFloat(accuracy),
      timestamp: new Date()
    });

    await sosAlert.save();

    // Send email notification to emergency contact
    try {
      const emailResult = await sendSOSAlertEmail({
        to: emergencyContactEmail,
        userName: req.user.name,
        location: sosAlert.location,
        coordinates: sosAlert.coordinates,
        mapsLink: sosAlert.mapsLink,
        timestamp: sosAlert.timestamp,
        accuracy: sosAlert.accuracy
      });

      console.log('SOS email sent to emergency contact:', emergencyContactEmail);
    } catch (emailError) {
      console.error('Failed to send SOS email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'SOS alert sent successfully',
      data: {
        sosId: sosAlert.id,
        status: sosAlert.status,
        timestamp: sosAlert.timestamp,
        emergencyContactNotified: emergencyContactEmail
      }
    });
  } catch (error) {
    console.error('Error sending SOS alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending SOS alert',
      error: error.message
    });
  }
};

// Get all SOS alerts (with filtering and pagination)
const getAllSOS = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Build filter object
    let filter = {};

    // Only show user's own SOS alerts (unless admin - future feature)
    filter.user = req.user._id;

    // Filter by status if provided
    if (status && ['pending', 'acknowledged', 'resolved', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await SOS.countDocuments(filter);

    // Get SOS alerts with user data populated
    const sosAlerts = await SOS.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'SOS alerts retrieved successfully',
      data: {
        sosAlerts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting SOS alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving SOS alerts',
      error: error.message
    });
  }
};

// Get single SOS alert by ID
const getSOS = async (req, res) => {
  try {
    const { id } = req.params;

    const sosAlert = await SOS.findById(id).populate('user', 'name email phone');

    if (!sosAlert) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    // Check if user owns this SOS alert
    if (sosAlert.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this SOS alert'
      });
    }

    res.status(200).json({
      success: true,
      message: 'SOS alert retrieved successfully',
      data: sosAlert
    });
  } catch (error) {
    console.error('Error getting SOS alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving SOS alert',
      error: error.message
    });
  }
};

// Update SOS status
const updateSOSStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    if (!status || !['pending', 'acknowledged', 'resolved', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (pending, acknowledged, resolved, cancelled)'
      });
    }

    const sosAlert = await SOS.findById(id);

    if (!sosAlert) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    // Check if user owns this SOS alert
    if (sosAlert.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this SOS alert'
      });
    }

    // Update status
    sosAlert.status = status;

    // Add notes if provided
    if (notes) {
      sosAlert.notes = notes.trim();
    }

    // Set resolved timestamp if status is resolved
    if (status === 'resolved') {
      sosAlert.resolvedAt = new Date();
    }

    await sosAlert.save();

    res.status(200).json({
      success: true,
      message: 'SOS alert status updated successfully',
      data: sosAlert
    });
  } catch (error) {
    console.error('Error updating SOS status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating SOS alert status',
      error: error.message
    });
  }
};

module.exports = {
  sendSOS,
  getAllSOS,
  getSOS,
  updateSOSStatus
};