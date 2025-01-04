const bcrypt = require('bcrypt');

const fs = require("fs");
const path = require("path");
const jwt = require('jsonwebtoken');
const Users = require('../model/usermodel');
const Disaster = require('../model/disastermodel');
const helprequestmodel = require('../model/helprequestmodel');

exports.userRegister = async (req, res) => {
    const { username, email, phone, password, role } = req.body;

    try {
        // Validate the role to ensure it's either 'user' or 'volunteer'
        if (!['user', 'volunteer'].includes(role)) {
            return res.status(400).json({ error: "Invalid role. Role must be 'user' or 'volunteer'." });
        }

        // Check if the user or volunteer already exists by email or phone
        const existingUser = await Users.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(406).json({ error: "User already exists with this email or phone" });
        }

        // Check if the proof file is uploaded (required for volunteers only)
        if (role === 'volunteer' && !req.file) {
            return res.status(400).json({ error: "Proof file is required for volunteer registration" });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);  // Salt rounds = 10

        // Extract file details for proof (for volunteers)
        let proof = null;
        if (req.file) {
            proof = {
                filename: req.file.filename,
                filepath: req.file.path,
                filetype: req.file.mimetype,
                uploadedAt: new Date(),
            };
        }

        // Create a new user/volunteer object
        const newUser = new Users({
            username,
            email,
            phone,
            password: hashedPassword,
            role,
            proof, // Only added if proof is uploaded
        });

        // Save the new user to the database
        await newUser.save();

        // Send success response
        res.status(200).json({
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`, // e.g., Volunteer/User registered successfully
            user: {
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
            }
        });
    } catch (error) {
        // Clean up the uploaded file in case of an error
        if (req.file) {
            fs.unlink(path.join(__dirname, '..', req.file.path), (err) => {
                if (err) console.error("Failed to delete uploaded file:", err);
            });
        }

        // Handle specific errors and general server errors
        console.error("Registration Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "Duplicate key error: email or phone number already registered." });
        }

        res.status(500).json({ error: "Something went wrong during registration. Please try again later." });
    }
};


// user login


exports.userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user/volunteer exists by email
        const user = await Users.findOne({ email });

        // If user/volunteer doesn't exist, return error
        if (!user) {
            return res.status(404).json({ error: "User/Volunteer not found" });
        }

        // Compare provided password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check if the user/volunteer is approved
        if (!user.isApproved) {
            return res.status(403).json({ error: "Your account is not approved yet. Please contact the admin." });
        }

        // Generate JWT token if login is successful
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role }, // Include the role in the token
            process.env.JWT_SECRET,

        );

        // Send success response with the token and user details
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role, // Include role in the response
            }
        });
    } catch (error) {
        // Handle server errors
        console.error("Login Error:", error);
        res.status(500).json({ error: "Something went wrong during login. Please try again later." });
    }
};


// Function to report a disaster
// userController.js
exports.reportDisaster = async (req, res) => {
    try {
        const { name, date, description, location, affectedarea, impact, contacts } = req.body;
        const image = req.file ? req.file.path : '';

        // Validate required fields
        if (!name || !date || !description || !location || !affectedarea || !impact || !contacts || !image) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        console.log('Decoded user data:', req.user);

        // Extract user details from req.user
        const { userId, role,id  } = req.user; // Use `id` as `userId` to match schema field `userId`

        // Prepare reportedBy based on user role
        const reportedBy =
            role === 'admin'
                ? { adminId:id, role } // Admin reporting
                : { userId, role }; // User reporting

        const newDisaster = new Disaster({
            name,
            date,
            description,
            location,
            affectedarea,
            impact,
            contacts,
            image,
            reportedBy,
        });

        const savedDisaster = await newDisaster.save();

        res.status(200).json({
            message: 'Disaster reported successfully',
            disaster: savedDisaster,
        });
    } catch (error) {
        console.error('Error reporting disaster:', error.message);
        res.status(500).json({ message: 'Failed to report disaster', error: error.message });
    }
};


exports.getUserDisasters = async (req, res) => {
    try {
        // Extract userId from req.user (populated via JWT middleware)
        const { userId } = req.user;

        // Fetch disasters reported by this user
        const disasters = await Disaster.find({ 'reportedBy.userId': userId });

        // Check if any disasters exist
        if (disasters.length === 0) {
            return res.status(404).json({ message: 'No disasters found for this user' });
        }

        res.status(200).json({
            message: 'Disasters fetched successfully',
            disasters,
        });
    } catch (error) {
        console.error('Error fetching user disasters:', error.message);
        res.status(500).json({
            message: 'Failed to fetch disasters',
            error: error.message,
        });
    }
};

// controllers/disasterController.js

exports.editDisaster = async (req, res) => {
    try {
        const { disasterId } = req.params; // Disaster ID from the request params
        const { name, date, description, location, affectedarea, impact, contacts } = req.body; // Extract new data from body
        const image = req.file ? req.file.path : ''; // Check if there's a new image

        // Validate required fields
        if (!name || !date || !description || !location || !affectedarea || !impact || !contacts) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Find the disaster by ID
        const disaster = await Disaster.findById(disasterId);
        if (!disaster) {
            return res.status(404).json({ message: 'Disaster not found' });
        }

        // Update the disaster fields with new data
        disaster.name = name || disaster.name;
        disaster.date = date || disaster.date;
        disaster.description = description || disaster.description;
        disaster.location = location || disaster.location;
        disaster.affectedarea = affectedarea || disaster.affectedarea;
        disaster.impact = impact || disaster.impact;
        disaster.contacts = contacts || disaster.contacts;
        disaster.image = image || disaster.image; // Update image only if new one is provided

        // Save the updated disaster
        const updatedDisaster = await disaster.save();

        res.status(200).json({
            message: 'Disaster updated successfully',
            disaster: updatedDisaster,
        });
    } catch (error) {
        console.error('Error updating disaster:', error.message);
        res.status(500).json({ message: 'Failed to update disaster', error: error.message });
    }
};
exports.deleteDisasterById = async (req, res) => {
    const { id } = req.params;

    try {
        // Find and delete the disaster
        const deletedDisaster = await Disaster.findByIdAndDelete(id);

        // If disaster not found
        if (!deletedDisaster) {
            return res.status(404).json({ message: 'Disaster not found.' });
        }

        // Send success response
        res.status(200).json({ message: 'Disaster report deleted successfully.' });
    } catch (error) {
        // Handle server errors
        res.status(500).json({ message: 'An error occurred while deleting the disaster report.', error });
    }
};


// Create a help request
exports.createHelpRequest = async (req, res) => {
    try {
        const { requestType, description, location, contact } = req.body;
        const userId = req.user.userId; // Assuming userId is fetched from authenticated user
        
        const helpRequest = new helprequestmodel({
            userId,
            requestType,
            description,
            location,
            contact,
        });

        await helpRequest.save();
        res.status(201).json({ message: "Help request created successfully.", helpRequest });
    } catch (error) {
        res.status(500).json({ message: "Failed to create help request.", error: error.message });
    }
};

// Get all help requests for a user
exports.getUsersHelpRequests = async (req, res) => {
    try {
        const userId = req.user.userId;
        const helpRequests = await helprequestmodel.find({ userId });

        res.status(200).json({ helpRequests });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve help requests.", error: error.message });
    }
};

 exports.updateHelpRequest = async (req, res) => {
    const { id } = req.params;  // Get the request id from the URL
    const { requestType, description, location, contact } = req.body;  // Get fields to update from request body

    try {
        // Find the help request by ID
        const helpRequest = await helprequestmodel.findById(id);

        if (!helpRequest) {
            return res.status(404).json({ message: 'Help request not found' });
        }

        // Update the fields with data from request body
        helpRequest.requestType = requestType || helpRequest.requestType;
        helpRequest.description = description || helpRequest.description;
        helpRequest.location = location || helpRequest.location;
        helpRequest.contact = contact || helpRequest.contact;

        // Optionally, add a status update if you want to track state changes (e.g., "Pending" to "Approved")
        helpRequest.dateResolved = new Date();  // You can set this only if the request has been resolved.

        // Save the updated help request
        await helpRequest.save();

        // Return the updated help request in the response
        return res.status(200).json({ message: 'Help request updated successfully', helpRequest });
    } catch (error) {
        console.error('Error updating help request:', error);
        return res.status(500).json({ message: 'Server error, failed to update help request' });
    }
};

// Delete a specific help request


exports.deleteHelpRequestById = async (req, res) => {
    const { id } = req.params;

    try {
        // Find and delete the help request
        const deletedHelpRequest = await helprequestmodel.findByIdAndDelete(id);

        // If the help request is not found
        if (!deletedHelpRequest) {
            return res.status(404).json({ message: 'Help request not found.' });
        }

        // Send success response
        res.status(200).json({ message: 'Help request deleted successfully.' });
    } catch (error) {
        // Handle server errors
        res.status(500).json({ message: 'An error occurred while deleting the help request.', error });
    }
};






