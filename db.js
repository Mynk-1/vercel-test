const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas', error);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
