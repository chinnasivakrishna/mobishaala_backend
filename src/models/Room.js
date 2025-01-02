const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  duration: Number,
  size: Number,
  url: String
});

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    },
    isRecording: {
        type: Boolean,
        default: false
    },
    recordingStartedAt: Date,
    recordingStoppedAt: Date,
    recordings: [recordingSchema]
});

module.exports = mongoose.model('Room', roomSchema); 