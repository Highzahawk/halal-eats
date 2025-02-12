// src/routes/reviews.js
const express = require("express");
const router = express.Router();
const pool = require("../models/db");

// Get all reviews
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM reviews");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

module.exports = router;