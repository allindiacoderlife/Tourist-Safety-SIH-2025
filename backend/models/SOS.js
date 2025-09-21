const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for SOS alert']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [500, 'Location description cannot exceed 500 characters']
  },
  coordinates: {
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
    }
  },
  mapsLink: {
    type: String,
    required: [true, 'Maps link is required'],
    trim: true
  },
  accuracy: {
    type: Number,
    required: [true, 'Location accuracy is required'],
    min: [0, 'Accuracy cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'resolved', 'cancelled'],
    default: 'pending',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  resolvedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt fields
  collection: 'sos_alerts'
});

// Indexes for better performance
sosSchema.index({ user: 1, createdAt: -1 }); // User's SOS alerts by date
sosSchema.index({ status: 1, createdAt: -1 }); // SOS alerts by status and date
sosSchema.index({ createdAt: -1 }); // All SOS alerts by date

// Virtual for ID (if you want to use id instead of _id)
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

// Instance methods
sosSchema.methods.toJSON = function() {
  const sos = this.toObject();
  delete sos.__v;
  return sos;
};

// Mark as resolved
sosSchema.methods.markResolved = function(notes = '') {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

// Static methods
sosSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

sosSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

sosSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Pre-save middleware
sosSchema.pre('save', function(next) {
  // Trim whitespace from strings
  if (this.location) {
    this.location = this.location.trim();
  }
  if (this.notes) {
    this.notes = this.notes.trim();
  }

  next();
});

const SOS = mongoose.model('SOS', sosSchema);

module.exports = SOS;