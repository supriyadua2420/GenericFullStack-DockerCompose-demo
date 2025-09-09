require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const host = process.env.MONGO_HOST;
const port = process.env.MONGO_PORT;
const dbName = process.env.MONGO_DB;

const mongoUrl = `mongodb://${username}:${password}@${host}:${port}`;
const client = new MongoClient(mongoUrl);

// Serve index.html
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Serve profile picture
app.get('/profile-picture', function (req, res) {
  const img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
  res.writeHead(200, { 'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

// Get profile
app.get('/get-profile', async function (req, res) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const result = await db.collection("users").findOne({ userid: 1 });
    res.json(result || {});
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).send("DB error");
  }
});

// Update profile
app.post('/update-profile', async function (req, res) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const userObj = { ...req.body, userid: 1 };
    await db.collection("users").updateOne(
      { userid: 1 },
      { $set: userObj },
      { upsert: true }
    );
    res.json(userObj);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).send("DB error");
  }
});

app.listen(3000, function () {
  console.log("🚀 App listening on http://localhost:3000");
});
