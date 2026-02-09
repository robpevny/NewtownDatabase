const express = require("express");
const cors = require("cors");
const mariadb = require("mariadb");

// --- CONNECTION POOL ---
const pool = require("./config");

const app = express();

app.use(cors());
app.use(express.json());


// ================= HELPERS =================

function timeToMinutes(t) {
  const parts = (t || "").split(":").map(Number);
  if (parts.length >= 2) return parts[0] * 60 + parts[1];
  return 0;
}

function minutesToTime(m) {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const SLOT_MINUTES = 60;


// =============== GET INSTRUCTORS ===============

app.get("/api/instructors", async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const rows = await connection.query(
      "SELECT id, name, level, bio, price, photo FROM instructors"
    );

    res.json(rows);

  } catch (err) {
    console.error("GET instructors error:", err);
    res.status(500).json({ error: err.message });

  } finally {
    if (connection) connection.release();
  }
});


// =============== WEEKLY AVAILABILITY ===============

app.get("/api/instructors/:id/weekly-availability", async (req, res) => {

  const instructorId = Number(req.params.id);
  let connection;

  try {
    connection = await pool.getConnection();

    const rows = await connection.query(
      `SELECT day_of_week, start_time, end_time
       FROM instructor_availability
       WHERE instructor_id = ?`,
      [instructorId]
    );

    res.json(rows);

  } catch (err) {
    console.error("GET weekly-availability error:", err);
    res.status(500).json({ error: "Failed to load weekly availability" });

  } finally {
    if (connection) connection.release();
  }
});


// =============== SINGLE DATE AVAILABILITY ===============

app.get("/api/instructors/:id/availability", async (req, res) => {

  const instructorId = Number(req.params.id);
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

    // Working hours
    const ranges = await connection.query(
      `SELECT start_time, end_time
       FROM instructor_availability
       WHERE instructor_id = ?
       AND day_of_week = ?`,
      [instructorId, weekday]
    );

    // Existing bookings
    const bookings = await connection.query(
      `SELECT time
       FROM lessons
       WHERE instructor_id = ?
       AND date = ?`,
      [instructorId, date]
    );

    const booked = new Set(bookings.map(b => b.time));

    let available = [];

    for (const r of ranges) {

      const startMin = timeToMinutes(r.start_time);
      const endMin = timeToMinutes(r.end_time);

      for (let s = startMin; s + SLOT_MINUTES <= endMin; s += SLOT_MINUTES) {

        const slot = minutesToTime(s);

        if (!booked.has(slot)) {
          available.push(slot);
        }
      }
    }

    available = [...new Set(available)].sort();

    res.json(available);

  } catch (err) {
    console.error("GET availability error:", err);
    res.status(500).json({ error: "Failed to load availability" });

  } finally {
    if (connection) connection.release();
  }
});


// =============== AVAILABILITY RANGE ===============

app.get("/api/instructors/:id/availability-range", async (req, res) => {

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

      const weekday = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
      });

      const ranges = await connection.query(
        `SELECT start_time, end_time
         FROM instructor_availability
         WHERE instructor_id = ?
         AND day_of_week = ?`,
        [instructorId, weekday]
      );

      const bookings = await connection.query(
        `SELECT time
         FROM lessons
         WHERE instructor_id = ?
         AND date = ?`,
        [instructorId, date]
      );

      const booked = new Set(bookings.map(b => b.time));

      let available = [];

      for (const r of ranges) {

        const startMin = timeToMinutes(r.start_time);
        const endMin = timeToMinutes(r.end_time);

        for (let s = startMin; s + SLOT_MINUTES <= endMin; s += SLOT_MINUTES) {

          const slot = minutesToTime(s);

          if (!booked.has(slot)) {
            available.push(slot);
          }
        }
      }

      results.push({
        date,
        slots: [...new Set(available)].sort()
      });
    }

    res.json(results);

  } catch (err) {
    console.error("GET availability-range error:", err);
    res.status(500).json({ error: "Failed to load availability range" });

  } finally {
    if (connection) connection.release();
  }
});


// =============== SAVE LESSON ===============

app.post("/api/lessons", async (req, res) => {

  const b = req.body;
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.query(
      `INSERT INTO lessons
       (instructor_id, date, time, name, email, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [b.instructorId, b.date, b.time, b.name, b.email, b.phone]
    );

    res.json({ message: "Booking saved successfully" });

  } catch (err) {
    console.error("POST lessons error:", err);
    res.status(500).json({ error: "Failed to save booking" });

  } finally {
    if (connection) connection.release();
  }
});


// =============== START SERVER ===============

app.listen(3000, () =>
  console.log("Backend running on http://localhost:3000")
);
