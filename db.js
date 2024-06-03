const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGODB_URI;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas', error);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
