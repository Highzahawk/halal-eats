// src/routes/activity.js
const express = require("express");
const router = express.Router();
const pool = require("../models/db");

// Get all activity logs (GET)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM activity");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch activity logs." });
  }
});

// Add a new activity log (POST)
router.post("/", async (req, res) => {
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

// Update an activity log (PUT)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  try {
    const result = await pool.query(
      "UPDATE activity SET action = $1 WHERE id = $2::uuid RETURNING *",
      [action, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Activity log not found." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update activity log." });
  }
});

// Remove an activity log (DELETE)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM activity WHERE id = $1::uuid RETURNING *", [id]);
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
