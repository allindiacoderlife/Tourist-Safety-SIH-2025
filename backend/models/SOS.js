const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [15, 'Phone number cannot exceed 15 characters']
  },
  location: {
    type: {
      address: {
        type: String,
        required: [true, 'Location address is required'],
        trim: true,
        maxlength: [500, 'Location cannot exceed 500 characters']
      },
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    required: [true, 'Location is required']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
    default: 'Emergency SOS Alert'
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'resolved', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  emergencyType: {
    type: String,
    enum: ['medical', 'accident', 'crime', 'natural_disaster', 'other'],
    default: 'other'
  },
  respondedBy: {
    type: String,
    trim: true
  },
  responseTime: {
    type: Date
  },
  isEmailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
sosSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
sosSchema.index({ createdAt: -1 });
sosSchema.index({ status: 1 });
sosSchema.index({ priority: 1 });
sosSchema.index({ emergencyType: 1 });

const SOS = mongoose.model('SOS', sosSchema);

module.exports = SOS;