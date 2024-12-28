const Users = require("../model/usermodel");


exports.approveUser = async (req, res) => {
    const { userId } = req.params; // Extract user ID from route parameters

    try {
        // Find the user by ID and update the `approve` field to true
        const updatedUser = await Users.findByIdAndUpdate(
            userId,
            {  isApproved: true },
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

exports.getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await Users.find({ isApproved: false });
        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error("Error fetching pending users:", error);
        res.status(500).json({ error: "Could not fetch pending users" });
    }
};
