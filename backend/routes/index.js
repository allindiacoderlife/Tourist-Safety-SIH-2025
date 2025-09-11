const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const otpRoutes = require('./otpRoutes');
const authRoutes = require('./authRoutes');

// Use routes
router.use('/users', userRoutes);
router.use('/otp', otpRoutes);
router.use('/auth', authRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working properly',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
