const express = require('express');
require('dotenv').config();
const cors = require('cors');
const router = require('./router'); // Assuming your routes are in 'router.js' file
const path = require('path'); // For serving static files
const mongoose = require('mongoose');

// Establish database connection
require('./connection'); // Assumes you have a database connection file

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies


// Serve static files (like file uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve files from 'uploads/' folder

// Routes
app.use(router); // Integrate your routes here, assuming '/router' file contains the routes

// Server listening on a specified port
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server running successfully at port ${port}`);
});
