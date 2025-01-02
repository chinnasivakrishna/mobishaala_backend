const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['http://localhost:3000'] // Add your frontend URL when deployed
        : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Test route to verify API is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Routes with /api prefix
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Add OPTIONS handling for preflight requests
app.options('*', cors());

module.exports = { app, server }; 