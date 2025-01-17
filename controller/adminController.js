const Admin = require("../model/adminmodel"); // Import the Admin model
const Users = require("../model/usermodel"); // Import the User model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const shelters = require("../model/sheltermodel");
const helprequestmodel = require("../model/helprequestmodel");



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
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find and delete the user by ID
        const user = await Users.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User successfully deleted', user });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




exports.reportShelter = async (req, res) => {
    try {
        // Admin-only check
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to create a shelter.' });
        }

        // Logging the request details
        console.log('Request Body:', req.body);
        console.log('Uploaded File:', req.file);

        // Destructure request body
        const { name, location, capacity, current_occupancy, amenities, contact, map } = req.body;
        const image = req.file ? req.file.path : null;

        // Validate fields
        if (!name || !location || !capacity || !current_occupancy || !amenities || !contact || !map || !image) {
            console.error('Validation Error: Missing required fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Attempt to save shelter
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
        console.error('Unexpected Error in reportShelter:', error.stack);
        res.status(500).json({
            message: 'Failed to create shelter',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined, // Show stack in dev mode only
        });
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
exports.deleteshelter = async (req, res) => {
    try {
        const { id } = req.params

        await shelters.findByIdAndDelete(id)
        res.status(200).json({
            message: 'deleted successfully'
        })

    } catch (err) {
        res.status(500).json({ message: 'failed to delete', err: err.message })

    }



}
    exports.gethelprequests = async (req, res) => {
        try {
            // Fetch help requests and populate the userId field to include username and other necessary fields
            const helprequests = await helprequestmodel.find().populate('userId', 'username email') // Populate userId to include name and email

            res.status(200).json({
                status: 'success',
                data: helprequests, // Include the populated data
            });
        } catch (error) {
            console.error('Error fetching help requests:', error); // Log the error for debugging
            res.status(500).json({
                status: 'failed',
                message: 'An error occurred while fetching help requests.',
                error: error.message, // Include error details for better debugging
            });
        }
    };
exports.updateHelpRequest = async (req, res) => {
    try {
        // Extract the ID and the updated fields from the request
        const { id } = req.params;
        const updateData = req.body; // Expects an object like { status: 'Approved' }

        // Update the help request and return the updated document
        const updatedHelpRequest = await helprequestmodel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true } // Ensure validators and return the updated document
        );

        if (!updatedHelpRequest) {
            return res.status(404).json({
                status: 'failed',
                message: 'Help request not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Help request updated successfully.',
            data: updatedHelpRequest,
        });
    } catch (error) {
        console.error('Error updating help request:', error); // Log the error for debugging
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred while updating the help request.',
            error: error.message, // Include error details for better debugging
        });
    }
};
exports.deleteHelpRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRequest = await helprequestmodel.findByIdAndDelete(id);
        if (!deletedRequest) {
            return res.status(404).json({
                status: 'failed',
                message: 'Help request not found.',
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Help request deleted successfully.',
        });
    } catch (error) {
        console.error('Error deleting help request:', error);
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred while deleting the help request.',
        });
    }
};






