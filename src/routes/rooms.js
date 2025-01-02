const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roomController = require('../controllers/roomController');

// Make sure authenticateToken is a middleware function
if (typeof authenticateToken !== 'function') {
    throw new Error('authenticateToken must be a middleware function');
}

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Define routes
router.post('/', roomController.createRoom);
router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoom);
router.post('/:id/token', roomController.getToken);

module.exports = router; 