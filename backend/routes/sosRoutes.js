const express = require('express');
const router = express.Router();
const { sendSOS, getAllSOS, getSOS, updateSOSStatus } = require('../controllers/sosController');

// Send SOS alert
router.post("/send", sendSOS);

// Get all SOS messages with filtering and pagination
router.get("/", getAllSOS);

// Get single SOS message by ID
router.get("/:id", getSOS);

// Update SOS status
router.put("/:id/status", updateSOSStatus);

module.exports = router;