const multer = require('multer');
const path = require('path');

// Configure storage for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Upload folder path
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});

// File type validation
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    if (allowedTypes.test(ext) && allowedTypes.test(mimeType)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
};

// Multer middleware
const multerConfig = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = multerConfig;
