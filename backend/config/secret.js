const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, "../../.env") })

module.exports.secret = {
  port: process.env.PORT,
  db_url: process.env.MONGO_URI,
}