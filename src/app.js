const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true // Important for cookies
}));

// Routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 