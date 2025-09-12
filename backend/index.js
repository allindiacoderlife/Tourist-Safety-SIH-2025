const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const app = express();

const { port } = require("./config/secret");
const connectDB = require("./config/db");
const socketService = require("./services/socketService");

// Import routes
const apiRoutes = require("./routes");

const PORT = port || 7001;

connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketService.init(server);

// middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use('/api', apiRoutes);

app.get("/", (req, res) => res.send("Tourist Safety API is working successfully !!!"));

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// 404 handler for all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
