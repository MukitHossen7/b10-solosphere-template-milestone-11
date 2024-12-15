require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { connection, client } = require("./DB/databaseDB");
const { ObjectId } = require("mongodb");
const port = process.env.PORT || 9000;
connection();

app.use(cors());
app.use(express.json());

const soloCollection = client.db("soloDB").collection("jobs");

//save data in database
app.post("/add-job", async (req, res) => {
  const newData = req.body;
  const result = await soloCollection.insertOne(newData);
  res.send(result);
});

//get all jobs data in database
app.get("/jobs", async (req, res) => {
  const email = req.query.email;
  if (email) {
    const query = { "buyer.email": email };
    const result = await soloCollection.find(query).toArray();
    res.send(result);
  } else {
    const result = await soloCollection.find().toArray();
    res.send(result);
  }
});

// delete data in database use params
app.delete("/job/:id", async (req, res) => {
  const id = req.params.id;
  const result = await soloCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});
// get data user params

// app.get("/jobs/:email", async (req, res) => {
//   const email = req.params.email;
//   const query = { "buyer.email": email };
//   const result = await soloCollection.find(query).toArray();
//   res.send(result);
// });

//Single data access in database
app.get("/job/:id", async (req, res) => {
  const id = req.params.id;
  const result = await soloCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

//update data in database use params
app.put("/update-job/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  const query = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      title: updatedData.title,
      description: updatedData.description,
      buyer: {
        email: updatedData.buyer.email,
        name: updatedData.buyer.name,
        photo: updatedData.buyer.photo,
      },
      deadline: updatedData.deadline,
      category: updatedData.category,
      min_price: updatedData.min_price,
      max_price: updatedData.max_price,
      bid_count: updatedData.bid_count,
    },
  };
  const result = await soloCollection.updateOne(query, updateDoc, options);
  res.send(result);
});
app.get("/", (req, res) => {
  res.send("Hello from SoloSphere Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
