// Middleware to check role
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
       
        const { role } = req.user; // The role is added in the JWT during login, and now accessed from req.user

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: "You don't have permission to access this resource." });
        }

        next(); // User has the required role, proceed with the request
    };
};

module.exports = authorize;
