// Helper functions and constants for time calculations


function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

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

const SLOT_MINUTES = 60;

module.exports = { timeToMinutes, minutesToTime, SLOT_MINUTES, addDays };
