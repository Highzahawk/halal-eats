const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});

pool.connect()
  .then(() => console.log("📦 Connected to Supabase PostgreSQL database via Transaction Pooler"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = pool;
