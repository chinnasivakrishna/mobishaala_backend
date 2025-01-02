const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/recordings');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Protect all routes with auth middleware
router.use(auth);

// Room routes
router.get('/', auth, roomController.getAllRooms);
router.post('/', auth, roomController.createRoom);
router.get('/:roomId', auth, roomController.getRoom);
router.get('/:roomId/token', auth, roomController.getRoomToken);
router.post('/:roomId/join', auth, roomController.joinRoom);

// Recording routes
router.post('/:roomId/recording/start', roomController.startRecording);
router.post('/:roomId/recording/stop', roomController.stopRecording);
router.post('/:roomId/recording/save', upload.single('recording'), roomController.saveRecording);

module.exports = router; 
