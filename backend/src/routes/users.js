// src/routes/users.js
const express = require("express");
const router = express.Router();
const pool = require("../models/db");

// Get all users
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

module.exports = router;