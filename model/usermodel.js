const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Enforce unique emails
    },
    phone: {
        type: Number,
        required: true,
        unique: true // Enforce unique phone numbers
    },
    password: {
        type: String,
        required: true
    },
    proof: {
        filename: { type: String, required: true }, // Stores the file name
        filepath: { type: String, required: true }, // Stores the file's path
        filetype: { type: String }, // Stores the file's MIME type (e.g., image/png, application/pdf)
        uploadedAt: { type: Date, default: Date.now } // Timestamp for when the file was uploaded
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'volunteer'],  // Added 'volunteer' role
    },
});

// Create a model
const Users = mongoose.model('Users', userSchema);

module.exports = Users;
