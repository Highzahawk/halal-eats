// src/routes/friends.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const pool = require("../models/db");

// Get all friend relationships
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM friends");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch friends." });
  }
});

// Add a new friend relationship
router.post(
  "/",
  [
    body("user_id").isUUID().withMessage("Valid user_id (UUID) is required"),
    body("friend_id").isUUID().withMessage("Valid friend_id (UUID) is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
  }
);

// Remove a friend relationship
router.delete("/:id", async (req, res) => {
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

