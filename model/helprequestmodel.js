// models/HelpRequest.js
const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestType: {
        type: String,
        enum: ['Food', 'Shelter', 'Medical', 'Rescue', 'Other'],
        required: true
    },
    description: { type: String, required: true },
    location: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    contact:{
        type:Number,
        required:true

    },
    dateCreated: { type: Date, default: Date.now },
    dateResolved: { type: Date }
});

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
