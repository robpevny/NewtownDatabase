const express = require("express");
const cors = require("cors");
const mariadb = require("mariadb");

// Connection pool
const pool = require("./config");

const app = express();

app.use(cors());
app.use(express.json());

// Helper functions
const { timeToMinutes, minutesToTime, SLOT_MINUTES } = require("./helpers");
const { getAvailableSlots } = require("./utils/availability");
const { addDays } = require("./helpers");


// Routes
const instructorsRouter = require("./routes/instructors");
const lessonsRouter = require("./routes/lessons");
const calendarRouter = require('./routes/calendar');


app.use("/api/instructors", instructorsRouter);
app.use("/api/lessons", lessonsRouter);
app.use("/api/calendar", calendarRouter);

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));