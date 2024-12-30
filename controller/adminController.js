const Admin = require("../model/adminmodel"); // Import the Admin model
const Users = require("../model/usermodel"); // Import the User model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



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
            process.env.JWT_SECRET,
            { expiresIn: "1d" } // Token expires in 1 day
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
