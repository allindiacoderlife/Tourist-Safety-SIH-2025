const nodemailer = require('nodemailer');
const SOS = require('../models/SOS');

// Send SOS email
const sendSOS = async (req, res) => {
  try {
    const { 
      email, 
      phone, 
      location, 
      message, 
      emergencyType, 
      priority 
    } = req.body;

    // Validate required input
    if (!email || !location) {
      return res.status(400).json({
        success: false,
        message: 'Email and location are required'
      });
    }

    // Validate location structure
    if (!location.address) {
      return res.status(400).json({
        success: false,
        message: 'Location address is required'
      });
    }

    // Create SOS record in database
    const sosRecord = new SOS({
      email,
      phone,
      location: {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude
      },
      message: message || 'Emergency SOS Alert',
      emergencyType: emergencyType || 'other',
      priority: priority || 'high'
    });
    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
        auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const master = "kushwahashivam64540@gmail.com"

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: master,
      subject: `SOS Alert - ${emergencyType || 'Emergency'}`,
      html: `
        <h2>🚨 SOS ALERT 🚨</h2>
        <p><strong>Emergency Type:</strong> ${emergencyType || 'Other'}</p>
        <p><strong>Priority:</strong> ${priority || 'High'}</p>
        <p><strong>Message:</strong> ${message || 'Emergency SOS Alert'}</p>
        <p><strong>Location:</strong> ${location.address}</p>
        ${location.latitude && location.longitude ? 
          `<p><strong>Coordinates:</strong> ${location.latitude}, ${location.longitude}</p>
           <p><strong>Google Maps:</strong> <a href="https://maps.google.com/?q=${location.latitude},${location.longitude}" target="_blank">View on Map</a></p>` 
          : ''
        }
        ${phone ? `<p><strong>Contact:</strong> ${phone}</p>` : ''}
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p><em>This is an automated emergency alert. Please respond immediately.</em></p>
      `,
      text: `SOS ALERT - ${emergencyType || 'Emergency'}\n\nMessage: ${message || 'Emergency SOS Alert'}\nLocation: ${location.address}\n${location.latitude && location.longitude ? `Coordinates: ${location.latitude}, ${location.longitude}\n` : ''}${phone ? `Contact: ${phone}\n` : ''}Time: ${new Date().toLocaleString()}`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    // Update SOS record with email sent status
    sosRecord.isEmailSent = true;
    sosRecord.emailSentAt = new Date();
    
    // Save the SOS record to database
    await sosRecord.save();

    res.status(200).json({
      success: true,
      message: 'SOS alert sent successfully',
      data: {
        id: sosRecord._id,
        email: sosRecord.email,
        location: sosRecord.location.address,
        status: sosRecord.status,
        createdAt: sosRecord.createdAt
      }
    });
  } catch (error) {
    console.error('Send SOS Error:', error);
    res.status(500).json({
        success: false,
        message: error.message || 'Failed to send SOS email'
    });
  }
};

// Get all SOS messages
const getAllSOS = async (req, res) => {
  try {
    const { 
      status, 
      emergencyType, 
      priority, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (emergencyType) filter.emergencyType = emergencyType;
    if (priority) filter.priority = priority;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get SOS messages with pagination and filtering
    const sosMessages = await SOS.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination info
    const totalCount = await SOS.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'SOS messages retrieved successfully',
      data: {
        sosMessages,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get SOS Messages Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve SOS messages'
    });
  }
};

// Get single SOS message by ID
const getSOS = async (req, res) => {
  try {
    const { id } = req.params;

    const sosMessage = await SOS.findById(id);

    if (!sosMessage) {
      return res.status(404).json({
        success: false,
        message: 'SOS message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'SOS message retrieved successfully',
      data: sosMessage
    });
  } catch (error) {
    console.error('Get SOS Message Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve SOS message'
    });
  }
};

// Update SOS status
const updateSOSStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, respondedBy } = req.body;

    // Validate status
    const validStatuses = ['pending', 'acknowledged', 'resolved', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }

    const updateData = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (respondedBy) updateData.respondedBy = respondedBy;
    
    // Set response time when status changes from pending
    if (status && status !== 'pending') {
      const currentSOS = await SOS.findById(id);
      if (currentSOS && currentSOS.status === 'pending' && !currentSOS.responseTime) {
        updateData.responseTime = new Date();
      }
    }

    const sosMessage = await SOS.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!sosMessage) {
      return res.status(404).json({
        success: false,
        message: 'SOS message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'SOS status updated successfully',
      data: sosMessage
    });
  } catch (error) {
    console.error('Update SOS Status Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update SOS status'
    });
  }
};

module.exports = { sendSOS, getAllSOS, getSOS, updateSOSStatus };