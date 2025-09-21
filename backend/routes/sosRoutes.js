const express = require('express');
const router = express.Router();
const { sendSOS, getAllSOS, getSOS, updateSOSStatus } = require('../controller/sosController');
const { protect } = require('../middleware/auth');

// Send SOS alert (protected route)
router.post("/send", protect, sendSOS);

// Get all SOS messages with filtering and pagination (protected route)
router.get("/", protect, getAllSOS);

// Get single SOS message by ID (protected route)
router.get("/:id", protect, getSOS);

// Update SOS status (protected route)
router.put("/:id/status", protect, updateSOSStatus);

module.exports = router;