const express = require('express');
const router = express.Router();

// Controllers
const disasterController = require('./controller/disasterController');
const shelterController = require('./controller/shelterController');
const userController = require('./controller/usercontroller');
const adminController = require('./controller/adminController');

// Middlewares
const multerConfig = require('./middleware/multermiddleware');
const authorize = require('./middleware/authorizemiddleware'); // Updated name
const jwtMiddleware = require('./middleware/jwtmiddleware');

// Public Routes
router.get('/all-disaster', disasterController.getAllDisasterController);
router.get('/all-shelter', shelterController.getallshelterController);

// User and Volunteer Registration and Login
router.post('/register', multerConfig.single('proof'), userController.userRegister);
router.post('/login', userController.userLogin);

// Admin-Specific Routes
router.post('/adminlogin',adminController.adminLogin)


// Approve a user's or volunteer's registration request
router.patch(
   '/admin/approve-user/:userId',
    jwtMiddleware, // Ensure admin is logged in
    authorize('admin'), // Only admin can access this route
    adminController.approveUser
);

// Get all pending users and volunteers for admin approval
router.get(
    '/admin/pending-users',
    jwtMiddleware, // Ensure admin is logged in
    authorize('admin'), // Only admin can access this route
    adminController.getPendingUsers
);

module.exports = router;
