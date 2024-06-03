const express = require('express');
const connectToDatabase = require('./db');
const Item = require('./models/items.js');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');

// Connect to the database
dotenv.config(); 
connectToDatabase();

app.get('/', async (req, res) => {
  try {
    const items = await Item.find({});
    res.send(items);
  } catch (error) {
    res.status(500).send('Error connecting to database');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
