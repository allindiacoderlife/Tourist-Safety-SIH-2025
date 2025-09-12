const express = require("express");
const cors = require("cors");
const path = require("path");

console.log('Starting Tourist Safety Backend Server...');

const app = express();

const { port } = require("./config/secret");

const connectDB = require("./config/db");

const PORT = port || 7001;

connectDB();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.send("Apps worked successfully !!!"));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
