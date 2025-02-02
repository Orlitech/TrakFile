const { Pool } = require('pg');

// Configuration for the PostgreSQL database
const pool = new Pool({
  user: 'postgres',        // Replace with your PostgreSQL username
  host: 'localhost',            // Replace with your PostgreSQL host
  database: 'bofmis',    // Replace with your database name
  password: 'mide',    // Replace with your PostgreSQL password
  port: 5432,                   // Default PostgreSQL port
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Connected to PostgreSQL database!');
    release(); // Release the client back to the pool
  }
});

// Export the pool for use in other parts of your application
module.exports = pool;
