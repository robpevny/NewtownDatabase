const pool = require('../config');

module.exports = async function checkAvailability(req, res, next) {

  const { instructorId, date, time } = req.body;

  let connect;

  try {
    connect = await pool.getConnection();

    // Look for existing lesson with same instructor/date/time
    const existing = await connect.query(
      `SELECT *
       FROM lessons
       WHERE instructor_id = ?
         AND date = ?
         AND time = ?`,
      [instructorId, date, time]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'This instructor is already booked at that time'
      });
    }

    // continue to save lesson
    next();

  } catch (err) {
    next(err);

  } finally {
    if (connect) connect.release();
  }
};
