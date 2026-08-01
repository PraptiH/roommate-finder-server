const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

let clientPromise = null;
function getClient() {
  if (!clientPromise) {
    clientPromise = client.connect()
      .then(async () => {
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        return client;
      })
      .catch((err) => {
        clientPromise = null;
        throw err;
      });
  }
  return clientPromise;
}

function getPostsCollection() {
  return getClient().then((c) => c.db('roommatefinder').collection("posts"));
}
function getUsersCollection() {
  return getClient().then((c) => c.db('roommatefinder').collection("users"));
}

app.get('/', (req, res) => {
  res.send('RoommateFinder Server is Running!!!!')
})

app.get('/homePosts', async (req, res) => {
  try {
    const postsCollection = await getPostsCollection();
    const result = await postsCollection.find({ availability: "Available" }).limit(6).toArray()
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Database connection failed" });
  }
})

app.get('/posts', async (req, res) => {
  try {
    const postsCollection = await getPostsCollection();
    const result = await postsCollection.find().toArray()
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Database connection failed" });
  }
})

app.get('/posts/:id', async (req, res) => {
  try {
    const postsCollection = await getPostsCollection();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await postsCollection.findOne(query)
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Database connection failed" });
  }
})

app.post('/posts', async (req, res) => {
  try {
    const postsCollection = await getPostsCollection();
    const newPost = req.body;
    console.log(newPost)
    const result = await postsCollection.insertOne(newPost)
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Database connection failed" });
  }
})

app.put('/posts/:id', async (req, res) => {
  try {
    const postsCollection = await getPostsCollection();
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) }
    const options = { upsert: true }
    const updatedPost = req.body
    const updatedDoc = { $set: updatedPost }
    const result = await postsCollection.updateOne(filter, updatedDoc, options)
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Database connection failed" });
  }
})

app.delete('/posts/:id', async (req, res) => {
  try {
    const postsCollection = await getPostsCollection();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await postsCollection.deleteOne(query)
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Database connection failed" });
  }
})

app.get('/users', async (req, res) => {
  try {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.find().toArray()
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Database connection failed" });
  }
})

app.get('/users/:id', async (req, res) => {
  try {
    const usersCollection = await getUsersCollection();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await usersCollection.findOne(query)
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Database connection failed" });
  }
})

app.post('/users', async (req, res) => {
  try {
    const usersCollection = await getUsersCollection();
    const userProfile = req.body;
    console.log(userProfile)
    const query = { email: userProfile.email }
    const updatedDoc = { $set: userProfile };
    const options = { upsert: true }
    const result = await usersCollection.updateOne(query, updatedDoc, options);
    if (result.upsertedId) {
      return res.send((result.upsertedId))
    } else {
      res.send(result)
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Database connection failed" });
  }
})

getClient().catch(console.error);

app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})