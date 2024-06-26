const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = () => {
  const uri = process.env.MONGODB_URI;

  mongoose.connect(uri);

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log('Connected to MongoDB Atlas');
  });
};

module.exports = connectToDatabase;
