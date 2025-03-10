
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database configuration
const DB_CONFIG = {
  host: 'database-1.cluster-cnye4gmgu5x2.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'OLLI4RVKjgWdHVfc52b6',
  database: 'hrportal'
};

// Create connection pool
const pool = mysql.createPool({
  host: DB_CONFIG.host,
  user: DB_CONFIG.user,
  password: DB_CONFIG.password,
  database: DB_CONFIG.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(cors());
app.use(express.json());

// Test connection endpoint
app.get('/api/test-connection', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ success: true, message: 'Successfully connected to database' });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to connect to database: ${error.message}` 
    });
  }
});

// Run setup script endpoint
app.post('/api/run-setup-script', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Setup script
      const setupScript = `
        CREATE TABLE IF NOT EXISTS employees (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          position VARCHAR(100),
          department VARCHAR(100),
          email VARCHAR(255),
          phone VARCHAR(20),
          location VARCHAR(100),
          avatar VARCHAR(255),
          hireDate DATE,
          status ENUM('active', 'inactive', 'onleave') DEFAULT 'active',
          manager VARCHAR(100),
          salary DECIMAL(10, 2),
          bio TEXT
        );
        
        CREATE TABLE IF NOT EXISTS departments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          managerId INT,
          FOREIGN KEY (managerId) REFERENCES employees(id)
        );
      `;
      
      // Split by semicolons and execute each statement
      const statements = setupScript
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      for (const statement of statements) {
        await connection.execute(statement);
      }
      
      res.json({ 
        success: true, 
        message: 'Database setup script executed successfully' 
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

// Run mock data script endpoint
app.post('/api/run-mock-data-script', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Mock data script
      const mockDataScript = `
        INSERT IGNORE INTO employees (id, name, position, department, email, phone, location, avatar, hireDate, status, manager, salary, bio)
        VALUES
          (1, 'John Doe', 'Senior Software Engineer', 'Engineering', 'john.doe@company.com', '(555) 123-4567', 'San Francisco, CA', 'https://randomuser.me/api/portraits/men/32.jpg', '2019-03-15', 'active', 'Jane Smith', 120000, 'John is a senior developer with expertise in React and Node.js.'),
          (2, 'Jane Smith', 'Product Manager', 'Product', 'jane.smith@company.com', '(555) 987-6543', 'New York, NY', 'https://randomuser.me/api/portraits/women/44.jpg', '2018-07-10', 'active', 'Robert Johnson', 135000, 'Jane oversees product development and works closely with engineering and design teams.'),
          (3, 'Michael Chen', 'UX Designer', 'Design', 'michael.chen@company.com', '(555) 456-7890', 'Austin, TX', 'https://randomuser.me/api/portraits/men/67.jpg', '2020-01-20', 'active', 'Sarah Williams', 95000, 'Michael is passionate about creating intuitive user experiences and has a background in both graphic design and user research.');
          
        INSERT IGNORE INTO departments (id, name, description, managerId)
        VALUES
          (1, 'Engineering', 'Software development and infrastructure', 1),
          (2, 'Product', 'Product management and design', 2);
      `;
      
      // Split by semicolons and execute each statement
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

// Get database stats endpoint
app.get('/api/database-stats', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Get tables
      const [tables] = await connection.query('SHOW TABLES');
      const tableStats = [];
      
      // Parse the tables and get row counts
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        tableStats.push({
          name: tableName,
          rowCount: rows[0].count
        });
      }
      
      res.json({ 
        success: true, 
        tables: tableStats 
      });
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

