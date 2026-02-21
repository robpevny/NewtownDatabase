const express = require("express");
const router = express.Router();
const pool = require("../config");
const { getAvailableSlots } = require("../utils/availability");
const { timeToMinutes, minutesToTime, SLOT_MINUTES, addDays } = require("../helpers");

// GET /api/instructors
router.get("/", async (req, res) => {
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
    res.status(500).json({ message: "Failed to load instructors" });
  } finally {
    if (connection) connection.release();
  }
});

// GET /api/instructors/:id/weekly-availability
router.get("/:id/weekly-availability", async (req, res) => {
  const instructorId = Number(req.params.id);
  let connection;
  try {
    connection = await pool.getConnection();
    const rows = await connection.query(
      `SELECT day_of_week, start_time, end_time
       FROM instructor_availability
       WHERE instructor_id = ?`,
      [instructorId],
    );
    res.json(rows);
  } catch (err) {
    console.error("GET weekly-availability error:", err);
    res.status(500).json({ error: "Failed to load weekly availability" });
  } finally {
    if (connection) connection.release();
  }
});

// GET /api/instructors/:id/availability
router.get("/:id/availability", async (req, res) => {
  const instructorId = Number(req.params.id);
  const date = req.query.date;
  if (!date) {
    return res.status(400).json({ error: "date required" });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    const available = await getAvailableSlots(connection, instructorId, date);
    res.json(available);
  } catch (err) {
    console.error("GET availability error:", err);
    res.status(500).json({ error: "Failed to load availability" });
  } finally {
    if (connection) connection.release();
  }
});

// GET /api/instructors/:id/availability-range
router.get("/:id/availability-range", async (req, res) => {
  const instructorId = Number(req.params.id);
  const start = req.query.start;
  const days = Number(req.query.days) || 14;
  if (!start) {
    return res.status(400).json({ error: "start date required" });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    const results = [];
    for (let i = 0; i < days; i++) {
      const date = addDays(start, i);
      const slots = await getAvailableSlots(connection, instructorId, date);
      results.push({ date, slots });
    }
    res.json(results);
  } catch (err) {
    console.error("GET availability-range error:", err);
    res.status(500).json({ error: "Failed to load availability range" });
  } finally {
    if (connection) connection.release();
  }
});

// ===== GET INSTRUCTORS WORKING ON A SPECIFIC DATE =====

router.get("/by-date", async (req, res) => {
  const date = req.query.date;

  if (!date) {
    return res.status(400).json({ error: "date required" });
  }

  const weekday = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
  });

  let connection;

  try {
    connection = await pool.getConnection();

    const rows = await connection.query(
      `SELECT DISTINCT i.id, i.name, i.level, i.bio, i.price, i.photo
       FROM instructors i
       JOIN instructor_availability a
         ON i.id = a.instructor_id
       WHERE a.day_of_week = ?`,
      [weekday]
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load instructors by date" });

  } finally {
    if (connection) connection.release();
  }
});

// PATCH /api/instructors/:id - Update instructor details
router.patch("/:id", async (req, res) => {
  let connection;
  const instructorId = req.params.id;
  const { name, level, bio, price, email, photo } = req.body;
  try {
    connection = await pool.getConnection();
    const result = await connection.query(
      `UPDATE instructors SET name = ?, level = ?, bio = ?, price = ?, email = ?, photo = ? WHERE id = ?`,
      [name, level, bio, price, email, photo, instructorId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    res.json({ message: "Instructor updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update instructor" });
  } finally {
    if (connection) connection.release();
  }
});

// DELETE /api/instructors/:id - Delete instructor
router.delete("/:id", async (req, res) => {
  let connection;
  const instructorId = req.params.id;
  try {
    connection = await pool.getConnection();
    const result = await connection.query(
      `DELETE FROM instructors WHERE id = ?`,
      [instructorId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    res.json({ message: "Instructor deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete instructor" });
  } finally {
    if (connection) connection.release();
  }
});


module.exports = router;
