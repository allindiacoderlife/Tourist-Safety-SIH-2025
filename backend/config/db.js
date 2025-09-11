const mongoose = require('mongoose');
const { db_url } = require('./secret');

mongoose.set('strictQuery', false);

// mongodb url
const MONGO_URI = db_url;

const connectDB = async () => {
  try { 
    await mongoose.connect(MONGO_URI);
    console.log('mongodb connection success!');
  } catch (err) {
    console.log('mongodb connection failed!', err.message);
  }
};

module.exports = connectDB;