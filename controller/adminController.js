const Admin = require("../model/adminmodel"); // Import the Admin model
const Users = require("../model/usermodel"); // Import the User model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const shelters = require("../model/sheltermodel");



// Admin login handler
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body; // Extract email and password from request body

    try {
        // Find the admin by email
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        // Compare provided password with stored hash
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET
        );
        
        res.status(200).json({
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error("Error during admin login:", error);
        res.status(500).json({ error: "Something went wrong during login" });
    }
};

// Approve user profile
exports.approveUser = async (req, res) => {
    const { userId } = req.params; // Extract user ID from route parameters

    try {
        // Find the user by ID and update the `isApproved` field to true
        const updatedUser = await Users.findByIdAndUpdate(
            userId,
            { isApproved: true },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User profile approved successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error approving user:", error);
        res.status(500).json({ error: "Something went wrong while approving the user" });
    }
};

// Fetch users with pending approval
exports.getPendingUsers = async (req, res) => {
    try {
        // Find users with `isApproved` set to false
        const pendingUsers = await Users.find({ isApproved: false });
        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error("Error fetching pending users:", error);
        res.status(500).json({ error: "Could not fetch pending users" });
    }
};





exports.reportShelter = async (req, res) => {
    try {
        // Admin-only check
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to create a shelter.' });
        }

        // Logging the request body and uploaded file
        console.log('Body:', req.body);
        console.log('File:', req.file);

        // Destructuring form data
        const { name, location, capacity, current_occupancy, amenities, contact, map } = req.body;
        const image = req.file ? req.file.path : '';

        // Check if required fields are missing
        if (!name || !location || !capacity || !current_occupancy || !amenities || !contact || !map || !image) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create shelter instance
        const newShelter = new shelters({
            name,
            location,
            capacity,
            current_occupancy,
            amenities,
            contact,
            map,
            image,
            reportedBy: { adminId: req.user.id, role: req.user.role },
        });

        const savedShelter = await newShelter.save();

        res.status(200).json({
            message: 'Shelter created successfully',
            shelter: savedShelter,
        });
    } catch (error) {
        console.error('Error creating shelter:', error.message);
        res.status(500).json({ message: 'Failed to create shelter', error: error.message });
    }
};
exports.updateShelter = async (req, res) => {
    try {
        // Ensure only admins can update shelters
        

        // Extract shelter ID from the route params
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Shelter ID is required for updating.' });
        }

        // Prepare updated fields from request data
        const { name, location, capacity, current_occupancy, amenities, contact, map } = req.body;
        const image = req.file ? req.file.path : null;

        const updatedData = {
            ...(name && { name }),
            ...(location && { location }),
            ...(capacity && { capacity }),
            ...(current_occupancy && { current_occupancy }),
            ...(amenities && { amenities }),
            ...(contact && { contact }),
            ...(map && { map }),
            ...(image && { image }),
        };

        // Update the shelter and return the result
        const updatedShelter = await shelters.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        if (!updatedShelter) {
            return res.status(404).json({ message: 'Shelter not found.' });
        }

        res.status(200).json({
            message: 'Shelter updated successfully',
            shelter: updatedShelter,
        });
    } catch (error) {
        console.error('Error updating shelter:', error.message);
        res.status(500).json({ message: 'Failed to update shelter', error: error.message });
    }
};




