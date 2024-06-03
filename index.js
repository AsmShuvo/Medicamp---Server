const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
app.use(cors());
app.use(express.json());
// Use morgan to log requests to the console
app.use(morgan("dev"));
const port = process.env.PORT || 3000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ezfvwv5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const campCollection = client.db("medicampDB").collection("camps");
    const participantCollection = client
      .db("medicampDB")
      .collection("participants");

    // ===========ALL GET APIs===============================================

    app.get("/camps", async (req, res) => {
      const result = await campCollection.find().toArray();
      res.send(result);
    });

    app.get("/camp/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await campCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    app.get("/participants", async (req, res) => {
      const result = await participantCollection.find().toArray();
      res.send(result);
    });

    //===========ALL POST APIs ================================================
    app.post("/participants", async (req, res) => {
      const newParticipant = req.body;
      console.log(newParticipant);
      const result = await participantCollection.insertOne(newParticipant);
      res.send(result);
    });

    // =========ALL PUT APIs=======================================================
    app.put("/participants/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true }; // if no, then create
      const updatedCamp = req.body;
      console.log(updatedCamp);
      const camp = {
        $set: {
          name: updatedCamp.name,
          image: updatedCamp.image,
          fees: updatedCamp.fees,
          date_time: updatedCamp.date_time,
          location: updatedCamp.location,
          healthcare_professional: updatedCamp.healthcare_professional,
          participant_count: updatedCamp.participant_count,
          description: updatedCamp.description,
        },
      };
      const result = await campCollection.updateOne(filter, camp, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Medicamp In Runinng");
});

app.listen(port, () => {
  console.log(`Bistro is running on ${port}`);
});
