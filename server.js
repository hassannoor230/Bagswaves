require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');

connectDB();
configureCloudinary();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`BagsWaves server running on port ${PORT}`);
});
