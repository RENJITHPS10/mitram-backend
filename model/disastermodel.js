const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    affectedarea: {
        type: String,
        required: true,
    },
    impact: {
        type: String,
        required: true,
    },
    contacts: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    reportedBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users', // Reference to User model
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin', // Reference to Admin model
        },
        role: {
            type: String,
            enum: ['user', 'admin'], // Limit roles to user or admin
            required: true,
        },
    },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Disaster = mongoose.model('Disaster', disasterSchema);

module.exports = Disaster;
