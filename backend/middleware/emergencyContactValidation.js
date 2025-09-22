const mongoose = require('mongoose');
const { RELATIONSHIP_TYPES } = require('../models/EmergencyContact');

// Validate ObjectId format
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid contact ID format'
    });
  }
  
  next();
};

// Validate emergency contact creation data
const validateEmergencyContactCreation = (req, res, next) => {
  const { name, phone, email, relationship, isPrimary } = req.body;
  const errors = [];

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Name is required and must be at least 2 characters'
    });
  } else if (name.trim().length > 100) {
    errors.push({
      field: 'name',
      message: 'Name cannot exceed 100 characters'
    });
  }

  // Validate phone
  if (!phone || typeof phone !== 'string') {
    errors.push({
      field: 'phone',
      message: 'Phone number is required'
    });
  } else {
    // Phone number validation (international format)
    const phoneRegex = /^\+\d{1,3}\s?\d{4,14}$/;
    if (!phoneRegex.test(phone.trim())) {
      errors.push({
        field: 'phone',
        message: 'Invalid phone number format. Use international format: +91 98765 43210'
      });
    }
  }

  // Validate email if provided
  if (email && typeof email === 'string' && email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push({
        field: 'email',
        message: 'Invalid email format'
      });
    }
  }

  // Validate relationship
  if (!relationship || typeof relationship !== 'string') {
    errors.push({
      field: 'relationship',
      message: 'Relationship is required'
    });
  } else if (!RELATIONSHIP_TYPES.includes(relationship)) {
    errors.push({
      field: 'relationship',
      message: `Relationship must be one of: ${RELATIONSHIP_TYPES.join(', ')}`
    });
  }

  // Validate isPrimary
  if (isPrimary !== undefined && typeof isPrimary !== 'boolean') {
    errors.push({
      field: 'isPrimary',
      message: 'isPrimary must be a boolean value'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate emergency contact update data
const validateEmergencyContactUpdate = (req, res, next) => {
  const { name, phone, email, relationship, isPrimary } = req.body;
  const errors = [];

  // Validate name if provided
  if (name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'Name must be at least 2 characters'
      });
    } else if (name.trim().length > 100) {
      errors.push({
        field: 'name',
        message: 'Name cannot exceed 100 characters'
      });
    }
  }

  // Validate phone if provided
  if (phone !== undefined) {
    if (!phone || typeof phone !== 'string') {
      errors.push({
        field: 'phone',
        message: 'Phone number cannot be empty'
      });
    } else {
      const phoneRegex = /^\+\d{1,3}\s?\d{4,14}$/;
      if (!phoneRegex.test(phone.trim())) {
        errors.push({
          field: 'phone',
          message: 'Invalid phone number format. Use international format: +91 98765 43210'
        });
      }
    }
  }

  // Validate email if provided
  if (email !== undefined && email !== null && email !== '') {
    if (typeof email === 'string' && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push({
          field: 'email',
          message: 'Invalid email format'
        });
      }
    }
  }

  // Validate relationship if provided
  if (relationship !== undefined) {
    if (!relationship || typeof relationship !== 'string') {
      errors.push({
        field: 'relationship',
        message: 'Relationship cannot be empty'
      });
    } else if (!RELATIONSHIP_TYPES.includes(relationship)) {
      errors.push({
        field: 'relationship',
        message: `Relationship must be one of: ${RELATIONSHIP_TYPES.join(', ')}`
      });
    }
  }

  // Validate isPrimary if provided
  if (isPrimary !== undefined && typeof isPrimary !== 'boolean') {
    errors.push({
      field: 'isPrimary',
      message: 'isPrimary must be a boolean value'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Rate limiting middleware for emergency contacts
const emergencyContactRateLimit = (req, res, next) => {
  // This is a simple in-memory rate limiter
  // In production, use Redis or a proper rate limiting library
  
  const userId = req.user._id.toString();
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 100; // 100 requests per hour
  
  if (!global.rateLimitStore) {
    global.rateLimitStore = {};
  }
  
  if (!global.rateLimitStore[userId]) {
    global.rateLimitStore[userId] = {
      requests: 1,
      resetTime: now + windowMs
    };
  } else {
    const userLimit = global.rateLimitStore[userId];
    
    if (now > userLimit.resetTime) {
      // Reset the counter
      userLimit.requests = 1;
      userLimit.resetTime = now + windowMs;
    } else {
      userLimit.requests++;
      
      if (userLimit.requests > maxRequests) {
        const resetTimeMinutes = Math.ceil((userLimit.resetTime - now) / (60 * 1000));
        return res.status(429).json({
          success: false,
          message: `Rate limit exceeded. Try again in ${resetTimeMinutes} minutes.`,
          resetTime: new Date(userLimit.resetTime).toISOString()
        });
      }
    }
  }
  
  next();
};

module.exports = {
  validateObjectId,
  validateEmergencyContactCreation,
  validateEmergencyContactUpdate,
  emergencyContactRateLimit
};