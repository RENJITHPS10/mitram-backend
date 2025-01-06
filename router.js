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
router.post('/user-reportdisaster', jwtMiddleware, multerConfig.single('image'), userController.reportDisaster)
router.get('/user/disasters', jwtMiddleware, userController.getUserDisasters);
router.put('/disasters/:disasterId', jwtMiddleware, multerConfig.single('image'), userController.editDisaster);
router.delete('/delete-disasters/:id', jwtMiddleware, userController.deleteDisasterById);
router.post('/helprequest',jwtMiddleware,userController.createHelpRequest)
router.get('/userhelprequest',jwtMiddleware,userController.getUsersHelpRequests)
router.put('/updatehelprequest/:id',jwtMiddleware,userController.updateHelpRequest)
router.delete('/deletehelprequest/:id',jwtMiddleware,userController.deleteHelpRequestById)


// Admin-Specific Routes
router.post('/adminlogin', adminController.adminLogin)


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
router.delete('/admin/reject-user/:userId',jwtMiddleware,authorize('admin'),adminController.deleteUser)
router.post('/admin/shelters',jwtMiddleware, multerConfig.single('image'),authorize('admin'),adminController.reportShelter)
router.put('/updateshelters/:id',jwtMiddleware, multerConfig.single('image'),authorize('admin'),adminController.updateShelter)
router.delete('/deleteshelter/:id',jwtMiddleware,authorize('admin'),adminController.deleteshelter)
router.get('/allhelprequest',jwtMiddleware,authorize('admin'),adminController.gethelprequests)
router.patch('/allhelprequest/:id',jwtMiddleware,authorize('admin'),adminController.updateHelpRequest)
router.delete('/allhelprequest/:id',jwtMiddleware,authorize('admin'),adminController.deleteHelpRequest)
module.exports = router;
