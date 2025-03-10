
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  host: 'database-1.cluster-cnye4gmgu5x2.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'OLLI4RVKjgWdHVfc52b6',
  database: 'hrportal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a pool for database connections
const pool = mysql.createPool(dbConfig);

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  try {
    // Attempt to get a connection from the pool
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    
    // Release the connection back to the pool
    connection.release();
    
    res.json({ success: true, message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(500).json({ success: false, message: `Connection failed: ${error.message}` });
  }
});

// Run database setup script
app.post('/api/run-setup-script', async (req, res) => {
  try {
    // Read the setup SQL file
    const setupSql = fs.readFileSync(path.join(__dirname, '../src/lib/sql/setup-database.sql'), 'utf8');
    
    // Split the SQL file by semicolons to get individual statements
    const statements = setupSql.split(';').filter(statement => statement.trim() !== '');
    
    // Get a connection from the pool
    const connection = await pool.getConnection();
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    
    // Release the connection back to the pool
    connection.release();
    
    res.json({ success: true, message: 'Database setup completed successfully' });
  } catch (error) {
    console.error('Database setup failed:', error.message);
    res.status(500).json({ success: false, message: `Setup failed: ${error.message}` });
  }
});

// Run mock data script
app.post('/api/run-mock-data-script', async (req, res) => {
  try {
    // Read the mock data SQL file
    const mockDataSql = fs.readFileSync(path.join(__dirname, '../src/lib/sql/insert-mock-data.sql'), 'utf8');
    
    // Split the SQL file by semicolons to get individual statements
    const statements = mockDataSql.split(';').filter(statement => statement.trim() !== '');
    
    // Get a connection from the pool
    const connection = await pool.getConnection();
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    
    // Release the connection back to the pool
    connection.release();
    
    res.json({ success: true, message: 'Mock data inserted successfully' });
  } catch (error) {
    console.error('Mock data insertion failed:', error.message);
    res.status(500).json({ success: false, message: `Mock data insertion failed: ${error.message}` });
  }
});

// Get database stats
app.get('/api/database-stats', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get list of tables
    const [tables] = await connection.query(`
      SELECT table_name AS name
      FROM information_schema.tables
      WHERE table_schema = ?
    `, [dbConfig.database]);
    
    // Get row count for each table
    const tablesWithCount = [];
    
    for (const table of tables) {
      const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM ${table.name}`);
      tablesWithCount.push({
        name: table.name,
        rowCount: rows[0].count
      });
    }
    
    connection.release();
    
    res.json({ success: true, tables: tablesWithCount });
  } catch (error) {
    console.error('Failed to get database stats:', error.message);
    res.status(500).json({ success: false, message: `Failed to get database stats: ${error.message}` });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
