require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const serialize = require('node-serialize');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));
app.use(express.json());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: 'hrportal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create database pool
let pool;
let dbInitialized = false;

// Initialize database connection
async function initializeDatabase() {
  try {
    // First create a connection without specifying a database
    const tempPool = mysql.createPool({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('Creating database if it does not exist...');
    await tempPool.query('CREATE DATABASE IF NOT EXISTS hrportal');
    console.log('Database hrportal created or already exists');
    
    // Now create the pool with the database specified
    pool = mysql.createPool(dbConfig);
    console.log('Database pool created with hrportal database');
    
    // Initialize tables
    await createTables();
    
    dbInitialized = true;
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Create tables function (simplified from original)
async function createTables() {
  const connection = await pool.getConnection();
  try {
    console.log('Creating tables if they do not exist...');
    
    // Create Employees table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        department VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20),
        location VARCHAR(100),
        avatar VARCHAR(255),
        hire_date DATE NOT NULL,
        status ENUM('active', 'onleave', 'terminated') NOT NULL DEFAULT 'active',
        manager VARCHAR(100),
        salary DECIMAL(10, 2),
        bio TEXT,
        metadata TEXT
      )
    `);
    
    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
        employee_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);
    
    // Create other necessary tables...
    console.log('Tables created successfully');
  } finally {
    connection.release();
  }
}

// ===== BACKEND API ROUTES =====

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database is still initializing, please try again in a moment' 
      });
    }
    
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

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('Login attempt received:', { username: req.body.username });
  
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // For development/testing - accept any credentials
    // In production, this should verify against the database
    const mockUser = {
      id: 1,
      username: username,
      email: `${username}@company.com`,
      role: 'admin'
    };

    res.json({
      success: true,
      user: mockUser,
      token: 'mock-jwt-token-' + Date.now()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    if (!dbInitialized) {
      // Return mock data if database not ready
      return res.json({
        success: true,
        data: []
      });
    }
    
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM employees');
      res.json({
        success: true,
        data: rows
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      data: []
    });
  }
});

// Get notifications
app.get('/api/notifications', async (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Get calendar events
app.get('/api/calendar-events', async (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Get documents
app.get('/api/documents', async (req, res) => {
  res.json({
    success: true,
    documents: []
  });
});

// Database stats
app.get('/api/database-stats', async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.json({ tables: [] });
    }
    
    const connection = await pool.getConnection();
    try {
      const [tables] = await connection.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
        ['hrportal']
      );
      
      const tableStats = [];
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
    res.json({ tables: [] });
  }
});

// ===== FRONTEND STATIC FILE SERVING =====

// Serve static files from dist directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Serve uploads directory
const uploadsDir = path.join(__dirname, 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Catch-all route for SPA - must be last
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(distPath, 'index.html'));
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Unified server running on port ${PORT}`);
      console.log(`Frontend: http://localhost:${PORT}`);
      console.log(`Backend API: http://localhost:${PORT}/api`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    // Start server anyway for frontend to work
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (database unavailable)`);
    });
  });

module.exports = app; 