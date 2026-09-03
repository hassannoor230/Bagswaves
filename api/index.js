require('dotenv').config();

const app = require('../app');
const connectDB = require('../config/db');
const { configureCloudinary } = require('../config/cloudinary');

configureCloudinary();
const databaseConnection = connectDB();

module.exports = async (req, res) => {
  await databaseConnection;
  return app(req, res);
};