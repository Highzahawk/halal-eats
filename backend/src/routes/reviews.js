// src/routes/reviews.js
const express = require("express");
const { body, validationResult } = require("express-validator"); // Input validation
const router = express.Router();
const pool = require("../models/db");
const authenticateUser = require("../middleware/authMiddleware"); // Import auth middleware

// Get all reviews (Public)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT reviews.id, users.username, reviews.restaurant_id, 
              reviews.rating, reviews.comment, reviews.created_at 
       FROM reviews 
       JOIN users ON reviews.user_id = users.id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});


// Get a single review by ID (Protected)
router.get("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM reviews WHERE id = $1::uuid", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch review." });
  }
});

// Create a new review (Protected)
router.post(
  "/",
  authenticateUser,
  [
    body("restaurant_id").notEmpty().isUUID().withMessage("Invalid restaurant UUID"),
    body("rating").isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),
    body("comment").optional().isString().withMessage("Comment must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurant_id, rating, comment } = req.body;
    const user_id = req.user.uid; // Firebase Authenticated User

    try {
      const result = await pool.query(
        "INSERT INTO reviews (id, user_id, restaurant_id, rating, comment, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW()) RETURNING *",
        [user_id, restaurant_id, rating, comment]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create a new review." });
    }
  }
);

// Update a review (Protected)
router.put(
  "/:id",
  authenticateUser,
  [
    body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),
    body("comment").optional().isString().withMessage("Comment must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.uid; // Firebase Authenticated User

    try {
      const result = await pool.query(
        "UPDATE reviews SET rating = COALESCE($1, rating), comment = COALESCE($2, comment) WHERE id = $3::uuid AND user_id = $4 RETURNING *",
        [rating, comment, id, user_id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Review not found or not authorized to update" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update the review." });
    }
  }
);

// Delete a review (Protected)
router.delete("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.uid; // Firebase Authenticated User

  try {
    const result = await pool.query("DELETE FROM reviews WHERE id = $1::uuid AND user_id = $2 RETURNING *", [id, user_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found or not authorized to delete" });
    }
    res.json({ message: "Review deleted successfully.", review: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete the review." });
  }
});

module.exports = router;
