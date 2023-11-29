const mongoose=require('mongoose')
require("dotenv").config();


const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d0x6rpk.mongodb.net/?retryWrites=true&w=majority`

const getConnecting=()=>{
    let connectionURI;
    if(uri){
        connectionURI=uri
    }
    return connectionURI;
}

const connectDB=async ()=>{
    console.log('connecting database..')
    const url=getConnecting()
    
    console.log('connected to database')
}
module.exports=connectDB