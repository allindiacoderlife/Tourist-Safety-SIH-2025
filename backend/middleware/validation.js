const User = require('../models/User');

// Validation middleware for user creation
const validateUserCreation = (req, res, next) => {
  const { name, email, phone } = req.body;
  const errors = [];

  // Required fields validation
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  }

  if (!phone || phone.trim().length === 0) {
    errors.push('Phone number is required');
  }

  // Format validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
    errors.push('Please provide a valid phone number');
  }

  // Length validation
  if (name && name.length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }

  if (email && email.length > 100) {
    errors.push('Email cannot exceed 100 characters');
  }

  if (phone && phone.length > 15) {
    errors.push('Phone number cannot exceed 15 characters');
  }

  if (password !== undefined) {
    if (typeof password !== 'string' || password.trim().length === 0) {
      errors.push('Password must be a non-empty string');
    }
    if (password && (password.length < 8 || password.length > 32)) {
      errors.push('Password must be between 8 and 32 characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

// Validation middleware for user update
const validateUserUpdate = (req, res, next) => {
  const allowedFields = ['name', 'email', 'phone', 'password', 'isVerified'];
  const updates = Object.keys(req.body);
  const errors = [];

  // Check for invalid fields
  const invalidFields = updates.filter(field => !allowedFields.includes(field));
  if (invalidFields.length > 0) {
    errors.push(`Invalid fields: ${invalidFields.join(', ')}`);
  }

  // Validate individual fields if they exist
  const { name, email, phone, password } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    }
    if (name && name.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || email.trim().length === 0) {
      errors.push('Email must be a non-empty string');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Please provide a valid email address');
    }
    if (email && email.length > 100) {
      errors.push('Email cannot exceed 100 characters');
    }
  }

  if (phone !== undefined) {
    if (typeof phone !== 'string' || phone.trim().length === 0) {
      errors.push('Phone must be a non-empty string');
    }
    if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
      errors.push('Please provide a valid phone number');
    }
    if (phone && phone.length > 15) {
      errors.push('Phone number cannot exceed 15 characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

// Middleware to validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    });
  }
  
  next();
};

module.exports = {
  validateUserCreation,
  validateUserUpdate,
  validateObjectId
};