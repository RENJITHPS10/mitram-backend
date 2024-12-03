const disasters = require("../model/disastermodel")

exports.getAllDisasterController=async(req,res)=>{
    try{
        const alldisasters=await disasters.find()
        res.status(200).json(alldisasters)
    }catch(err){
        res.status(401).json(err)
    }

}