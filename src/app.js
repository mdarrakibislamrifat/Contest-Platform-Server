const express = require('express');
const applyMiddleWare = require('./middlewares/applymiddleware');
const connectDB = require('./db/connectDB');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const authenticationRoutes=require('././routes/authentication/index');
const { default: mongoose } = require('mongoose');

applyMiddleWare(app)
app.use(authenticationRoutes)

app.get('/', (req, res) => {
    const db=mongoose.connection;
    const users=db.collection('users').find({}).toArray()
    res.send('Contest Platform in running!')
})

app.all('*',(req,res,next)=>{
    const error=new Error(`The requested url is invalid:${req.url}`)
    error.status=404
    next(error)
})

app.use((err,req,res,next)=>{
    res.status(err.status || 500).json({
        message:err.message
    })
})

const main=async()=>{
    await connectDB()
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}
main()