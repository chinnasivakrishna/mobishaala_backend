const Room = require('../models/Room');
const jwt = require('jsonwebtoken');

exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find()
            .populate('createdBy', 'email name')
            .sort({ createdAt: -1 });
        res.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

exports.createRoom = async (req, res) => {
    try {
        const { name, description, enableRecording, scheduledFor, duration } = req.body;
        
        const room = new Room({
            name,
            description,
            enableRecording,
            scheduledFor,
            duration,
            createdBy: req.user.userId,
            roomId: require('crypto').randomBytes(12).toString('hex')
        });

        await room.save();
        await room.populate('createdBy', 'email name');
        
        res.status(201).json(room);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
};

exports.getRoom = async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId })
            .populate('createdBy', 'email name');
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        res.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ error: 'Failed to fetch room' });
    }
};

exports.getRoomToken = async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId })
            .populate('createdBy', 'email name');
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Generate a room-specific token
        const roomToken = jwt.sign(
            {
                userId: req.user.userId,
                roomId: room.roomId,
                userEmail: req.user.email,
                userName: req.user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token: roomToken });
    } catch (error) {
        console.error('Error generating room token:', error);
        res.status(500).json({ error: 'Failed to generate room token' });
    }
};

exports.joinRoom = async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId })
            .populate('createdBy', 'email name');
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Generate a room-specific token
        const roomToken = jwt.sign(
            {
                userId: req.user.userId,
                roomId: room.roomId,
                userEmail: req.user.email,
                userName: req.user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            room,
            token: roomToken
        });
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({ error: 'Failed to join room' });
    }
};
