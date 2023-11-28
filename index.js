const express = require('express');
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt=require('jsonwebtoken');
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// const cookieParser=require('cookie-parser')
const port = process.env.PORT || 5000;

app.use(express.json())
// app.use(cookieParser())
app.use(cors())

//  {
//     origin:['http://localhost:5173','https://abashed-hydrant.surge.sh'],
//     credentials:true
// }









const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d0x6rpk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const database = client.db('contestPlatform')
        const usersCollection = database.collection('users');
        const contestsCollection = database.collection('contests');
        const registerUsersCollection = database.collection('registerUser');


        // verify token middleware

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


        // user admin verify

    const verifyAdmin=async(req,res,next)=>{
        const email=req.decoded.email;
        const query={email:email}
        const user=await usersCollection.findOne(query)
        const isAdmin=user?.role==='admin';
        if(!isAdmin){
          return res.status(403).send({message:'forbidden access'})
        }
        next();
      }

    const verifyCreator=async(req,res,next)=>{
        const email=req.decoded.email;
        const query={email:email}
        const user=await usersCollection.findOne(query)
        const isCreator=user?.role==='creator';
        if(!isCreator){
          return res.status(403).send({message:'forbidden access'})
        }
        next();
      }
        
    //   contest related api
    app.post('/contests',verifyToken,verifyCreator,async(req,res)=>{
        const contest=req.body;
        contest.count=0;
        const result=await contestsCollection.insertOne(contest);
        res.send(result)
    })

    

    

    app.get('/contests/payments/new/item/:id',async(req,res)=>{
        const id=req.params.id;
       const query={_id:new ObjectId(id)}
        const result=await contestsCollection.find(query).toArray()
        res.send(result)
      })

    app.post('/registration', async (req, res) => {
        const registerUser = req.body;
        
        const updateItem=await contestsCollection.updateOne({_id: new ObjectId(registerUser.id)},{$inc:{count:1}})
        const result = await registerUsersCollection.insertOne(registerUser)
        res.send(result)
    })

    app.get('/registration',async(req,res)=>{
        
        const result=await registerUsersCollection.find().toArray();
        res.send(result);
    })

    app.get('/registration/v1/v2/:creatorEmail',async(req,res)=>{
        const creatorEmail=req.params.creatorEmail;
        const result=await registerUsersCollection.find({creatorEmail: creatorEmail}).toArray();
        res.send(result);
    })

    app.get('/register/:email',async(req,res)=>{
        const email=req.params.email;
        const result=await registerUsersCollection.find({email:email}).toArray();
        res.send(result);
    })


    

    app.patch('/registration/v1/v2/:id',async(req,res)=>{
        const id=req.params.id;
        const filter={_id:new ObjectId(id)}
        const updatedDoc={
            $set:{
                winner:'winner'
            }
        }
        const result=await registerUsersCollection.updateOne(filter,updatedDoc)
        res.send(result)
    })


    
    

    


    

    app.get('/contests',async(req,res)=>{
      
        const result=await contestsCollection.find().toArray();
        res.send(result)
    })


    app.get('/contests/:email',async(req,res)=>{
        const email=req.params.email;
        const query={email:email}
        const result=await contestsCollection.find(query).toArray();
        res.send(result)
    })

    app.get('/contests/new/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:new ObjectId(id)}
        const result=await contestsCollection.findOne(query)
        res.send(result)
      })
      

      app.patch('/contests/new/:id',async(req,res)=>{
        const item=req.body;
        const id=req.params.id;
        const filter={_id: new ObjectId(id)}
        const updatedDoc={
          $set:{
            name:item.name,
            type:item.type,
            price:item.price,
            image:item.image,
            task:item.task,
            money:item.money,
            description:item.description,
            date:item.date
          }
        }
        const result=await contestsCollection.updateOne(filter,updatedDoc)
        res.send(result)
      })

    app.delete('/contests/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:new ObjectId(id)}
        const result=await contestsCollection.deleteOne(query)
        res.send(result)
      })



        // users related api

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'user already exist', insertedId: null })
                
            }
            
            const result = await usersCollection.insertOne(user)
                res.send(result)

        })

        

        

        app.get('/user/admin/:email',verifyToken,async(req,res)=>{
            const email=req.params.email;
            if(email !== req.decoded.email){
                return res.status(403).send({message:'forbidden access'})
            }
            const query={email:email}
            const user=await usersCollection.findOne(query);
            let admin=false;
            if(user){
                admin=user?.role=== 'admin'
            }
            res.send({admin})

        })


        app.get('/user/creator/:email',verifyToken,async(req,res)=>{
            const email=req.params.email;
            if(email !== req.decoded.email){
                return res.status(403).send({message:'forbidden access'})
            }
            const query={email:email}
            const user=await usersCollection.findOne(query);
            let creator=false;
            if(user){
                creator=user?.role=== 'creator'
            }
            res.send({creator})

        })

        app.get('/users',verifyToken,verifyAdmin ,async(req,res)=>{
            
            const result=await usersCollection.find().toArray()
            res.send(result)
        })

        app.delete('/users/:id',verifyToken,verifyAdmin,async(req,res)=>{
            const id=req.params.id;
            const query={_id:new ObjectId(id)}
            const result=await usersCollection.deleteOne(query)
            res.send(result)
        })

        // admin related api
        app.patch('/users/admin/:id',verifyToken,verifyAdmin,async(req,res)=>{
            const id=req.params.id;
            const filter={_id:new ObjectId(id)}
            const updatedDoc={
                $set:{
                    role:'admin'
                }
            }
            const result=await usersCollection.updateOne(filter,updatedDoc)
            res.send(result)
        })

        // creator related api
        app.patch('/users/creator/:id',verifyToken,verifyAdmin,async(req,res)=>{
            const id=req.params.id;
            const filter={_id:new ObjectId(id)}
            const updatedDoc={
                $set:{
                    role:'creator'
                }
            }
            const result=await usersCollection.updateOne(filter,updatedDoc)
            res.send(result)
        })

        app.patch('/users/client/:id',verifyToken,verifyAdmin,async(req,res)=>{
            const id=req.params.id;
            const filter={_id:new ObjectId(id)}
            const updatedDoc={
                $set:{
                    role:'client'
                }
            }
            const result=await usersCollection.updateOne(filter,updatedDoc)
            res.send(result)
        })

        // pending or confirmed
        app.patch('/contests/admin/:id',verifyToken,verifyAdmin,async(req,res)=>{
            const id=req.params.id;
            const filter={_id:new ObjectId(id)}
            const updatedDoc={
                $set:{
                    status:'confirmed'
                }
            }
            const result=await contestsCollection.updateOne(filter,updatedDoc)
            res.send(result)
        })

        

        // jwt related api
        app.post('/jwt',async(req,res)=>{
            const user=req.body;
            const token=jwt.sign(user,process.env.ACCESS_TOKEN,{
                expiresIn:'4h'
            })
            res.send({token})
        })

        // payment intent
        app.post('/create-payment-intent', async (req, res) => {
            try {
              const { price } = req.body;
              
              const numericPrice = parseFloat(price);
              const amount = Math.round(numericPrice * 100);
              const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']
              });
             
              res.send({
                clientSecret: paymentIntent.client_secret
              });
            } catch (error) {
              console.error('Error creating payment intent:', error);
              res.status(500).send({ error: 'Failed to create payment intent' });
            }
          });
          
          
        
        
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

