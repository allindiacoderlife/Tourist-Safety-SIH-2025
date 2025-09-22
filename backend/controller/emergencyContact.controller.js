const { EmergencyContact, RELATIONSHIP_TYPES } = require('../models/EmergencyContact');

// GET /api/emergency-contacts - Get all emergency contacts for authenticated user
const getEmergencyContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.findActiveContacts(req.user._id);
    
    res.status(200).json({
      success: true,
      data: contacts,
      message: contacts.length > 0 
        ? 'Emergency contacts retrieved successfully' 
        : 'No emergency contacts found'
    });
  } catch (error) {
    console.error('Error retrieving emergency contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve emergency contacts',
      error: error.message
    });
  }
};

// POST /api/emergency-contacts - Add new emergency contact
const addEmergencyContact = async (req, res) => {
  try {
    const { name, phone, email, relationship, isPrimary } = req.body;

    // Validate required fields
    if (!name || !phone || !relationship) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'phone', message: 'Phone number is required' },
          { field: 'relationship', message: 'Relationship is required' }
        ].filter(err => !req.body[err.field])
      });
    }

    // Validate relationship type
    if (!RELATIONSHIP_TYPES.includes(relationship)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { 
            field: 'relationship', 
            message: `Relationship must be one of: ${RELATIONSHIP_TYPES.join(', ')}` 
          }
        ]
      });
    }

    // Check if user already has maximum contacts (optional limit)
    const existingCount = await EmergencyContact.countDocuments({
      userId: req.user._id,
      isActive: true
    });

    if (existingCount >= 10) { // Limit to 10 contacts per user
      return res.status(400).json({
        success: false,
        message: 'Maximum number of emergency contacts (10) reached'
      });
    }

    // Create new contact
    const contactData = {
      userId: req.user._id,
      name: name.trim(),
      phone: phone.trim(),
      relationship,
      isPrimary: isPrimary || false
    };

    if (email) {
      contactData.email = email.trim().toLowerCase();
    }

    const contact = new EmergencyContact(contactData);
    await contact.save();

    res.status(201).json({
      success: true,
      data: contact,
      message: 'Emergency contact added successfully'
    });
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add emergency contact',
      error: error.message
    });
  }
};

// PUT /api/emergency-contacts/:id - Update existing emergency contact
const updateEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, relationship, isPrimary } = req.body;

    // Find contact and verify ownership
    const contact = await EmergencyContact.findOne({
      _id: id,
      userId: req.user._id,
      isActive: true
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    // Validate relationship type if provided
    if (relationship && !RELATIONSHIP_TYPES.includes(relationship)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { 
            field: 'relationship', 
            message: `Relationship must be one of: ${RELATIONSHIP_TYPES.join(', ')}` 
          }
        ]
      });
    }

    // Update fields
    if (name !== undefined) contact.name = name.trim();
    if (phone !== undefined) contact.phone = phone.trim();
    if (email !== undefined) {
      contact.email = email ? email.trim().toLowerCase() : undefined;
    }
    if (relationship !== undefined) contact.relationship = relationship;
    if (isPrimary !== undefined) contact.isPrimary = isPrimary;

    await contact.save();

    res.status(200).json({
      success: true,
      data: contact,
      message: 'Emergency contact updated successfully'
    });
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update emergency contact',
      error: error.message
    });
  }
};

// DELETE /api/emergency-contacts/:id - Delete emergency contact (soft delete)
const deleteEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;

    // Find contact and verify ownership
    const contact = await EmergencyContact.findOne({
      _id: id,
      userId: req.user._id,
      isActive: true
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    // Perform soft delete
    await contact.softDelete();

    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete emergency contact',
      error: error.message
    });
  }
};

// PUT /api/emergency-contacts/:id/primary - Set specific contact as primary
const setPrimaryContact = async (req, res) => {
  try {
    const { id } = req.params;

    // Find contact and verify ownership
    const contact = await EmergencyContact.findOne({
      _id: id,
      userId: req.user._id,
      isActive: true
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    // Set as primary
    await contact.setPrimary();

    res.status(200).json({
      success: true,
      data: contact,
      message: 'Primary contact updated successfully'
    });
  } catch (error) {
    console.error('Error setting primary contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update primary contact',
      error: error.message
    });
  }
};

// GET /api/emergency-contacts/primary - Get primary emergency contact
const getPrimaryContact = async (req, res) => {
  try {
    const primaryContact = await EmergencyContact.findPrimaryContact(req.user._id);
    
    if (!primaryContact) {
      return res.status(404).json({
        success: false,
        message: 'No primary emergency contact found'
      });
    }

    res.status(200).json({
      success: true,
      data: primaryContact,
      message: 'Primary contact retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving primary contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve primary contact',
      error: error.message
    });
  }
};

// GET /api/emergency-contacts/relationship-types - Get available relationship types
const getRelationshipTypes = (req, res) => {
  res.status(200).json({
    success: true,
    data: RELATIONSHIP_TYPES,
    message: 'Relationship types retrieved successfully'
  });
};

module.exports = {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  setPrimaryContact,
  getPrimaryContact,
  getRelationshipTypes
};