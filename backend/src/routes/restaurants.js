// src/routes/restaurants.js
const express = require("express");
const { body, validationResult } = require("express-validator"); // Input validation
const router = express.Router();
const pool = require("../models/db");

// Get all restaurants (GET)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM restaurants");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch restaurants." });
  }
});

// Get a single restaurant by ID (GET)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM restaurants WHERE id = $1::uuid", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Restaurant not found." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch restaurant." });
  }
});

// Create a new restaurant (POST)
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Restaurant name is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("cuisine").notEmpty().withMessage("Cuisine type is required"),
    body("rating")
      .isFloat({ min: 0, max: 5 })
      .withMessage("Rating must be a number between 0 and 5"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, location, cuisine, rating } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO restaurants (id, name, location, cuisine, rating, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW()) RETURNING *",
        [name, location, cuisine, rating]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create a new restaurant." });
    }
  }
);

// Update a restaurant (PUT)
router.put(
  "/:id",
  [
    body("rating")
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage("Rating must be a number between 0 and 5"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, location, cuisine, rating } = req.body;
    try {
      const result = await pool.query(
        "UPDATE restaurants SET name = COALESCE($1, name), location = COALESCE($2, location), cuisine = COALESCE($3, cuisine), rating = COALESCE($4, rating) WHERE id = $5::uuid RETURNING *",
        [name, location, cuisine, rating, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Restaurant not found." });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update the restaurant." });
    }
  }
);

// Delete a restaurant (DELETE)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM restaurants WHERE id = $1::uuid RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Restaurant not found." });
    }
    res.json({ message: "Restaurant deleted successfully.", restaurant: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete the restaurant." });
  }
});

module.exports = router;

