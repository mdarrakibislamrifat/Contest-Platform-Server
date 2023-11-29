var express=require('express')
const createJWT = require('../../api/authentication/controllers/createJWT')
var router=express.Router()
 
router.post('/jwt',createJWT)

router.get('/registration',async(req,res)=>{
        
    const result=await registerUsersCollection.find().toArray();
    res.send(result);
})

module.exports=router