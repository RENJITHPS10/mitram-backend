const bcrypt = require('bcrypt');

const fs = require("fs");
const path = require("path");
const jwt = require('jsonwebtoken');
const Users = require('../model/usermodel');

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
            { expiresIn: '1h' } // Set token expiration time
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


