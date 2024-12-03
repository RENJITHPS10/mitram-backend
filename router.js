const express=require('express')

const router=new express.Router()
const disasterController=require('./controller/disasterController')
const shelterController=require('./controller/shelterController')

// get all disaster
router.get('/all-disaster',disasterController.getAllDisasterController)

router.get('/all-shelter',shelterController.getallshelterController)

module.exports=router