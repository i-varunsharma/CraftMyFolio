


require('dotenv').config(); // MUST be the first line
const express = require('express');
const mongoose = require('mongoose');
const mongoURI = process.env.MONGODB_URI; // Reads your MongoDB URI



const dbTOconnect = async () => {
    mongoose.connect(mongoURI)
    .then(() => {
        console.log('✅ MongoDB connected successfully!');
    })
        
    .catch((err) => {
        console.error('❌ DB Connection Error:', err.message);
        // Exit the process if the DB fails to connect
        process.exit(1);
    })
};

module.exports = dbTOconnect;