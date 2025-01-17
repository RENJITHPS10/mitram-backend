const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define upload directory
const uploadDirectory = path.join(__dirname, 'uploads');

// Create the 'uploads' directory if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
    console.log('Uploads directory created!');
}

// Configure storage for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);  // Use absolute path
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Unique file name
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
        // Reject invalid file type with an appropriate error message
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
};

// Multer middleware configuration
const multerConfig = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Optional: limit file size (5MB)
});

// Export the single file upload middleware
module.exports = multerConfig;
