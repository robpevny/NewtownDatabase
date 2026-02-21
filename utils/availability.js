// Utility to get available slots for an instructor on a given date
// Requires helpers: timeToMinutes, minutesToTime, SLOT_MINUTES

const { timeToMinutes, minutesToTime, SLOT_MINUTES } = require("../helpers");

async function getAvailableSlots(connection, instructorId, date) {
  const weekday = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
  });

  const ranges = await connection.query(
    `SELECT start_time, end_time
     FROM instructor_availability
     WHERE instructor_id = ?
     AND day_of_week = ?`,
    [instructorId, weekday],
  );

  const bookings = await connection.query(
    `SELECT time
     FROM lessons
     WHERE instructor_id = ?
     AND date = ?`,
    [instructorId, date],
  );

  const booked = new Set(bookings.map((b) => b.time));
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

  return [...new Set(available)].sort();
}

module.exports = { getAvailableSlots };
