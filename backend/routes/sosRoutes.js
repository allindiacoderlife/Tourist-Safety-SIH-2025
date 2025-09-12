const express = require('express');
const router = express.Router();

const {
  triggerSOS,
  getActiveAlerts,
  getAllAlerts,
  getAlert,
  updateAlert,
  getUserSOSHistory,
  getNearbyAlerts,
  deleteAlert
} = require('../controllers/sosController');

const {
  validateSOSTrigger,
  validateAlertId,
  validateUserId,
  validateAlertUpdate,
  validateNearbyQuery,
  validatePagination
} = require('../middleware/sosValidation');

// SOS Routes

/**
 * @route   POST /api/sos/trigger
 * @desc    Trigger a new SOS alert
 * @access  Public (mobile app)
 * @body    { userId, location: { latitude, longitude, address? }, description?, emergencyContacts? }
 */
router.post('/trigger', validateSOSTrigger, triggerSOS);

/**
 * @route   GET /api/sos/active
 * @desc    Get all active SOS alerts (for dashboard)
 * @access  Public (dashboard)
 * @query   page, limit, priority, userId
 */
router.get('/active', validatePagination, getActiveAlerts);

/**
 * @route   GET /api/sos/alerts
 * @desc    Get all SOS alerts with optional filters
 * @access  Public (dashboard)
 * @query   page, limit, status, priority, userId
 */
router.get('/alerts', validatePagination, getAllAlerts);

/**
 * @route   GET /api/sos/nearby
 * @desc    Get nearby active SOS alerts
 * @access  Public
 * @query   latitude, longitude, radius (in km, default: 10)
 */
router.get('/nearby', validateNearbyQuery, getNearbyAlerts);

/**
 * @route   GET /api/sos/alert/:alertId
 * @desc    Get single SOS alert by ID
 * @access  Public
 */
router.get('/alert/:alertId', validateAlertId, getAlert);

/**
 * @route   PUT /api/sos/alert/:alertId
 * @desc    Update SOS alert status (resolve/cancel)
 * @access  Public (dashboard)
 * @body    { status?, resolvedBy?, resolutionNotes?, priority? }
 */
router.put('/alert/:alertId', validateAlertId, validateAlertUpdate, updateAlert);

/**
 * @route   GET /api/sos/user/:userId/history
 * @desc    Get user's SOS alert history
 * @access  Public
 * @query   page, limit, status
 */
router.get('/user/:userId/history', validateUserId, validatePagination, getUserSOSHistory);

/**
 * @route   DELETE /api/sos/alert/:alertId
 * @desc    Delete SOS alert (admin only)
 * @access  Private (admin)
 */
router.delete('/alert/:alertId', validateAlertId, deleteAlert);

module.exports = router;
