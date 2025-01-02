const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authController = {
    register: async (req, res) => {
        try {
            const { email, password, name } = req.body;

            // Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Create new user
            user = new User({
                email,
                password,
                name
            });

            await user.save();

            // Generate token
            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.status(201).json({
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Check user exists
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Validate password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.json({
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    logout: async (req, res) => {
        try {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
            });
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    checkAuth: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ user });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = authController; 