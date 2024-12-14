require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { connection, client } = require("./DB/databaseDB");
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
  const result = await soloCollection.find().toArray();
  res.send(result);
});
app.get("/", (req, res) => {
  res.send("Hello from SoloSphere Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
