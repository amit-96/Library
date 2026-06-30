const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/libra-ai';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Primary MongoDB connection failed: ${error.message}. Attempting local fallback...`);
    try {
      const connLocal = await mongoose.connect('mongodb://127.0.0.1:27017/libra-ai');
      console.log(`Local MongoDB Connected: ${connLocal.connection.host}`);
    } catch (localError) {
      console.error(`MongoDB Connection Error: Both primary and local connections failed. ${localError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
