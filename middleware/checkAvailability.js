// Middleware to check if a lesson slot is available for an instructor
const pool = require("../config");

module.exports = async function checkAvailability(req, res, next) {
  const { instructor_id, date, time } = req.body;
  let connect;
  try {
    connect = await pool.getConnection();
    const existing = await connect.query(
      `SELECT * FROM lessons WHERE instructor_id = ? AND date = ? AND time = ?`,
      [instructor_id, date, time],
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "This instructor is already booked at that time" });
    }
    next();
  } catch (err) {
    next(err);
  } finally {
    if (connect) connect.release();
  }
};
