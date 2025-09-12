const mongoose = require('mongoose');

// Validate SOS trigger request
const validateSOSTrigger = (req, res, next) => {
  const { userId, location } = req.body;
  const errors = [];

  // Validate userId
  if (!userId) {
    errors.push('userId is required');
  } else if (!mongoose.Types.ObjectId.isValid(userId)) {
    errors.push('userId must be a valid MongoDB ObjectId');
  }

  // Validate location
  if (!location) {
    errors.push('location is required');
  } else {
    if (typeof location !== 'object') {
      errors.push('location must be an object');
    } else {
      if (!location.latitude) {
        errors.push('location.latitude is required');
      } else if (typeof location.latitude !== 'number' || location.latitude < -90 || location.latitude > 90) {
        errors.push('location.latitude must be a number between -90 and 90');
      }

      if (!location.longitude) {
        errors.push('location.longitude is required');
      } else if (typeof location.longitude !== 'number' || location.longitude < -180 || location.longitude > 180) {
        errors.push('location.longitude must be a number between -180 and 180');
      }

      if (location.address && typeof location.address !== 'string') {
        errors.push('location.address must be a string');
      }
    }
  }

  // Validate description (optional)
  if (req.body.description && typeof req.body.description !== 'string') {
    errors.push('description must be a string');
  }

  // Validate emergencyContacts (optional)
  if (req.body.emergencyContacts) {
    if (!Array.isArray(req.body.emergencyContacts)) {
      errors.push('emergencyContacts must be an array');
    } else {
      req.body.emergencyContacts.forEach((contact, index) => {
        if (typeof contact !== 'object') {
          errors.push(`emergencyContacts[${index}] must be an object`);
        } else {
          if (contact.name && typeof contact.name !== 'string') {
            errors.push(`emergencyContacts[${index}].name must be a string`);
          }
          if (contact.phone && typeof contact.phone !== 'string') {
            errors.push(`emergencyContacts[${index}].phone must be a string`);
          }
          if (contact.email && typeof contact.email !== 'string') {
            errors.push(`emergencyContacts[${index}].email must be a string`);
          }
          if (contact.relation && typeof contact.relation !== 'string') {
            errors.push(`emergencyContacts[${index}].relation must be a string`);
          }
          
          // Validate email format if provided
          if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
            errors.push(`emergencyContacts[${index}].email must be a valid email address`);
          }
        }
      });
    }
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

// Validate alert ID parameter
const validateAlertId = (req, res, next) => {
  const { alertId } = req.params;

  if (!alertId) {
    return res.status(400).json({
      success: false,
      message: 'Alert ID is required'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(alertId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid alert ID format'
    });
  }

  next();
};

// Validate user ID parameter
const validateUserId = (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    });
  }

  next();
};

// Validate update alert request
const validateAlertUpdate = (req, res, next) => {
  const { status, priority, resolvedBy } = req.body;
  const errors = [];

  // Validate status (optional)
  if (status && !['active', 'resolved', 'cancelled'].includes(status)) {
    errors.push('status must be one of: active, resolved, cancelled');
  }

  // Validate priority (optional)
  if (priority && !['low', 'medium', 'high', 'critical'].includes(priority)) {
    errors.push('priority must be one of: low, medium, high, critical');
  }

  // Validate resolvedBy (optional)
  if (resolvedBy && !mongoose.Types.ObjectId.isValid(resolvedBy)) {
    errors.push('resolvedBy must be a valid MongoDB ObjectId');
  }

  // Validate resolutionNotes (optional)
  if (req.body.resolutionNotes && typeof req.body.resolutionNotes !== 'string') {
    errors.push('resolutionNotes must be a string');
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

// Validate nearby alerts query parameters
const validateNearbyQuery = (req, res, next) => {
  const { latitude, longitude, radius } = req.query;
  const errors = [];

  // Validate latitude
  if (!latitude) {
    errors.push('latitude is required');
  } else {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('latitude must be a valid number between -90 and 90');
    }
  }

  // Validate longitude
  if (!longitude) {
    errors.push('longitude is required');
  } else {
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('longitude must be a valid number between -180 and 180');
    }
  }

  // Validate radius (optional)
  if (radius) {
    const radiusNum = parseFloat(radius);
    if (isNaN(radiusNum) || radiusNum <= 0 || radiusNum > 1000) {
      errors.push('radius must be a positive number not exceeding 1000 km');
    }
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

// Validate pagination parameters
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  const errors = [];

  // Validate page (optional)
  if (page) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('page must be a positive integer');
    } else if (pageNum > 1000) {
      errors.push('page cannot exceed 1000');
    }
  }

  // Validate limit (optional)
  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1) {
      errors.push('limit must be a positive integer');
    } else if (limitNum > 100) {
      errors.push('limit cannot exceed 100');
    }
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

module.exports = {
  validateSOSTrigger,
  validateAlertId,
  validateUserId,
  validateAlertUpdate,
  validateNearbyQuery,
  validatePagination
};
