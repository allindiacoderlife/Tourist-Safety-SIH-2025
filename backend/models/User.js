const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [100, 'Email cannot exceed 100 characters'],
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    maxlength: [15, 'Phone number cannot exceed 15 characters'],
    match: [
      /^\+?[\d\s-()]+$/,
      'Please provide a valid phone number'
    ]
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [50, 'Country name cannot exceed 50 characters']
  },
  isVerified: {
    type: Boolean,
    default: false,
    required: true
  }
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt fields
  collection: 'users'
});

// Indexes for better performance (only for non-unique fields)
userSchema.index({ country: 1 });
userSchema.index({ isVerified: 1 });

// Virtual for ID (if you want to use id instead of _id)
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Instance methods
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.__v;
  return user;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByPhone = function(phone) {
  return this.findOne({ phone });
};

userSchema.statics.findVerifiedUsers = function() {
  return this.find({ isVerified: true });
};

userSchema.statics.findByCountry = function(country) {
  return this.find({ country });
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Convert email to lowercase before saving
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  
  // Trim whitespace from phone
  if (this.phone) {
    this.phone = this.phone.trim();
  }
  
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
