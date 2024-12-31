const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
    // Extract the token from the Authorization header
    const token = req.headers['authorization']?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: 'Token missing or invalid' });
    }

    try {
        // Verify the JWT and decode its payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        
        // Attach the decoded payload (user information) to req.user
        req.user = decoded;

        next(); // Pass control to the next middleware or route handler
    } catch (err) {
        // Handle JWT verification errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        return res.status(401).json({ error: 'Authorization failed', message: err.message });
    }
};

module.exports = jwtMiddleware;
