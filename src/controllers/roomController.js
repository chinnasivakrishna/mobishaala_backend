const Room = require('../models/Room');

const roomController = {
    createRoom: async (req, res) => {
        try {
            const { name, description } = req.body;
            const room = new Room({
                name,
                description,
                createdBy: req.user.userId
            });

            await room.save();
            res.status(201).json(room);
        } catch (error) {
            console.error('Create room error:', error);
            res.status(500).json({ message: 'Error creating room' });
        }
    },

    getRooms: async (req, res) => {
        try {
            const rooms = await Room.find()
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 });
            res.json(rooms);
        } catch (error) {
            console.error('Get rooms error:', error);
            res.status(500).json({ message: 'Error fetching rooms' });
        }
    },

    getRoom: async (req, res) => {
        try {
            const room = await Room.findById(req.params.id)
                .populate('createdBy', 'name email');
            
            if (!room) {
                return res.status(404).json({ message: 'Room not found' });
            }

            res.json(room);
        } catch (error) {
            console.error('Get room error:', error);
            res.status(500).json({ message: 'Error fetching room' });
        }
    },

    getToken: async (req, res) => {
        try {
            const room = await Room.findById(req.params.id);
            if (!room) {
                return res.status(404).json({ message: 'Room not found' });
            }

            // Generate a token for the room (implement your token generation logic here)
            const token = 'your-token-generation-logic';

            res.json({ token });
        } catch (error) {
            console.error('Get token error:', error);
            res.status(500).json({ message: 'Error generating token' });
        }
    }
};

module.exports = roomController; 