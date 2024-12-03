const shelters = require("../model/sheltermodel")

exports.getallshelterController=async(req,res)=>{
    try {
        const allshelters=await shelters.find()
        res.status(200).json(allshelters)

        
    } catch (error) {
        res.status(401).json(error)
        
    }
}