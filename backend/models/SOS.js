const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  location: {
    type: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      },
      address: {
        type: String,
        trim: true,
        maxlength: [255, 'Address cannot exceed 255 characters']
      }
    },
    required: [true, 'Location is required']
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'resolved', 'cancelled'],
      message: 'Status must be either active, resolved, or cancelled'
    },
    default: 'active'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Priority must be low, medium, high, or critical'
    },
    default: 'high'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Resolution notes cannot exceed 500 characters']
  },
  emergencyContacts: [{
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Contact name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [15, 'Phone number cannot exceed 15 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters']
    },
    relation: {
      type: String,
      trim: true,
      maxlength: [50, 'Relation cannot exceed 50 characters']
    }
  }],
  notificationsSent: {
    sms: {
      type: Boolean,
      default: false
    },
    email: {
      type: Boolean,
      default: false
    },
    dashboard: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  collection: 'sos_alerts'
});

// Indexes for better performance
sosSchema.index({ userId: 1 });
sosSchema.index({ status: 1 });
sosSchema.index({ priority: 1 });
sosSchema.index({ createdAt: -1 });
sosSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Virtual for ID
sosSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
sosSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Static methods
sosSchema.statics.findActiveAlerts = function() {
  return this.find({ status: 'active' })
    .populate('userId', 'name email phone country')
    .sort({ createdAt: -1 });
};

sosSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .sort({ createdAt: -1 });
};

sosSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('userId', 'name email phone country')
    .sort({ createdAt: -1 });
};

sosSchema.statics.findNearbyAlerts = function(latitude, longitude, radiusInKm = 10) {
  const radiusInRadians = radiusInKm / 6371; // Earth's radius in km
  
  return this.find({
    status: 'active',
    'location.latitude': {
      $gte: latitude - radiusInRadians,
      $lte: latitude + radiusInRadians
    },
    'location.longitude': {
      $gte: longitude - radiusInRadians,
      $lte: longitude + radiusInRadians
    }
  }).populate('userId', 'name email phone country');
};

// Instance methods
sosSchema.methods.resolve = function(resolvedBy, resolutionNotes) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  this.resolutionNotes = resolutionNotes;
  return this.save();
};

sosSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Pre-save middleware
sosSchema.pre('save', function(next) {
  // Set resolvedAt when status changes to resolved
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  
  next();
});

const SOS = mongoose.model('SOS', sosSchema);

module.exports = SOS;
