const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roomController = require('../controllers/roomController');

// All room routes require authentication
router.use(authenticateToken);

router.post('/', roomController.createRoom);
router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoom);
router.post('/:id/token', roomController.getToken);
router.post('/:id/recording/start', roomController.startRecording);
router.post('/:id/recording/stop', roomController.stopRecording);
router.post('/:id/recording/save', roomController.saveRecording);

module.exports = router; 