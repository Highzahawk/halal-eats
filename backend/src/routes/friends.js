// src/routes/friends.js
const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const authenticateUser = require("../middleware/authMiddleware"); // Import auth middleware

// Get all friend relationships (Protected)
router.get("/", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT f.id, f.user_id, u.username AS user_name, f.friend_id, u2.username AS friend_name, f.created_at " +
      "FROM friends f " +
      "JOIN users u ON f.user_id = u.id " +
      "JOIN users u2 ON f.friend_id = u2.id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch friends." });
  }
});

// Add a new friend relationship (Protected)
router.post("/", authenticateUser, async (req, res) => {
  const { user_id, friend_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO friends (id, user_id, friend_id, created_at) VALUES (gen_random_uuid(), $1, $2, NOW()) RETURNING *",
      [user_id, friend_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add a new friend." });
  }
});

// Remove a friend relationship (Protected)
router.delete("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM friends WHERE id = $1::uuid RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Friend relationship not found." });
    }
    res.json({ message: "Friend relationship removed successfully.", friend: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove friend relationship." });
  }
});

module.exports = router;
