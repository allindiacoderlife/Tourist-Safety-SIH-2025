const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const sosRoutes = require('./sosRoutes');
// Use routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sos', sosRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working properly',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;