// src/routes/friends.js
const express = require("express");
const router = express.Router();
const pool = require("../models/db");

// Get all friends
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM friends");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch friends." });
  }
});

module.exports = router;