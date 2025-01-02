const User = require('../models/User');
const JWT = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const user = new User({ email, password, name });
        await user.save();

        const token = JWT.sign(
            { 
                userId: user._id,
                email: user.email,
                name: user.name
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.status(201).json({ 
            user: { 
                id: user._id, 
                email: user.email, 
                name: user.name 
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = JWT.sign(
            { 
                userId: user._id,
                email: user.email,
                name: user.name
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.json({ 
            user: { 
                id: user._id, 
                email: user.email, 
                name: user.name 
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const token = JWT.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ 
            token,
            expiresIn: '7 days'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 