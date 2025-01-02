const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes - make sure this matches exactly with frontend URL
router.get('/check', authenticateToken, authController.checkAuth);

// Add a test route to verify API is working
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route is working' });
});

module.exports = router; 