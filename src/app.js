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
        ? ['http://localhost:3000']
        : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Test route to verify API is working
app.get('/', (req, res) => {
    res.json({ message: 'API is working' });
});

// Mount routes WITHOUT /api prefix
app.use('/auth', require('./routes/auth'));
app.use('/rooms', require('./routes/rooms'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404
app.use((req, res) => {
    console.log('404 for URL:', req.url);
    res.status(404).json({ message: `Route ${req.url} not found` });
});

module.exports = { app, server }; 