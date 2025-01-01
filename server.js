const { app, server } = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
