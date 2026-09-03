require('dotenv').config();

const app = require('../app');
const connectDB = require('../config/db');
const { configureCloudinary } = require('../config/cloudinary');

configureCloudinary();
const databaseConnection = connectDB();

module.exports = async (req, res) => {
  try {
    await databaseConnection;
    return app(req, res);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    return res.status(503).json({ success: false, message: 'Database unavailable' });
  }
};