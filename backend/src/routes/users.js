// src/routes/users.js
const express = require("express");
const { body, validationResult } = require("express-validator"); // Input validation
const router = express.Router();
const pool = require("../models/db");
const authenticateUser = require("../middleware/authMiddleware"); // Import Firebase Auth middleware

// 🔒 Get all users (Protected) - Requires authentication
router.get("/", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// 🔒 Get a single user by ID (Protected) - Requires authentication
router.get("/:id", authenticateUser, async (req, res) => {
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

// 🆓 Create a new user (Public) - Users sign up first, then authenticate later
router.post(
  "/",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("username").notEmpty().withMessage("Username is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, profile_pic = "" } = req.body;
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
  }
);

// 🔒 Update a user (Protected) - Requires authentication
router.put(
  "/:id",
  authenticateUser,
  [
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("username").optional().notEmpty().withMessage("Username cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { username, email, profile_pic } = req.body;
    try {
      const result = await pool.query(
        "UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), profile_pic = COALESCE($3, profile_pic) WHERE id = $4 RETURNING *",
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
  }
);

// 🔒 Delete a user (Protected) - Requires authentication
router.delete("/:id", authenticateUser, async (req, res) => {
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
