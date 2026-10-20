const mongoose = require('mongoose');

// Connects to MongoDB using the connection string from the .env file
async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Add it to your .env file.');
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
}

module.exports = connectDB;
