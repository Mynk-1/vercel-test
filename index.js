const express = require('express');
const connectToDatabase = require('./db');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require("./models/Users");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Users = require("./models/Users.js")

const app = express();
const port = process.env.PORT || 3000;

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectToDatabase();

const corsOptions = {
  origin: ['https://gaming-world-sigma.vercel.app',"http://localhost:5173"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Include credentials in CORS requests (if required)
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

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
app.get('/api/authCheck', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify JWT token
  jwt.verify(token, "yourSecretToken", (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = decoded.user.id; 
    User.findById(userId)
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        res.status(200).json({ user });
      })
      .catch(err => {
        console.error('Error finding user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  });
});

// Example POST endpoint
const authRoutes = require('./routes/auth.js');
app.use('/api', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
