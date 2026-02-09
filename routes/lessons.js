const express = require('express');
const router = express.Router();
const pool = require('../config');

const validateLesson = require('../middleware/validateLesson');
const checkAvailability = require('../middleware/checkAvailability');


// POST /api/lessons
router.post('/', async (req, res) => {
  let connection;

  const {
    instructor_id,
    name,
    email,
    phone,
    date,
    time,
  } = req.body;

  try {
    connection = await pool.getConnection();

    await connection.query(`
      INSERT INTO lessons
      (instructor_id, name, email, phone, date, time)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      instructor_id,
      name,
      email,
      phone,
      date,
      time,
    ]);

    res.json({
      message: 'Lesson booked successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Booking failed' });

  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
