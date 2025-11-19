require('dotenv').config(); // MUST be the first line
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const dbTOconnect = require('./Database/db');
dbTOconnect();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./Auth/auth'));

// Test routes
app.get('/', (req, res) => {
    res.json({ message: 'CraftMyFolio Backend API is running!' });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!', timestamp: new Date() });
});

// Test database connection
app.get('/api/db-test', async (req, res) => {
    try {
        const User = require('./models/User');
        const userCount = await User.countDocuments();
        res.json({ 
            message: 'Database connected!', 
            userCount: userCount,
            dbState: mongoose.connection.readyState 
        });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});