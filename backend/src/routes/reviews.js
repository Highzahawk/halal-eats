// src/routes/reviews.js
const express = require("express");
const { body, validationResult } = require("express-validator"); // Input validation
const router = express.Router();
const pool = require("../models/db");

// Get all reviews (GET)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM reviews");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

// Get a single review by ID (GET)
router.get("/:id", async (req, res) => {
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

// Create a new review (POST)
router.post(
  "/",
  [
    body("user_id").notEmpty().withMessage("User ID is required").isUUID().withMessage("Invalid UUID format"),
    body("restaurant_id").notEmpty().withMessage("Restaurant ID is required").isUUID().withMessage("Invalid UUID format"),
    body("rating")
      .isFloat({ min: 0, max: 5 })
      .withMessage("Rating must be a number between 0 and 5"),
    body("comment").optional().isString().withMessage("Comment must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, restaurant_id, rating, comment } = req.body;
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

// Update a review (PUT)
router.put(
  "/:id",
  [
    body("rating")
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage("Rating must be a number between 0 and 5"),
    body("comment").optional().isString().withMessage("Comment must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { rating, comment } = req.body;
    try {
      const result = await pool.query(
        "UPDATE reviews SET rating = COALESCE($1, rating), comment = COALESCE($2, comment) WHERE id = $3::uuid RETURNING *",
        [rating, comment, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Review not found." });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update the review." });
    }
  }
);

// Delete a review (DELETE)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM reviews WHERE id = $1::uuid RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found." });
    }
    res.json({ message: "Review deleted successfully.", review: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete the review." });
  }
});

module.exports = router;

