const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('CRITICAL ERROR: MONGO_URI environment variable is not defined in your .env file.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected successfully to Atlas Host: ${conn.connection.host}`);
    mongoose.set('bufferCommands', true);
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    // Disable Mongoose command buffering so queries fail immediately rather than hanging
    mongoose.set('bufferCommands', false);
  }
};

module.exports = connectDB;
