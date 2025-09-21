const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwt_secret, jwt_expire } = require('../config/secret');

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
  password: {
    type: String,
    required: false, // Made optional for OTP-based registration
    minLength: [8, 'Password must have at least 8 characters'],
    maxLength: [32, 'Password cannot have more than 32 characters'],
    select: false, // Don't include password in queries by default
  },
  isVerified: {
    type: Boolean,
    default: false,
    required: true
  },
  profilePicture: {
    type: String,
    default: null,
    trim: true
  },
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt fields
  collection: 'users'
});

// Indexes for better performance (only for non-unique fields)
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
  delete user.password;
  return user;
};

// Compare password method (only if password exists)
userSchema.methods.comparePassword = async function(enteredPassword) {
  if (!this.password) {
    return false; // No password set for OTP-only users
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      name: this.name
    },
    jwt_secret,
    {
      expiresIn: jwt_expire || '7d',
    }
  );
};

// Verify JWT token (static method)
userSchema.statics.verifyAuthToken = function(token) {
  try {
    return jwt.verify(token, jwt_secret);
  } catch (error) {
    return null;
  }
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

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Convert email to lowercase before saving
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  
  // Trim whitespace from phone
  if (this.phone) {
    this.phone = this.phone.trim();
  }

  // Hash password if it's modified and exists
  if (this.isModified('password') && this.password && this.password.length > 0) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;