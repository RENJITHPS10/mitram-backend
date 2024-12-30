const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(" ")[1]; // Safely extract token
    if (!token) {
        return res.status(401).json({ error: 'Token missing or invalid' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey'); // Verify token
        req.payload = decoded; // Attach decoded data to request
        next(); // Proceed to the next handler
    } catch (err) {
        return res.status(401).json({ error: 'Authorization failed', message: err.message });
    }
};

module.exports = jwtMiddleware;
