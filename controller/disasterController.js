const Disaster = require('../model/disastermodel'); // Ensure correct import of the Disaster model

exports.getAllDisasterController = async (req, res) => {
    try {
        const allDisasters = await Disaster.find()
            .populate('reportedBy.userId', 'username email')  // Populating userId field with username and email
            .populate('reportedBy.adminId', 'name email'); // Populating adminId field with username and email

        res.status(200).json({
            status: 'success',
            data: allDisasters, // Include all disasters with populated user data
        });
    } catch (err) {
        console.error('Error fetching disasters:', err); // Log error for debugging
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred while fetching disaster records.',
            error: err.message, // Include detailed error message for debugging
        });
    }
};
