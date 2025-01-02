const Room = require('../models/Room');
const jwt = require('jsonwebtoken');
const axios = require('axios');


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

        // Generate HMS token
        const response = await axios.post(
            process.env.HMS_TOKEN_ENDPOINT,
            {
                room_id: room.roomId,
                user_id: req.user.userId,
                role: 'host', // or determine based on user role
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HMS_ACCESS_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        res.json({ token: response.data.token });
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

        // Generate a management token for HMS API
        const managementToken = jwt.sign(
            {
                access_key: process.env.HMS_ACCESS_KEY,
                type: 'management',
                version: 2,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
            },
            process.env.HMS_SECRET
        );

        // Get room token from HMS API
        const response = await fetch('https://api.100ms.live/v2/token', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${managementToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                room_id: room.roomId,
                user_id: req.user.userId,
                role: 'host'
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('HMS API Error:', error);
            throw new Error('Failed to generate HMS token');
        }

        const { token } = await response.json();

        res.json({
            room,
            token
        });
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({ error: 'Failed to join room' });
    }
};
