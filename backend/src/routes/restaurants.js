// src/routes/restaurants.js
const express = require("express");
const router = express.Router();
const pool = require("../models/db"); // Database connection

// Get all restaurants
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM restaurants");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch restaurants." });
  }
});

module.exports = router;