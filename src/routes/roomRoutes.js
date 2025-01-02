const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roomController = require('../controllers/roomController');

// Room routes
router.get('/', auth, roomController.getAllRooms);
router.post('/', auth, roomController.createRoom);
router.get('/:roomId', auth, roomController.getRoom);
router.get('/:roomId/token', auth, roomController.getRoomToken);
router.post('/:roomId/join', auth, roomController.joinRoom);

module.exports = router; 
