const express = require("express");
const router = express.Router();
const pool = require("../config");

const validateLesson = require("../middleware/validateLesson");
const checkAvailability = require("../middleware/checkAvailability");

// POST /api/lessons
router.post("/", validateLesson, checkAvailability, async (req, res) => {
  let connection;

  const { date, instructor_id, time, name, email, phone } = req.body;

  try {
    connection = await pool.getConnection();

    await connection.query(
      `
      INSERT INTO lessons
      (date,instructor_id, time, name, email, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [date, instructor_id, time, name, email, phone],
    );

    res.json({
      message: "Lesson booked successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  } finally {
    if (connection) connection.release();
  }
});

// GET /api/lessons - Get all lessons
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const lessons = await connection.query(
      `SELECT id, date, instructor_id, time, name, email, phone FROM lessons`,
    );
    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load lessons" });
  } finally {
    if (connection) connection.release();
  }
});

// PATCH /api/lessons/:id - Update lesson details
router.patch("/:id", validateLesson, async (req, res) => {
  let connection;
  const lessonId = req.params.id;
  const { date, instructor_id, time, name, email, phone } = req.body;
  try {
    connection = await pool.getConnection();
    const result = await connection.query(
      `UPDATE lessons SET date = ?, instructor_id = ?, time = ?, name = ?, email = ?, phone = ? WHERE id = ?`,
      [date, instructor_id, time, name, email, phone, lessonId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    res.json({ message: "Lesson updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update lesson" });
  } finally {
    if (connection) connection.release();
  }
});

// DELETE /api/lessons/:id - Delete lesson by ID
router.delete("/:id", async (req, res) => {
  let connection;
  const lessonId = req.params.id;
  try {
    connection = await pool.getConnection();
    const result = await connection.query(`DELETE FROM lessons WHERE id = ?`, [
      lessonId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    res.json({ message: "Lesson deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete lesson" });
  } finally {
    if (connection) connection.release();
  }
});

// Optionally, add more endpoints for lessons here if needed in the future

module.exports = router;
