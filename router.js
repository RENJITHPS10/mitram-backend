const express=require('express')

const router=new express.Router()
const disasterController=require('./controller/disasterController')
const shelterController=require('./controller/shelterController')
const userController=require('./controller/usercontroller')
const multerconfig = require('./middleware/multermiddleware'); 
const adminController=require('./controller/adminController')

// get all disaster
router.get('/all-disaster',disasterController.getAllDisasterController)

router.get('/all-shelter',shelterController.getallshelterController)

router.post('/user-register',multerconfig.single('proof'),userController.userRegister)

// approve user login request
router.patch('/admin/approve-user/:userId',adminController.approveUser)

router.get('/admin/pending-users',adminController.getPendingUsers);


module.exports=router