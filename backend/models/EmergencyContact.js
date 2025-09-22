const mongoose = require('mongoose');

// Relationship types enum
const RELATIONSHIP_TYPES = [
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
];

const emergencyContactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Validate phone number format (international format with country code)
        return /^\+\d{1,3}\s?\d{4,14}$/.test(v);
      },
      message: 'Invalid phone number format. Use format: +91 98765 43210'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // Email is optional, but if provided, must be valid
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: {
      values: RELATIONSHIP_TYPES,
      message: `Relationship must be one of: ${RELATIONSHIP_TYPES.join(', ')}`
    }
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for performance
emergencyContactSchema.index({ userId: 1, isPrimary: 1 });
emergencyContactSchema.index({ userId: 1, isActive: 1 });
emergencyContactSchema.index({ userId: 1, isPrimary: -1, createdAt: -1 });

// Pre-save middleware to ensure only one primary contact per user
emergencyContactSchema.pre('save', async function(next) {
  if (this.isPrimary && this.isModified('isPrimary')) {
    // If setting this contact as primary, unset all other primary contacts for this user
    await this.constructor.updateMany(
      { 
        userId: this.userId, 
        _id: { $ne: this._id },
        isActive: true 
      },
      { $set: { isPrimary: false } }
    );
  }
  next();
});

// Static method to get primary contact
emergencyContactSchema.statics.findPrimaryContact = function(userId) {
  return this.findOne({
    userId,
    isPrimary: true,
    isActive: true
  });
};

// Static method to get all active contacts for user
emergencyContactSchema.statics.findActiveContacts = function(userId) {
  return this.find({
    userId,
    isActive: true
  }).sort({ isPrimary: -1, createdAt: -1 });
};

// Instance method to set as primary
emergencyContactSchema.methods.setPrimary = async function() {
  // Unset all other primary contacts for this user
  await this.constructor.updateMany(
    { 
      userId: this.userId, 
      _id: { $ne: this._id },
      isActive: true 
    },
    { $set: { isPrimary: false } }
  );
  
  // Set this contact as primary
  this.isPrimary = true;
  return this.save();
};

// Instance method for soft delete
emergencyContactSchema.methods.softDelete = async function() {
  this.isActive = false;
  
  // If deleting primary contact, set another contact as primary
  if (this.isPrimary) {
    const nextContact = await this.constructor.findOne({
      userId: this.userId,
      _id: { $ne: this._id },
      isActive: true
    }).sort({ createdAt: 1 }); // Get oldest active contact
    
    if (nextContact) {
      nextContact.isPrimary = true;
      await nextContact.save();
    }
  }
  
  return this.save();
};

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

// Export model and constants
module.exports = {
  EmergencyContact,
  RELATIONSHIP_TYPES
};