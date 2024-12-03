const express=require('express')
require('dotenv').config()
const cors=require('cors')
const router=require('./router')

require('./connection')
// create server
const app=express()

// server using cors
app.use(cors())

// to pasrse the json data
app.use(express.json())

app.use(router)




const port=4000 || process.env.PORT

app.listen(port,()=>{
    console.log(`server running successfully at port ${port}`)
    
})