const express = require('express');
const connectToDatabase = require('./db');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require("./models/Users");

const app = express();
const port = process.env.PORT || 3000;

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectToDatabase();

const corsOptions = {
  origin: 'https://gaming-world-sigma.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Include credentials in CORS requests (if required)
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

// Example GET endpoint
app.get('/', async (req, res) => {
  try {
    const items = await User.find({});
    res.send(items);
  } catch (error) {
    res.status(500).send('Error connecting to database');
  }
});

// Example POST endpoint
const authRoutes = require('./routes/auth.js');
app.use('/api', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
