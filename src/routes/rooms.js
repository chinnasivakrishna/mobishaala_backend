const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// Protected routes - all routes require authentication
router.use(authenticateToken);

// Get all rooms
router.get('/', async (req, res) => {
    try {
        res.json({ message: 'Get rooms endpoint' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create room
router.post('/', async (req, res) => {
    try {
        res.json({ message: 'Create room endpoint' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific room
router.get('/:roomId', async (req, res) => {
    try {
        res.json({ message: 'Get specific room endpoint' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 