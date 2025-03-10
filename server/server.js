
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

// Create database pool
let pool;
try {
  pool = mysql.createPool(dbConfig);
  console.log('Database pool created');
} catch (error) {
  console.error('Error creating database pool:', error);
}

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ success: true, message: 'Database connection established' });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to connect to database: ${error.message}` 
    });
  }
});

// Run setup script to create tables
app.post('/api/run-setup-script', async (req, res) => {
  try {
    const setupScriptPath = path.join(__dirname, '..', 'src', 'lib', 'sql', 'setup-database.sql');
    const setupScript = fs.readFileSync(setupScriptPath, 'utf8');
    
    const connection = await pool.getConnection();
    
    try {
      // Split the script by semicolons to execute multiple statements
      const statements = setupScript
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      for (const statement of statements) {
        await connection.execute(statement);
      }
      
      res.json({ 
        success: true, 
        message: 'Database tables created successfully' 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to run setup script:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to run setup script: ${error.message}` 
    });
  }
});

// Run mock data script
app.post('/api/run-mock-data-script', async (req, res) => {
  try {
    const mockDataScriptPath = path.join(__dirname, '..', 'src', 'lib', 'sql', 'insert-mock-data.sql');
    const mockDataScript = fs.readFileSync(mockDataScriptPath, 'utf8');
    
    const connection = await pool.getConnection();
    
    try {
      // Split the script by semicolons to execute multiple statements
      const statements = mockDataScript
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      for (const statement of statements) {
        await connection.execute(statement);
      }
      
      res.json({ 
        success: true, 
        message: 'Mock data inserted successfully' 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to run mock data script:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to run mock data script: ${error.message}` 
    });
  }
});

// Get database stats (tables and row counts)
app.get('/api/database-stats', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Get list of tables
      const [tables] = await connection.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
        [dbConfig.database]
      );
      
      const tableStats = [];
      
      // Get row count for each table
      for (const table of tables) {
        const tableName = table.TABLE_NAME || table.table_name;
        const [rows] = await connection.query(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );
        
        tableStats.push({
          name: tableName,
          rowCount: rows[0].count
        });
      }
      
      res.json({ tables: tableStats });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to get database stats:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to get database stats: ${error.message}`,
      tables: []
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
