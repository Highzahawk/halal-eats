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

// Get a single user by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user." });
  }
});

// Create a new user
router.post("/", async (req, res) => {
  const { username, email, profile_pic = "" } = req.body;  // Default to empty string
  try {
    const result = await pool.query(
      "INSERT INTO users (id, username, email, profile_pic, followers_count, following_count, created_at) VALUES (gen_random_uuid(), $1, $2, $3, 0, 0, NOW()) RETURNING *",
      [username, email, profile_pic]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create a new user." });
  }
});


// Update a user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, profile_pic } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET username = $1, email = $2, profile_pic = $3 WHERE id = $4 RETURNING *",
      [username, email, profile_pic, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update the user." });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ message: "User deleted successfully.", user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete the user." });
  }
});

module.exports = router;
