require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { connection, client } = require("./DB/databaseDB");
const port = process.env.PORT || 9000;
connection();

app.use(cors());
app.use(express.json());

const soloCollection = client.db("soloSphereDB").collection("soloSphere");

app.post("/solos", async (req, res) => {
  const newSolo = req.body;
  const result = await soloCollection.insertOne(newSolo);
  res.send(result);
});
app.get("/", (req, res) => {
  res.send("Hello from SoloSphere Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
