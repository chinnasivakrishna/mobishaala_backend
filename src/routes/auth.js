const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/check', authenticateToken, authController.checkAuth);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router; 