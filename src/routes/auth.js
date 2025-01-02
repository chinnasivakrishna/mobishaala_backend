const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes are working' });
});

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/check', authenticateToken, authController.checkAuth);

module.exports = router; 