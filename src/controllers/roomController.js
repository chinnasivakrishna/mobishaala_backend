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
        // Create HMS room first
        const managementToken = jwt.sign({
            access_key: process.env.HMS_ACCESS_KEY,
            type: 'management',
            version: 2,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
        }, process.env.HMS_APP_SECRET);

        const hmsResponse = await fetch('https://api.100ms.live/v2/rooms', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${managementToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: req.body.name,
                description: `Room created by ${req.user.name}`
            })
        });

        if (!hmsResponse.ok) {
            throw new Error('Failed to create HMS room');
        }

        const hmsData = await hmsResponse.json();

        // Create room in your database
        const room = new Room({
            name: req.body.name,
            hmsRoomId: hmsData.id,  // Store the HMS room ID
            createdBy: req.user._id
        });

        await room.save();
        res.status(201).json(room);

    } catch (error) {
        console.error('Create room error:', error);
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
        // Log incoming request
        console.log('Join room request:', {
            roomId: req.params.roomId,
            userId: req.user?._id
        });

        // Find the room
        const room = await Room.findOne({ _id: req.params.roomId })
            .populate('createdBy', 'email name');
        
        if (!room) {
            console.log('Room not found:', req.params.roomId);
            return res.status(404).json({ error: 'Room not found' });
        }

        // Verify HMS credentials exist
        if (!process.env.HMS_ACCESS_KEY || !process.env.HMS_APP_SECRET) {
            console.error('HMS credentials not configured');
            return res.status(500).json({ error: 'Video service configuration missing' });
        }

        try {
            // Generate HMS management token
            const managementToken = jwt.sign({
                access_key: process.env.HMS_ACCESS_KEY,
                type: 'management',
                version: 2,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
            }, process.env.HMS_APP_SECRET);

            // Get room token from HMS API
            const response = await fetch('https://api.100ms.live/v2/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${managementToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    room_id: room.hmsRoomId, // Make sure this matches the HMS room ID
                    user_id: req.user._id.toString(),
                    role: 'host',
                    type: 'app'
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('HMS API Error:', errorData);
                throw new Error(`HMS API error: ${response.status}`);
            }

            const data = await response.json();
            
            res.json({
                room: {
                    _id: room._id,
                    name: room.name,
                    createdBy: room.createdBy
                },
                token: data.token
            });

        } catch (hmsError) {
            console.error('HMS API Error:', hmsError);
            res.status(500).json({ 
                error: 'Failed to generate video token',
                details: hmsError.message 
            });
        }

    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ 
            error: 'Failed to join room',
            details: error.message 
        });
    }
};
