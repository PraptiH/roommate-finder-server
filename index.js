const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.ndmztgi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

app.use(cors());
app.use(express.json());


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
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    //Posts API
    const postsCollection = client.db('roommatefinder').collection("posts")
    
    app.get('/posts',async(req,res)=>{
      const result = await postsCollection.find().toArray()
      res.send(result)
    })

    app.post('/posts',async(req,res)=>{
      const newPost = req.body;
      console.log(newPost)
      const result = await postsCollection.insertOne(newPost)
      res.send(result)
    })

    // users API

    const usersCollection = client.db('roommatefinder').collection("users")

    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const userProfile = req.body;
      console.log(userProfile)

      const query = { email: userProfile.email }
      const updatedDoc = {
        $set: userProfile
      };
      const options = {
        upsert:true
      }
      const result = await usersCollection.updateOne(query, updatedDoc, options);
      if (result.upsertedId) {
        return res.send ((result.upsertedId))
      }

      else{
        res.send(result)
      }
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('RoommateFinder Server is Running!!!!')
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})