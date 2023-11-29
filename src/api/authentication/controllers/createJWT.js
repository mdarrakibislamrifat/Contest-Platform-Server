const jwt=require('jsonwebtoken');
require("dotenv").config();

const createJWT=async(req,res)=>{
    const user=req.body;
    const token=jwt.sign(user,process.env.ACCESS_TOKEN,{
        expiresIn:'4h'
    })
    res.send({token})
}

module.exports=createJWT