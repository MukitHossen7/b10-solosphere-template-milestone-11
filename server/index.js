require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const { connection, client } = require("./DB/databaseDB");
const { ObjectId } = require("mongodb");
const port = process.env.PORT || 9000;
connection();

//Add middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(cookieParser());
//Add middleware

//custom middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send({ message: "UnAuthorize" });
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};
const soloCollection = client.db("soloDB").collection("jobs");
const bidCollection = client.db("soloDB").collection("bids");

//verify the user usage token
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "1h" });
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send({ success: true });
});
app.post("/logOut", async (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send({ cookieRemove: true });
});
//save data in database
app.post("/add-job", async (req, res) => {
  const newData = req.body;
  const result = await soloCollection.insertOne(newData);
  res.send(result);
});

// All jobs fetched successfully
app.get("/all_jobs", async (req, res) => {
  const filter = req.query.filter;
  const search = req.query.search;
  const sort = req.query.sort;
  const query = {};
  if (filter) {
    query.category = filter;
  }
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }
  const sortOptions = { deadline: sort === "dsc" ? 1 : -1 };

  const result = sortOptions
    ? await soloCollection.find(query).sort(sortOptions).toArray()
    : await soloCollection.find(query).toArray();
  res.send(result);
});
//bid data in database
app.post("/bid_jobs", async (req, res) => {
  const newBidData = req.body;
  // Check allReady bid this job
  const query = { bid_email: newBidData.bid_email, jobId: newBidData.jobId };
  const checkBids = await bidCollection.findOne(query);
  if (checkBids) {
    return res.status(400).send({ massage: "Already bids this job" });
  }

  const result = await bidCollection.insertOne(newBidData);
  //update bid count
  const idJob = req.body.jobId;
  const filter = { _id: new ObjectId(idJob) };
  const updateDoc = {
    $inc: { bid_count: 1 },
  };
  const updateJob = await soloCollection.updateOne(filter, updateDoc);
  res.send(result);
});

//get all bid data in login user in database

app.get("/bid_jobs/:email", verifyToken, async (req, res) => {
  const email = req.params.email;
  const query = { bid_email: email };
  if (req.user.email !== email) {
    return res.status(403).send({ message: "Forbidden" });
  }

  const bidUsers = await bidCollection.find(query).toArray();
  res.send(bidUsers);
});
app.get("/bid_request", async (req, res) => {
  const email = req.query.email;
  const query = { buyer_email: email };
  const bidUsers = await bidCollection.find(query).toArray();
  res.send(bidUsers);
});

//Update Status
app.patch("/bid_status_update/:id", async (req, res) => {
  const status = req.body;
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: { status: status.status },
  };
  const result = await bidCollection.updateOne(filter, updateDoc);
  res.send(result);
});

// app.get("/bid_jobs", async (req, res) => {
//   const email = req.query.email;
//   const query = { bid_email: email };
//   const bidUsers = await bidCollection.find(query).toArray();
//   for (const bidUser of bidUsers) {
//     const params = { _id: new ObjectId(bidUser.jobId) };
//     const bidJob = await soloCollection.findOne(params);
//     if (bidJob) {
//       bidUser.title = bidJob.title;
//       bidUser.category = bidJob.category;
//     }
//   }
//   res.send(bidUsers);
// });
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
app.patch("/update-job/:id", async (req, res) => {
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
