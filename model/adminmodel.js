const mongoose = require('mongoose');

// Admin schema for admin users
const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'  // Admin will always have this role
    },
  
});

// Model creation for admins
const Admin = mongoose.model('admin', adminSchema);

module.exports = Admin;
