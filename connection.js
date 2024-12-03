const mongoose=require('mongoose')

const connectionStr=process.env.DATABASE

mongoose.connect(connectionStr).then(()=>{
    console.log('Database connected successfully')
}).catch((err)=>{
    console.log(`Database connection failed due to ${err}` )

})