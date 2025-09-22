const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  validateObjectId,
  validateEmergencyContactCreation,
  validateEmergencyContactUpdate,
  emergencyContactRateLimit
} = require('../middleware/emergencyContactValidation');
const {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  setPrimaryContact,
  getPrimaryContact,
  getRelationshipTypes
} = require('../controller/emergencyContact.controller');

// Middleware to protect all routes and apply rate limiting
router.use(protect);
router.use(emergencyContactRateLimit);

// GET /api/emergency-contacts/relationship-types - Get available relationship types
router.get('/relationship-types', getRelationshipTypes);

// GET /api/emergency-contacts/primary - Get primary emergency contact
router.get('/primary', getPrimaryContact);

// GET /api/emergency-contacts - Get all emergency contacts for authenticated user
router.get('/', getEmergencyContacts);

// POST /api/emergency-contacts - Add new emergency contact
router.post('/', validateEmergencyContactCreation, addEmergencyContact);

// PUT /api/emergency-contacts/:id - Update existing emergency contact
router.put('/:id', validateObjectId, validateEmergencyContactUpdate, updateEmergencyContact);

// DELETE /api/emergency-contacts/:id - Delete emergency contact (soft delete)
router.delete('/:id', validateObjectId, deleteEmergencyContact);

// PUT /api/emergency-contacts/:id/primary - Set specific contact as primary
router.put('/:id/primary', validateObjectId, setPrimaryContact);

module.exports = router;