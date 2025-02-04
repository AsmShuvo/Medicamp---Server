const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
const port = process.env.PORT || 3000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ezfvwv5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const campCollection = client.db("medicampDB").collection("camps");
    const paymentCollection = client.db("medicampDB").collection("payments");
    const userCollection = client.db("medicampDB").collection("users");
    const reviewCollection = client.db("medicampDB").collection("reviews");
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
      const query = { _id: new ObjectId(id) };
      const result = await campCollection.findOne(query);
      res.send(result);
    });

    app.get("/participants", async (req, res) => {
      const result = await participantCollection.find().toArray();
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result); 
    });
    app.get("/payments", async (req, res) => {
      const result = await paymentCollection.find().toArray();
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });
    app.get("/payments/:id", async (req, res) => {
      const query = { email: req.params.id };
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    });

    //===========ALL POST APIs ================================================
    app.post("/participants", async (req, res) => {
      const newParticipant = req.body;
      const result = await participantCollection.insertOne(newParticipant);
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });
    app.post("/camps", async (req, res) => {
      const newCamp = req.body;
      const result = await campCollection.insertOne(newCamp);
      res.send(result);
    });
    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      console.log(newReview);
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentCollection.insertOne(payment);
      const query = {
        _id: {
          $in: payment.cartIds.map((id) => new ObjectId(id)),
        },
      };
      const deleteResult = await participantCollection.deleteMany(query);
      res.send({ paymentResult, deleteResult });
    });

    // =========ALL PUT APIs=======================================================
    app.put("/participants/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCamp = req.body;
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
    app.put("/camps/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCamp = req.body;
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
    // =======================ALL PATCH APIS=============================
    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedUser = {
        $set: {
          role: "Admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedUser);
      res.send(result);
    });
    app.patch("/payments/:id/:email/:confirmation", async (req, res) => {
      const id = req.params.id;
      const email = req.params.email;
      const confirmation = req.params.confirmation;
      console.log(id);
      console.log("#", email);
      const filter = { _id: new ObjectId(id) };
      const updatedCampStatus = {
        $set: {
          status: confirmation,
        },
      };
      console.log(updatedCampStatus);
      const result = await paymentCollection.updateOne(
        filter,
        updatedCampStatus
      );
      res.send(result);
    });
    //==============ALL DELETE APIs======================================
    app.delete("/camps/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campCollection.deleteOne(query);
      res.send(result);
    });
    app.delete("/participants/:id/:email", async (req, res) => {
      const id = req.params.id;
      const email = req.params.email;
      const query = { _id: new ObjectId(id), participant_email: email };
      console.log(query);
      const result = await participantCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });
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
