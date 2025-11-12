const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const clientRoutes = require('./clients');

// Use routes
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);

module.exports = router;
