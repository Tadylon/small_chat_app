// Database configuration
const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'chat_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the pool
module.exports = pool.promise();