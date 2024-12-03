const mongoose=require('mongoose')

const shelterSchema=new mongoose.Schema({
    name:{
        type:String,
        requried:true
    },
    location:{
        type:String,
        requried:true
    },
    capacity:{
        type:Number,
        required:true
    },
    current_occupancy:{
        type:Number,
        required:true
    },
    amenities:{
        type:String,
        required:true
    },
    contact:{
        type:String,
        required:true
    },
    map:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
})

const shelters=mongoose.model('shelters',shelterSchema)

module.exports=shelters