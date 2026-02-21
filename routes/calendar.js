const express = require("express");
const router = express.Router();
const pool = require("../config");

// GET /api/calendar
// Returns either rows from a `calendar` table (if present) or a fallback static weekly schedule.
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const rows = await connection.query(
      "SELECT type, description, day, time FROM calendar"
    );
    res.json(rows); // must be an array!
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
