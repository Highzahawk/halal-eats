// src/routes/activity.js
const express = require("express");
const router = express.Router();
const pool = require("../models/db");

// Get all activity logs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM activity");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch activity logs." });
  }
});

module.exports = router;