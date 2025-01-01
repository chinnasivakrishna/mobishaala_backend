const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const setupWebSocket = require('./services/websocket');
const cors = require('cors');
const cookieParser = require('cookie-parser');
dotenv.config();

const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'HMS_ACCESS_KEY', 'HMS_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} is not set in environment variables`);
        process.exit(1);
    }
}

const app = express();
const server = http.createServer(app);

// Setup WebSocket
setupWebSocket(server);

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = { app, server }; 