const jwt=require('jsonwebtoken');
require("dotenv").config();

const verifyToken=(req,res,next)=>{
            
    if(!req.headers.authorization){
        return res.status(401).send({message: 'unauthorized access'})
    }
    const token=req.headers.authorization;
    jwt.verify(token,process.env.ACCESS_TOKEN,(error,decoded)=>{
        if(error){
            return res.status(401).send({message:'unauthorized access'})
        }
        req.decoded=decoded;
        next();
    })
    
}


module.exports=verifyToken