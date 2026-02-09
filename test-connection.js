const pool = require('./config');

async function test() {
  let connection;

  try {
    connection = await pool.getConnection();
    console.log("Connected to MariaDB!");

    const rows = await connection.query("SELECT 1 as test");
    console.log(rows);

  } catch (err) {
    console.log("Connection failed");
    console.log(err);

  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

test();
