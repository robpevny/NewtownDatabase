const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'TD78Z.u',
  database: 'Newtown',
});

module.exports = pool;
