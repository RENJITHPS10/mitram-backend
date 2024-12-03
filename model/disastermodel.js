const mongoose = require('mongoose')

const disasterSchema = new mongoose.Schema({
    name:{
        type:String,
        requried:true
    },
    date:{
        type:Date,
        requried:true
    },
    description:{
        type:String,
        requried:true
    },
    location:{
        type:String,
        requried:true
    },
    affectedarea:{
        type:String,
        requried:true
    },
    impact:{
        type:String,
        requried:true
    },
    contacts:{
        type:String,
        requried:true
    },
    image:{
        type:String,
        requried:true

    }


})

const disasters = mongoose.model('disasters', disasterSchema)

module.exports = disasters