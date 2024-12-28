const bcrypt = require('bcrypt');
const Users = require("../model/usermodel");
const fs = require("fs");
const path = require("path");

exports.userRegister = async (req, res) => {
    const { username, email, phone, password } = req.body;

    try {
        // Check if the user already exists by email or phone number
        const existingUser = await Users.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(406).json({ error: "User already exists with this email or phone" });
        }

        // Check if the proof file is uploaded
        if (!req.file) {
            return res.status(400).json({ error: "Proof file is required" });
        }

        // Hash password before saving (use bcrypt for hashing)
        const hashedPassword = await bcrypt.hash(password, 10);  // You may want to adjust the saltRounds for production

        // Extract file details from Multer's req.file
        const proof = {
            filename: req.file.filename,
            filepath: req.file.path,
            filetype: req.file.mimetype,
            uploadedAt: new Date(),
        };

        // Create a new user object with the hashed password
        const newUser = new Users({
            username,
            email,
            phone,
            password: hashedPassword, // Store hashed password
            proof,
        });

        // Save user to the database
        await newUser.save();

        res.status(200).json({
            message: "User registered successfully",
            user: {
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone
            }
        });
    } catch (error) {
        // If an error occurs, delete the uploaded file (clean up)
        if (req.file) {
            fs.unlink(path.join(__dirname, '..', req.file.path), (err) => {
                if (err) console.error("Failed to delete uploaded file:", err);
            });
        }

        // Handle specific errors and general server error
        console.error("Registration Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "Duplicate key error: email or phone number already registered." });
        }

        res.status(500).json({ error: "Something went wrong during registration. Please try again later." });
    }
};
