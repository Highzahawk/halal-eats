// src/routes/restaurants.js
const express = require("express");
const router = express.Router();
const pool = require("../models/db"); // Database connection

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

// Create a new restaurant (POST)
router.post("/", async (req, res) => {
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
});

// Update a restaurant (PUT)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, location, cuisine, rating } = req.body;
  try {
    const result = await pool.query(
      "UPDATE restaurants SET name = $1, location = $2, cuisine = $3, rating = $4 WHERE id = $5::uuid RETURNING *",
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
});

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
