const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Load environment variables
const pool = require("./src/models/db"); // PostgreSQL connection

const app = express();
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON requests

// Import routes
const restaurantRoutes = require("./src/routes/restaurants");
const userRoutes = require("./src/routes/users");
const reviewRoutes = require("./src/routes/reviews");
const friendRoutes = require("./src/routes/friends");
const activityRoutes = require("./src/routes/activity");

// Use routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/activity", activityRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Halal Eats API!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
