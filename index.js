require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 3000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster21kousar.ai36vz4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster21kousar`;

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

    const addTutorsCollection = client.db("eduBridge").collection("addTutors")
    const bookedTutorsCollection = client.db("eduBridge").collection("bookedTutors")
    const addEmailCollection = client.db("eduBridge").collection("addEmail")



    //get all tutor from data base via app.get and get single email via app.get
    app.get('/addTutors', async (req, res) => {
      const email = req.query.email;
      const search = req.query.search; // Get search data from query string

      let query = {};

      if (email) {
        query.email = email;
      }

      if (search) {
        query.language = { $regex: search, $options: "i" };
      }
      const result = await addTutorsCollection.find(query).toArray()
      res.send(result)
    })


    //get single update data via app.get
    app.get('/addTutors/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addTutorsCollection.findOne(query)
      res.send(result)
    })

    // add new tutor into db via app.post
    app.post('/addTutors', async (req, res) => {
      const newTutor = req.body;
      // console.log(newTutor)
      const result = await addTutorsCollection.insertOne(newTutor)
      res.send(result)
    })

    //update tutor data via app.put
    app.put('/addTutors/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateTutor = req.body
      const updateDoc = {
        $set: updateTutor
      }
      const result = await addTutorsCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })



    //delete tutor data from dataBase via app.delete
    app.delete('/addTutors/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await addTutorsCollection.deleteOne(query);
      res.send(result)
    })


    //for book tutor part


    //get booked tutor data from firebase
    app.get('/bookedTutors', async (req, res) => {
      const result = await bookedTutorsCollection.find().toArray()
      res.send(result)
    })


    //send booked tutor data to firebase
    app.post('/bookedTutors', async (req, res) => {
      const booked = req.body
      delete booked._id;
      const result = await bookedTutorsCollection.insertOne(booked);
      res.send(result);
    })


    // update doc via $inq operator and app.patch
    app.patch('/bookedTutors/:id', async (req, res) => {
      const tutorId = req.params.id;
      const email = req.query.email;

      console.log(tutorId)
      // const options = {upsert: true}
      const updateDoc = {
        $inc: { review: 1 }
      };
      const single = await bookedTutorsCollection.findOne({ _id: new ObjectId(tutorId) })
      // console.log(single)
      // Update the tutor 
      const updateAddTutor = await addTutorsCollection.updateOne(
        { _id: new ObjectId(single.tutorId) },
        updateDoc,
        // options

      );

      console.log("add collection", updateAddTutor)
      // Find the updated tutor 
      // const result = await addTutorsCollection.findOne({ _id: new ObjectId(tutorId) });
      // console.log("add tutor", result);

      // Update the tutor in book collection
      const updateBookedTutor = await bookedTutorsCollection.updateOne(
        { email: email, _id: new ObjectId(tutorId) },
        updateDoc,
        // options
      );
      console.log("booked review", updateBookedTutor)

      // Find the updated booked tutor
      // const result2 = await bookedTutorsCollection.findOne({ email: email, tutorId: tutorId });
      // console.log("book tutor", result2);

      // console.log("update add tutor", updateAddTutor);
      // console.log("update booked tutor", updateBookedTutor);

      res.send({
        success: true,
        addTutors: updateAddTutor,
        // bookedTutors: updateBookedTutor
      });
    });




    //email collection

    //get email data from collection
    app.get('/addEmail', async (req, res) => {
      const result = await addEmailCollection.find().toArray()
      res.send(result)
    })

    //add email to data collection
    app.post('/addEmail', async (req, res) => {
      const { email } = req.body

      if (!email) {
        return res.send("Need A valid email")
      }

      const addCollectionPart = await addTutorsCollection.findOne({ email })
      const bookedCollectionPart = await bookedTutorsCollection.findOne({ email })

      if (!addCollectionPart && !bookedCollectionPart) {
        const result = await addEmailCollection.insertOne({ email })
        return res.send(result)
      }
      return res.send("This Email Already exists")
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Assignment 11 is getting hot')
})

app.listen(port, () => {
  console.log(`Assignment 11 server is running on port ${port}`)
})