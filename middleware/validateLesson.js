// Middleware to validate lesson booking data
module.exports = function validateLesson(req, res, next) {
  const { instructor_id, name, email, phone, date, time } = req.body;
  if (!instructor_id || !name || !email || !phone || !date || !time) {
    return res.status(400).json({ error: "All fields are required." });
  }
  next();
};
