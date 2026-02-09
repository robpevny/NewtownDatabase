const express = require('express');
const router = express.Router();
const pool = require('../config');

// GET /api/instructors
router.get('/', async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const instructors = await connection.query(`
      SELECT id, name, level, bio, price, email, photo
      FROM instructors
    `);

    res.json(instructors);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load instructors' });

  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
