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

// Create router for /api routes
const apiRouter = express.Router();

// Test route
apiRouter.get('/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Mount auth and rooms routes on the API router
apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/rooms', require('./routes/rooms'));

// Mount the API router at /api
app.use('/api', apiRouter);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

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