const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });