require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MongoDB Atlas connection string from environment
const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);

async function main() {
  try {
    // Connect once at startup
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("my-db"); // Your database name

    // Serve index.html
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, "index.html"));
    });

    // Serve profile picture
    app.get('/profile-picture', (req, res) => {
      const img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
      res.writeHead(200, { 'Content-Type': 'image/jpg' });
      res.end(img, 'binary');
    });

    // Get profile
    app.get('/get-profile', async (req, res) => {
      try {
        const result = await db.collection("users").findOne({ userid: 1 });
        res.json(result || {});
      } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).send("DB error");
      }
    });

    // Update profile
    app.post('/update-profile', async (req, res) => {
      try {
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

    // Start server using Cloud Run provided port
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 App listening on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

main();
