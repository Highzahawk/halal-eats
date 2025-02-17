// src/routes/activity.js
const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const authenticateUser = require("../middleware/authMiddleware");

// Get all activity logs (Protected)
router.get("/", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT activity.*, users.username FROM activity JOIN users ON activity.user_id = users.id ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch activity logs." });
  }
});

// Get activity logs for a specific user (Protected)
router.get("/user/:userId", authenticateUser, async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT activity.*, users.username FROM activity JOIN users ON activity.user_id = users.id WHERE activity.user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch activity logs for the user." });
  }
});

// Add a new activity log (Protected)
router.post("/", authenticateUser, async (req, res) => {
  const { user_id, restaurant_id, action } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO activity (id, user_id, restaurant_id, action, created_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING *",
      [user_id, restaurant_id, action]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add activity log." });
  }
});

// Remove an activity log (Protected)
router.delete("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM activity WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Activity log not found." });
    }
    res.json({ message: "Activity log removed successfully.", activity: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove activity log." });
  }
});

module.exports = router;
