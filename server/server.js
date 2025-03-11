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
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:80', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from the uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Database configuration
const dbConfig = {
  host: 'database-1.cluster-cnye4gmgu5x2.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'OLLI4RVKjgWdHVfc52b6',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create database pool without specifying a database
let pool;
let dbInitialized = false;

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
    
    console.log('Attempting to create database if it does not exist...');
    
    // Create the database if it doesn't exist
    await tempPool.query('CREATE DATABASE IF NOT EXISTS hrportal');
    console.log('Database hrportal created or already exists');
    
    // Now create the pool with the database specified
    pool = mysql.createPool({
      ...dbConfig,
      database: 'hrportal'
    });
    console.log('Database pool created with hrportal database');
    
    // Create tables
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
          bio TEXT
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
      
      // Create Notifications table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // Read the setup script
      const setupScriptPath = path.join(__dirname, '..', 'src', 'lib', 'sql', 'setup-database.sql');
      const setupScript = fs.readFileSync(setupScriptPath, 'utf8');
      
      // Split the script by semicolons to execute multiple statements
      const statements = setupScript
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      // Execute each statement
      for (const statement of statements) {
        try {
          await connection.execute(statement);
        } catch (error) {
          console.error(`Error executing statement: ${statement.substring(0, 50)}...`, error.message);
          // Continue with other statements even if one fails
        }
      }
      
      console.log('Tables created successfully');
      
      // Verify that the calendar_events table exists
      try {
        await connection.execute('SELECT 1 FROM calendar_events LIMIT 1');
        console.log('Calendar events table exists');
      } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.error('Calendar events table does not exist, creating it now...');
          
          // Create the calendar_events table explicitly
          await connection.execute(`
            CREATE TABLE IF NOT EXISTS calendar_events (
              id INT PRIMARY KEY AUTO_INCREMENT,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              start_date DATETIME NOT NULL,
              end_date DATETIME NOT NULL,
              location VARCHAR(255),
              event_type ENUM('meeting', 'holiday', 'training', 'conference', 'other') NOT NULL DEFAULT 'other',
              created_by INT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL
            )
          `);
          
          console.log('Calendar events table created successfully');
        } else {
          console.error('Error checking calendar_events table:', error);
        }
      }
      
      dbInitialized = true;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize database on startup
initializeDatabase()
  .then(() => {
    console.log('Database initialization complete');
    
    // Start the server after database is initialized
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
  });

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
    // First, ensure all tables are created by running the setup script
    const setupScriptPath = path.join(__dirname, '..', 'src', 'lib', 'sql', 'setup-database.sql');
    const setupScript = fs.readFileSync(setupScriptPath, 'utf8');
    
    const connection = await pool.getConnection();
    
    try {
      // Run setup script first to ensure all tables exist
      console.log('Ensuring all tables exist before inserting mock data...');
      const setupStatements = setupScript
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      for (const statement of setupStatements) {
        await connection.execute(statement);
      }
      
      // Now run the mock data script
      console.log('Running mock data script...');
      const mockDataScriptPath = path.join(__dirname, '..', 'src', 'lib', 'sql', 'insert-mock-data.sql');
      const mockDataScript = fs.readFileSync(mockDataScriptPath, 'utf8');
      
      // Split the script by semicolons to execute multiple statements
      const mockDataStatements = mockDataScript
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      for (const statement of mockDataStatements) {
        try {
          await connection.execute(statement);
        } catch (statementError) {
          console.warn(`Warning: Error executing statement: ${statementError.message}`);
          console.warn('Continuing with next statement...');
        }
      }
      
      // Add mock notifications
      try {
        console.log('Adding mock notifications...');
        
        // First, check if we have any users
        const [users] = await connection.query('SELECT id FROM users LIMIT 5');
        
        if (users.length > 0) {
          // Add some mock notifications for each user
          for (const user of users) {
            await connection.query(`
              INSERT INTO notifications (user_id, message, is_read, created_at)
              VALUES 
                (?, 'Welcome to HRGoat! Get started by completing your profile.', false, NOW()),
                (?, 'New document has been shared with you.', false, NOW()),
                (?, 'Your vacation request has been approved.', true, DATE_SUB(NOW(), INTERVAL 2 DAY))
            `, [user.id, user.id, user.id]);
          }
          
          console.log('Mock notifications added successfully');
        }
      } catch (error) {
        console.error('Error adding mock notifications:', error);
        // Continue with other mock data even if notifications fail
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

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('\n[AUTH-BACKEND] Login attempt received:', { 
    username: req.body.username,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('[AUTH-BACKEND] Login failed: Missing username or password');
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const connection = await pool.getConnection();

    try {
      // VULNERABLE QUERY: Directly inserting user input into SQL
      const query = `SELECT id, username, email, role, employee_id FROM users WHERE username = '${username}' AND password_hash = '${password}'`;
      
      console.log('[AUTH-BACKEND] Executing query:', query); // Log the query for demonstration

      const [users] = await connection.query(query);
      console.log('[AUTH-BACKEND] Query result:', users);

      if (users.length === 0) {
        console.log('[AUTH-BACKEND] Login failed: Invalid username or password');
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      const user = users[0];
      console.log('[AUTH-BACKEND] User authenticated:', { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      });

      // Update last login timestamp (still vulnerable)
      const updateQuery = `UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;
      await connection.query(updateQuery);
      console.log('[AUTH-BACKEND] Updated last login timestamp for user:', user.id);

      // Return user data (excluding password)
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id
      };

      console.log('[AUTH-BACKEND] Login successful:', { 
        userId: userData.id, 
        username: userData.username, 
        role: userData.role 
      });

      res.json({
        success: true,
        message: 'Login successful',
        user: userData
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[AUTH-BACKEND] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});



// Authentication middleware
const authenticateUser = async (req, res, next) => {
  console.log('\n[AUTH-BACKEND] Authentication middleware called:', {
    path: req.path,
    method: req.method,
    userId: req.headers['user-id'] || req.query.userId || 'not provided',
    timestamp: new Date().toISOString()
  });
  
  // For demo purposes, we'll use a simple approach
  // In a real application, you would verify a JWT token here
  
  // Get the user ID from the request headers or query parameters
  const userId = req.headers['user-id'] || req.query.userId;
  
  if (!userId) {
    console.log('[AUTH-BACKEND] Authentication failed: No user ID provided');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const connection = await pool.getConnection();
    try {
      console.log('[AUTH-BACKEND] Looking up user with ID:', userId);
      const [users] = await connection.query('SELECT id, username, email, role FROM users WHERE id = ?', [userId]);
      
      if (users.length === 0) {
        console.log('[AUTH-BACKEND] Authentication failed: Invalid user ID');
        return res.status(401).json({ message: 'Invalid user' });
      }
      
      // Attach the user to the request object
      req.user = users[0];
      console.log('[AUTH-BACKEND] Authentication successful:', { 
        userId: req.user.id, 
        username: req.user.username, 
        role: req.user.role 
      });
      next();
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[AUTH-BACKEND] Authentication error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Profile endpoint
app.get('/api/profile', authenticateUser, async (req, res) => {
  console.log('\n[AUTH-BACKEND] Profile request for user:', {
    userId: req.user.id,
    username: req.user.username,
    timestamp: new Date().toISOString()
  });
  
  try {
    res.json(req.user);
    console.log('[AUTH-BACKEND] Profile data sent successfully');
  } catch (error) {
    console.error('[AUTH-BACKEND] Profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  console.log('\n[AUTH-BACKEND] Logout request received:', {
    userId: req.headers['user-id'] || 'unknown',
    timestamp: new Date().toISOString()
  });
  
  res.clearCookie('token'); // Assuming JWT stored in cookie
  console.log('[AUTH-BACKEND] Token cookie cleared');
  
  res.json({ message: 'Logged out successfully' });
  console.log('[AUTH-BACKEND] Logout successful');
});

// Notifications endpoints
app.get('/api/notifications', authenticateUser, async (req, res) => {
  try {
    const [notifications] = await pool.query('SELECT * FROM notifications WHERE user_id = ?', [req.user.id]);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notifications/:id', authenticateUser, async (req, res) => {
  const notificationId = req.params.id;
  try {
    await pool.query('UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?', [notificationId, req.user.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/notifications/:id', authenticateUser, async (req, res) => {
  const notificationId = req.params.id;
  try {
    await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [notificationId, req.user.id]);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// Create upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
  fileFilter: function (req, file, cb) {
    // Accept all file types for now
    cb(null, true);
  }
});

// Get all documents
app.get('/api/documents', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      const [documents] = await connection.query(
        `SELECT d.*, e.name as employee_name 
         FROM documents d
         LEFT JOIN employees e ON d.employee_id = e.id
         ORDER BY d.upload_date DESC`
      );
      
      // Transform the documents to match the client-side Document interface
      const transformedDocuments = documents.map(doc => ({
        id: doc.id,
        employeeId: doc.employee_id,
        documentType: doc.document_type,
        fileName: doc.file_name,
        originalName: doc.original_name,
        filePath: doc.file_path,
        fileUrl: `/uploads/${doc.file_name}`,
        fileSize: doc.file_size,
        mimeType: doc.mime_type,
        description: doc.description,
        uploadDate: doc.upload_date,
        employeeName: doc.employee_name
      }));
      
      res.json({ documents: transformedDocuments });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to get documents:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to get documents: ${error.message}` 
    });
  }
});

// Get documents by employee ID
app.get('/api/documents/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [documents] = await connection.query(
        `SELECT * FROM documents WHERE employee_id = ? ORDER BY upload_date DESC`,
        [employeeId]
      );
      
      // Transform the documents to match the client-side Document interface
      const transformedDocuments = documents.map(doc => ({
        id: doc.id,
        employeeId: doc.employee_id,
        documentType: doc.document_type,
        fileName: doc.file_name,
        originalName: doc.original_name,
        filePath: doc.file_path,
        fileUrl: `/uploads/${doc.file_name}`,
        fileSize: doc.file_size,
        mimeType: doc.mime_type,
        description: doc.description,
        uploadDate: doc.upload_date
      }));
      
      res.json({ documents: transformedDocuments });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to get employee documents:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to get employee documents: ${error.message}` 
    });
  }
});

// Upload document
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    const { 
      employeeId, 
      documentType, 
      description 
    } = req.body;
    
    // Get the relative file path for storage in the database
    const relativePath = path.relative(__dirname, req.file.path).replace(/\\/g, '/');
    
    const connection = await pool.getConnection();
    
    try {
      // Create documents table if it doesn't exist
      await connection.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id INT PRIMARY KEY AUTO_INCREMENT,
          employee_id INT,
          document_type VARCHAR(50) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(255) NOT NULL,
          file_size INT NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          description TEXT,
          upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
        )
      `);
      
      // Insert document record
      const [result] = await connection.execute(
        `INSERT INTO documents 
         (employee_id, document_type, file_name, original_name, file_path, file_size, mime_type, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeId || null,
          documentType,
          req.file.filename,
          req.file.originalname,
          relativePath,
          req.file.size,
          req.file.mimetype,
          description || null
        ]
      );
      
      // Construct the download URL
      const fileUrl = `/uploads/${req.file.filename}`;
      
      // Get the current timestamp
      const uploadDate = new Date();
      
      // Log the document data for debugging
      console.log('Document uploaded:', {
        id: result.insertId,
        employeeId: employeeId || null,
        documentType: documentType,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: relativePath,
        fileUrl: fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        description: description || '',
        uploadDate: uploadDate
      });
      
      res.json({ 
        success: true, 
        message: 'Document uploaded successfully',
        document: {
          id: result.insertId,
          employeeId: employeeId || null,
          documentType: documentType,
          fileName: req.file.filename,
          originalName: req.file.originalname,
          filePath: relativePath,
          fileUrl: fileUrl,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          description: description || '',
          uploadDate: uploadDate.toISOString()
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to upload document:', error);
    // Delete the uploaded file if database operation fails
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: `Failed to upload document: ${error.message}` 
    });
  }
});

// Download document
app.get('/api/documents/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [documents] = await connection.query(
        'SELECT * FROM documents WHERE id = ?',
        [id]
      );
      
      if (documents.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Document not found' 
        });
      }
      
      const document = documents[0];
      
      // Construct the full file path
      const filePath = path.join(__dirname, document.file_path);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          success: false, 
          message: 'Document file not found on server' 
        });
      }
      
      // Set the appropriate content type
      res.setHeader('Content-Type', document.mime_type);
      
      // Set content disposition to attachment with the original filename
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.original_name)}"`);
      
      // Stream the file to the response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to download document:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to download document: ${error.message}` 
    });
  }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Get document info first
      const [documents] = await connection.query(
        'SELECT * FROM documents WHERE id = ?',
        [id]
      );
      
      if (documents.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Document not found' 
        });
      }
      
      const document = documents[0];
      
      // Delete from database
      await connection.execute(
        'DELETE FROM documents WHERE id = ?',
        [id]
      );
      
      // Delete file from disk
      if (document.file_path && fs.existsSync(document.file_path)) {
        fs.unlinkSync(document.file_path);
      }
      
      res.json({ 
        success: true, 
        message: 'Document deleted successfully' 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to delete document:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to delete document: ${error.message}` 
    });
  }
});

// Bank Account Endpoints
// Get all bank accounts for an employee
app.get('/api/bank-accounts/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [accounts] = await connection.execute(
        `SELECT * FROM bank_accounts WHERE employee_id = ? ORDER BY is_primary DESC, id ASC`,
        [employeeId]
      );
      
      // Convert snake_case to camelCase for frontend
      const formattedAccounts = accounts.map(account => ({
        id: account.id,
        employeeId: account.employee_id,
        accountType: account.account_type,
        bankName: account.bank_name,
        accountNumber: account.account_number,
        routingNumber: account.routing_number,
        isPrimary: Boolean(account.is_primary),
        createdAt: account.created_at,
        updatedAt: account.updated_at
      }));
      
      res.json({ 
        success: true, 
        data: formattedAccounts 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to get bank accounts:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to get bank accounts: ${error.message}` 
    });
  }
});

// Add a new bank account
app.post('/api/bank-accounts', async (req, res) => {
  try {
    const { 
      employeeId, 
      accountType, 
      bankName, 
      accountNumber, 
      routingNumber, 
      isPrimary 
    } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      // If this is the primary account, update all other accounts to not be primary
      if (isPrimary) {
        await connection.execute(
          `UPDATE bank_accounts SET is_primary = FALSE WHERE employee_id = ?`,
          [employeeId]
        );
      }
      
      // Insert the new account
      const [result] = await connection.execute(
        `INSERT INTO bank_accounts 
         (employee_id, account_type, bank_name, account_number, routing_number, is_primary) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [employeeId, accountType, bankName, accountNumber, routingNumber, isPrimary]
      );
      
      // Get the newly created account
      const [accounts] = await connection.execute(
        `SELECT * FROM bank_accounts WHERE id = ?`,
        [result.insertId]
      );
      
      const account = accounts[0];
      
      // Format for frontend
      const formattedAccount = {
        id: account.id,
        employeeId: account.employee_id,
        accountType: account.account_type,
        bankName: account.bank_name,
        accountNumber: account.account_number,
        routingNumber: account.routing_number,
        isPrimary: Boolean(account.is_primary),
        createdAt: account.created_at,
        updatedAt: account.updated_at
      };
      
      res.status(201).json({ 
        success: true, 
        data: formattedAccount 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to add bank account:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to add bank account: ${error.message}` 
    });
  }
});

// Update a bank account
app.put('/api/bank-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      accountType, 
      bankName, 
      accountNumber, 
      routingNumber, 
      isPrimary 
    } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      // Get the account to check employee_id
      const [accounts] = await connection.execute(
        `SELECT * FROM bank_accounts WHERE id = ?`,
        [id]
      );
      
      if (accounts.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Bank account not found' 
        });
      }
      
      const employeeId = accounts[0].employee_id;
      
      // If setting as primary, update all other accounts
      if (isPrimary) {
        await connection.execute(
          `UPDATE bank_accounts SET is_primary = FALSE WHERE employee_id = ?`,
          [employeeId]
        );
      }
      
      // Update the account
      await connection.execute(
        `UPDATE bank_accounts 
         SET account_type = ?, bank_name = ?, account_number = ?, 
             routing_number = ?, is_primary = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [accountType, bankName, accountNumber, routingNumber, isPrimary, id]
      );
      
      // Get the updated account
      const [updatedAccounts] = await connection.execute(
        `SELECT * FROM bank_accounts WHERE id = ?`,
        [id]
      );
      
      const account = updatedAccounts[0];
      
      // Format for frontend
      const formattedAccount = {
        id: account.id,
        employeeId: account.employee_id,
        accountType: account.account_type,
        bankName: account.bank_name,
        accountNumber: account.account_number,
        routingNumber: account.routing_number,
        isPrimary: Boolean(account.is_primary),
        createdAt: account.created_at,
        updatedAt: account.updated_at
      };
      
      res.json({ 
        success: true, 
        data: formattedAccount 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to update bank account:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to update bank account: ${error.message}` 
    });
  }
});

// Delete a bank account
app.delete('/api/bank-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Check if account exists
      const [accounts] = await connection.execute(
        `SELECT * FROM bank_accounts WHERE id = ?`,
        [id]
      );
      
      if (accounts.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Bank account not found' 
        });
      }
      
      // Delete the account
      await connection.execute(
        `DELETE FROM bank_accounts WHERE id = ?`,
        [id]
      );
      
      res.json({ 
        success: true, 
        message: 'Bank account deleted successfully' 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to delete bank account:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to delete bank account: ${error.message}` 
    });
  }
});

// Employee Endpoints
// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      const [employees] = await connection.execute(
        `SELECT * FROM employees ORDER BY name ASC`
      );
      
      // Format dates and convert snake_case to camelCase
      const formattedEmployees = employees.map(employee => ({
        id: employee.id,
        name: employee.name,
        position: employee.position,
        department: employee.department,
        email: employee.email,
        phone: employee.phone || '',
        location: employee.location || '',
        avatar: employee.avatar || '',
        hireDate: employee.hire_date,
        status: employee.status,
        manager: employee.manager || '',
        salary: employee.salary || 0,
        bio: employee.bio || ''
      }));
      
      res.json({ 
        success: true, 
        data: formattedEmployees 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to get employees:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to get employees: ${error.message}` 
    });
  }
});

// Get employee by ID
app.get('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [employees] = await connection.execute(
        `SELECT * FROM employees WHERE id = ?`,
        [id]
      );
      
      if (employees.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found' 
        });
      }
      
      const employee = employees[0];
      
      // Format dates and convert snake_case to camelCase
      const formattedEmployee = {
        id: employee.id,
        name: employee.name,
        position: employee.position,
        department: employee.department,
        email: employee.email,
        phone: employee.phone || '',
        location: employee.location || '',
        avatar: employee.avatar || '',
        hireDate: employee.hire_date,
        status: employee.status,
        manager: employee.manager || '',
        salary: employee.salary || 0,
        bio: employee.bio || ''
      };
      
      res.json({ 
        success: true, 
        data: formattedEmployee 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to get employee:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to get employee: ${error.message}` 
    });
  }
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      position,
      department,
      email,
      phone,
      location,
      avatar,
      status,
      manager,
      salary,
      bio
    } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      // Check if employee exists
      const [employees] = await connection.execute(
        `SELECT * FROM employees WHERE id = ?`,
        [id]
      );
      
      if (employees.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found' 
        });
      }
      
      // Update the employee
      await connection.execute(
        `UPDATE employees 
         SET name = ?, position = ?, department = ?, email = ?, 
             phone = ?, location = ?, avatar = ?, status = ?, 
             manager = ?, salary = ?, bio = ?
         WHERE id = ?`,
        [
          name,
          position,
          department,
          email,
          phone || null,
          location || null,
          avatar || null,
          status,
          manager || null,
          salary || null,
          bio || null,
          id
        ]
      );
      
      // Get the updated employee
      const [updatedEmployees] = await connection.execute(
        `SELECT * FROM employees WHERE id = ?`,
        [id]
      );
      
      const employee = updatedEmployees[0];
      
      // Format dates and convert snake_case to camelCase
      const formattedEmployee = {
        id: employee.id,
        name: employee.name,
        position: employee.position,
        department: employee.department,
        email: employee.email,
        phone: employee.phone || '',
        location: employee.location || '',
        avatar: employee.avatar || '',
        hireDate: employee.hire_date,
        status: employee.status,
        manager: employee.manager || '',
        salary: employee.salary || 0,
        bio: employee.bio || ''
      };
      
      res.json({ 
        success: true, 
        data: formattedEmployee 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to update employee:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to update employee: ${error.message}` 
    });
  }
});

// Helper function to ensure the calendar_events table exists
async function ensureCalendarEventsTable(connection) {
  try {
    // Check if the table exists
    try {
      await connection.execute('SELECT 1 FROM calendar_events LIMIT 1');
      return true; // Table exists
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('Creating calendar_events table...');
        
        // Create the table
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS calendar_events (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            location VARCHAR(255),
            event_type ENUM('meeting', 'holiday', 'training', 'conference', 'other') NOT NULL DEFAULT 'other',
            created_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL
          )
        `);
        
        // Check if there are any employees in the database
        const [employees] = await connection.execute('SELECT id FROM employees LIMIT 5');
        
        // If no employees exist, create a default employee
        if (employees.length === 0) {
          console.log('No employees found. Creating a default employee for calendar events...');
          await connection.execute(`
            INSERT INTO employees (name, position, department, email, phone, location, hire_date, status, manager, salary, bio)
            VALUES ('System Admin', 'Administrator', 'IT', 'admin@hrgoat.com', '555-0000', 'Headquarters', CURDATE(), 'active', 'N/A', 0, 'System administrator account')
          `);
          
          // Get the ID of the newly created employee
          const [newEmployees] = await connection.execute('SELECT id FROM employees ORDER BY id ASC LIMIT 1');
          employees.push(newEmployees[0]);
        }
        
        // Get current date for reference
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // Use the first employee ID as a fallback
        const defaultEmployeeId = employees[0].id;
        
        // Insert sample data with current dates and valid employee IDs
        await connection.execute(`
          INSERT INTO calendar_events (title, description, start_date, end_date, location, event_type, created_by)
          VALUES 
            ('Quarterly Review Meeting', 'Review of Q3 performance and goals', '${currentYear}-${currentMonth+1}-15 10:00:00', '${currentYear}-${currentMonth+1}-15 12:00:00', 'Conference Room A', 'meeting', ${defaultEmployeeId}),
            ('Company Picnic', 'Annual company picnic at Central Park', '${currentYear}-${currentMonth+1}-22 12:00:00', '${currentYear}-${currentMonth+1}-22 16:00:00', 'Central Park', 'other', ${defaultEmployeeId}),
            ('New Product Training', 'Training session for the new product launch', '${currentYear}-${currentMonth+1}-18 09:00:00', '${currentYear}-${currentMonth+1}-19 17:00:00', 'Training Center', 'training', ${defaultEmployeeId}),
            ('Team Building Workshop', 'Interactive workshop to improve team collaboration', '${currentYear}-${currentMonth+1}-25 13:00:00', '${currentYear}-${currentMonth+1}-25 17:00:00', 'Conference Room B', 'training', ${defaultEmployeeId}),
            ('Annual Performance Reviews', 'Schedule for annual performance evaluations', '${currentYear}-${currentMonth+2}-05 09:00:00', '${currentYear}-${currentMonth+2}-09 17:00:00', 'HR Office', 'meeting', ${defaultEmployeeId}),
            ('Tech Conference', 'Annual technology conference', '${currentYear}-${currentMonth+2}-15 08:00:00', '${currentYear}-${currentMonth+2}-17 18:00:00', 'Convention Center', 'conference', ${defaultEmployeeId}),
            ('Holiday Party', 'Annual company holiday celebration', '${currentYear}-12-15 18:00:00', '${currentYear}-12-15 22:00:00', 'Grand Ballroom', 'other', ${defaultEmployeeId}),
            ('New Year Planning', 'Strategic planning session for the upcoming year', '${currentYear}-12-20 09:00:00', '${currentYear}-12-20 16:00:00', 'Executive Boardroom', 'meeting', ${defaultEmployeeId}),
            ('Product Launch', 'Official launch of our new product line', '${currentYear}-${currentMonth+2}-28 10:00:00', '${currentYear}-${currentMonth+2}-28 14:00:00', 'Main Auditorium', 'other', ${defaultEmployeeId}),
            ('Wellness Day', 'Company-wide wellness activities and health screenings', '${currentYear}-${currentMonth+1}-30 09:00:00', '${currentYear}-${currentMonth+1}-30 17:00:00', 'Company Campus', 'other', ${defaultEmployeeId})
          `);
        
        console.log('Sample calendar events inserted successfully');
        return true;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error ensuring calendar_events table:', error);
    throw error;
  }
}

// Calendar Events API
app.get('/api/calendar-events', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      await ensureCalendarEventsTable(connection);
      
      // Get all calendar events
      const [events] = await connection.execute(`
        SELECT 
          ce.*,
          e.name as creator_name
        FROM calendar_events ce
        LEFT JOIN employees e ON ce.created_by = e.id
        ORDER BY ce.start_date ASC
      `);
      
      // Format dates and convert snake_case to camelCase
      const formattedEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location || '',
        eventType: event.event_type,
        createdBy: event.created_by,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        creatorName: event.creator_name || 'System'
      }));
      
      res.json({ data: formattedEvents, error: null });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ data: null, error: 'Failed to fetch calendar events' });
  }
});

// Get calendar event by ID
app.get('/api/calendar-events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [events] = await connection.execute(
        `SELECT ce.*, e.name as creator_name 
         FROM calendar_events ce
         LEFT JOIN employees e ON ce.created_by = e.id
         WHERE ce.id = ?`,
        [id]
      );
      
      if (events.length === 0) {
        return res.status(404).json({ 
          data: null,
          error: 'Calendar event not found' 
        });
      }
      
      const event = events[0];
      
      // Format dates and convert snake_case to camelCase
      const formattedEvent = {
        id: event.id,
        title: event.title,
        description: event.description || '',
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location || '',
        eventType: event.event_type,
        createdBy: event.created_by,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        creatorName: event.creator_name || 'System'
      };
      
      res.json({ 
        data: formattedEvent,
        error: null
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    res.status(500).json({ 
      data: null,
      error: `Failed to fetch calendar event: ${error.message}` 
    });
  }
});

// Create a new calendar event
app.post('/api/calendar-events', async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      eventType,
      createdBy
    } = req.body;
    
    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        data: null,
        error: 'Title, start date, and end date are required'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Ensure the calendar_events table exists
      await ensureCalendarEventsTable(connection);
      
      // Validate date formats
      try {
        new Date(startDate);
        new Date(endDate);
      } catch (error) {
        return res.status(400).json({
          data: null,
          error: 'Invalid date format. Please use ISO format (YYYY-MM-DDTHH:MM:SS.sssZ)'
        });
      }
      
      // Insert the new event
      const [result] = await connection.execute(
        `INSERT INTO calendar_events 
         (title, description, start_date, end_date, location, event_type, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description || null,
          startDate,
          endDate,
          location || null,
          eventType || 'other',
          createdBy || null
        ]
      );
      
      // Get the newly created event
      const [events] = await connection.execute(
        `SELECT ce.*, e.name as creator_name 
         FROM calendar_events ce
         LEFT JOIN employees e ON ce.created_by = e.id
         WHERE ce.id = ?`,
        [result.insertId]
      );
      
      const event = events[0];
      
      // Format dates and convert snake_case to camelCase
      const formattedEvent = {
        id: event.id,
        title: event.title,
        description: event.description || '',
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location || '',
        eventType: event.event_type,
        createdBy: event.created_by,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        creatorName: event.creator_name || 'System'
      };
      
      res.status(201).json({ 
        data: formattedEvent,
        error: null
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ 
      data: null,
      error: `Failed to create calendar event: ${error.message}` 
    });
  }
});

// Update a calendar event
app.put('/api/calendar-events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      eventType
    } = req.body;
    
    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        data: null,
        error: 'Title, start date, and end date are required'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Check if event exists
      const [events] = await connection.execute(
        `SELECT * FROM calendar_events WHERE id = ?`,
        [id]
      );
      
      if (events.length === 0) {
        return res.status(404).json({ 
          data: null,
          error: 'Calendar event not found' 
        });
      }
      
      // Validate date formats
      try {
        new Date(startDate);
        new Date(endDate);
      } catch (error) {
        return res.status(400).json({
          data: null,
          error: 'Invalid date format. Please use ISO format (YYYY-MM-DDTHH:MM:SS.sssZ)'
        });
      }
      
      // Update the event
      await connection.execute(
        `UPDATE calendar_events 
         SET title = ?, description = ?, start_date = ?, end_date = ?, location = ?, event_type = ?
         WHERE id = ?`,
        [
          title,
          description || null,
          startDate,
          endDate,
          location || null,
          eventType || 'other',
          id
        ]
      );
      
      // Get the updated event
      const [updatedEvents] = await connection.execute(
        `SELECT ce.*, e.name as creator_name 
         FROM calendar_events ce
         LEFT JOIN employees e ON ce.created_by = e.id
         WHERE ce.id = ?`,
        [id]
      );
      
      const event = updatedEvents[0];
      
      // Format dates and convert snake_case to camelCase
      const formattedEvent = {
        id: event.id,
        title: event.title,
        description: event.description || '',
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location || '',
        eventType: event.event_type,
        createdBy: event.created_by,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        creatorName: event.creator_name || 'System'
      };
      
      res.json({ 
        data: formattedEvent,
        error: null
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ 
      data: null,
      error: `Failed to update calendar event: ${error.message}` 
    });
  }
});

// Delete a calendar event
app.delete('/api/calendar-events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Check if event exists
      const [events] = await connection.execute(
        `SELECT * FROM calendar_events WHERE id = ?`,
        [id]
      );
      
      if (events.length === 0) {
        return res.status(404).json({ 
          data: null,
          error: 'Calendar event not found' 
        });
      }
      
      // Delete the event
      await connection.execute(
        `DELETE FROM calendar_events WHERE id = ?`,
        [id]
      );
      
      res.json({ 
        data: true,
        error: null
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ 
      data: null,
      error: `Failed to delete calendar event: ${error.message}` 
    });
  }
});

// Add a new endpoint to reset calendar events with fresh mock data
app.post('/api/reset-calendar-events', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      // Drop the existing table
      await connection.execute('DROP TABLE IF EXISTS calendar_events');
      console.log('Calendar events table dropped');
      
      // Recreate the table with fresh mock data
      const success = await ensureCalendarEventsTable(connection);
      
      if (success) {
        res.json({ 
          data: { success: true, message: 'Calendar events reset successfully' }, 
          error: null 
        });
      } else {
        throw new Error('Failed to recreate calendar events table');
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error resetting calendar events:', error);
    res.status(500).json({ 
      data: null, 
      error: 'Failed to reset calendar events: ' + error.message 
    });
  }
});

// VULNERABLE ENDPOINT - DO NOT USE IN PRODUCTION
// This endpoint is intentionally vulnerable to SSRF and potential RCE
// FOR EDUCATIONAL PURPOSES ONLY
app.post('/api/system/fetch-resource', async (req, res) => {
  try {
    const { url, command } = req.body;
    
    console.log('Received request to fetch resource:', { url, command });
    
    if (url) {
      // VULNERABLE: No validation of URL - allows internal network scanning and SSRF
      const http = require('http');
      const https = require('https');
      
      // Determine which protocol to use
      const client = url.startsWith('https') ? https : http;
      
      // Make the request without any validation
      const request = client.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          res.json({
            success: true,
            data: data,
            status: response.statusCode,
            headers: response.headers
          });
        });
      });
      
      request.on('error', (error) => {
        res.status(500).json({
          success: false,
          message: `Error fetching resource: ${error.message}`
        });
      });
      
      request.end();
    } else if (command) {
      // EXTREMELY VULNERABLE: Allows direct command execution
      // This is a severe security risk - NEVER do this in production
      const { exec } = require('child_process');
      
      // Execute the command without any validation or sanitization
      exec(command, (error, stdout, stderr) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: `Command execution failed: ${error.message}`,
            stderr: stderr
          });
          return;
        }
        
        res.json({
          success: true,
          stdout: stdout,
          stderr: stderr
        });
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Either url or command parameter is required'
      });
    }
  } catch (error) {
    console.error('Error in fetch-resource endpoint:', error);
    res.status(500).json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

// Bulk Employee Upload endpoint with intentional vulnerability
app.post('/api/employees/bulk-upload', async (req, res) => {
  try {
    if (!req.body.data) {
      return res.status(400).json({ 
        success: false, 
        message: 'No data provided for upload' 
      });
    }
    
    let employeesData;
    
    try {
      // Parse the JSON data if it's a string
      if (typeof req.body.data === 'string') {
        employeesData = JSON.parse(req.body.data);
      } else {
        employeesData = req.body.data;
      }
      
      // Ensure we have an array of employees
      if (!Array.isArray(employeesData)) {
        employeesData = [employeesData];
      }
    } catch (parseError) {
      console.error('Error parsing employee data:', parseError);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON data format' 
      });
    }
    
    console.log(`Processing ${employeesData.length} employees for bulk upload`);
    
    // Get database connection
    const connection = await pool.getConnection();
    
    try {
      let insertedCount = 0;
      let errors = [];
      
      // Process each employee
      for (const employee of employeesData) {
        try {
          // VULNERABLE CODE: Insecure deserialization
          // This is intentionally vulnerable for educational purposes
          if (employee.metadata) {
            try {
              console.log('Processing employee metadata:', employee.metadata);
              // Insecure deserialization of user input - THIS IS THE VULNERABILITY
              const deserializedData = serialize.unserialize(employee.metadata);
              console.log('Deserialized metadata:', deserializedData);
            } catch (deserializeError) {
              console.error('Error deserializing metadata:', deserializeError);
              // Continue processing even if deserialization fails
            }
          }
          
          // Validate required fields
          if (!employee.name || !employee.email || !employee.position || !employee.department) {
            errors.push({
              email: employee.email || 'unknown',
              error: 'Missing required fields (name, email, position, department)'
            });
            continue;
          }
          
          // Check if employee with this email already exists
          const [existingEmployees] = await connection.query(
            'SELECT id FROM employees WHERE email = ?',
            [employee.email]
          );
          
          if (existingEmployees.length > 0) {
            errors.push({
              email: employee.email,
              error: 'Employee with this email already exists'
            });
            continue;
          }
          
          // Insert the employee
          const [result] = await connection.query(
            `INSERT INTO employees (
              name, position, department, email, phone, location, 
              hire_date, status, manager, salary, bio
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              employee.name,
              employee.position,
              employee.department,
              employee.email,
              employee.phone || null,
              employee.location || null,
              employee.hire_date,
              employee.status || 'active',
              employee.manager || null,
              employee.salary || null,
              employee.bio || null
            ]
          );
          
          if (result.insertId) {
            insertedCount++;
          }
        } catch (employeeError) {
          console.error('Error processing employee:', employee.email, employeeError);
          errors.push({
            email: employee.email || 'unknown',
            error: employeeError.message
          });
        }
      }
      
      return res.json({
        success: true,
        message: `Processed ${employeesData.length} employees`,
        inserted: insertedCount,
        errors: errors.length > 0 ? errors : undefined
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to process bulk upload: ${error.message}` 
    });
  }
});

// Performance Endpoints
// Get employee performance reviews
app.get('/api/performance/reviews/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Get reviews for the employee
      const [reviews] = await connection.query(
        `SELECT r.*, 
          e.name as reviewer_name, 
          e.position as reviewer_position, 
          e.avatar as reviewer_avatar
         FROM performance_reviews r
         LEFT JOIN employees e ON r.reviewer_id = e.id
         WHERE r.employee_id = ?
         ORDER BY r.period_end DESC`,
        [employeeId]
      );
      
      // Format the reviews
      const formattedReviews = reviews.map(review => ({
        id: review.id,
        employeeId: review.employee_id,
        reviewerId: review.reviewer_id,
        periodStart: review.period_start,
        periodEnd: review.period_end,
        submissionDate: review.submission_date,
        status: review.status,
        overallRating: review.overall_rating,
        strengths: review.strengths,
        areasOfImprovement: review.areas_of_improvement,
        comments: review.comments,
        reviewer: review.reviewer_id ? {
          id: review.reviewer_id,
          name: review.reviewer_name,
          position: review.reviewer_position,
          avatar: review.reviewer_avatar
        } : null
      }));
      
      res.json({ 
        success: true, 
        data: formattedReviews 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to get employee reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to get employee reviews: ${error.message}` 
    });
  }
});

// Get employee performance goals
app.get('/api/performance/goals/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Create performance_goals table if it doesn't exist
      await connection.query(`
        CREATE TABLE IF NOT EXISTS performance_goals (
          id INT PRIMARY KEY AUTO_INCREMENT,
          employee_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category ENUM('personal', 'professional', 'team') NOT NULL,
          target_date DATE NOT NULL,
          creation_date DATE NOT NULL,
          status ENUM('notstarted', 'inprogress', 'completed', 'cancelled') NOT NULL DEFAULT 'notstarted',
          progress INT NOT NULL DEFAULT 0,
          metric_type VARCHAR(50),
          target_value FLOAT,
          current_value FLOAT DEFAULT 0,
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )
      `);
      
      // Get goals for the employee
      const [goals] = await connection.query(
        `SELECT * FROM performance_goals
         WHERE employee_id = ?
         ORDER BY target_date ASC`,
        [employeeId]
      );
      
      // Format the goals
      const formattedGoals = goals.map(goal => ({
        id: goal.id,
        employeeId: goal.employee_id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        targetDate: goal.target_date,
        creationDate: goal.creation_date,
        status: goal.status,
        progress: goal.progress,
        metricType: goal.metric_type,
        targetValue: goal.target_value,
        currentValue: goal.current_value
      }));
      
      res.json({ 
        success: true, 
        data: formattedGoals 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to get employee goals:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to get employee goals: ${error.message}` 
    });
  }
});

// Create a new performance goal
app.post('/api/performance/goals', async (req, res) => {
  try {
    const { 
      employeeId, 
      title, 
      description, 
      category, 
      targetDate, 
      metricType, 
      targetValue 
    } = req.body;
    
    // Validate required fields
    if (!employeeId || !title || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: employeeId, title, targetDate'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Insert the new goal
      const [result] = await connection.execute(
        `INSERT INTO performance_goals (
          employee_id, title, description, category, target_date, creation_date,
          status, progress, metric_type, target_value, current_value
        ) VALUES (?, ?, ?, ?, ?, CURDATE(), 'notstarted', 0, ?, ?, 0)`,
        [
          employeeId,
          title,
          description || '',
          category || 'professional',
          targetDate,
          metricType || 'completion',
          targetValue || 100
        ]
      );
      
      // Get the newly created goal
      const [goals] = await connection.query(
        `SELECT * FROM performance_goals WHERE id = ?`,
        [result.insertId]
      );
      
      if (goals.length === 0) {
        throw new Error('Failed to retrieve created goal');
      }
      
      const goal = goals[0];
      
      // Format the goal
      const formattedGoal = {
        id: goal.id,
        employeeId: goal.employee_id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        targetDate: goal.target_date,
        creationDate: goal.creation_date,
        status: goal.status,
        progress: goal.progress,
        metricType: goal.metric_type,
        targetValue: goal.target_value,
        currentValue: goal.current_value
      };
      
      res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: formattedGoal
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to create goal:', error);
    res.status(500).json({
      success: false,
      message: `Failed to create goal: ${error.message}`
    });
  }
});

// Update a performance goal
app.put('/api/performance/goals/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const updates = req.body;
    
    // Validate that there are updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Build the update query dynamically based on provided fields
      const allowedFields = [
        'title', 'description', 'category', 'target_date', 
        'status', 'progress', 'metric_type', 'target_value', 'current_value'
      ];
      
      const updateFields = [];
      const updateValues = [];
      
      // Map camelCase fields to snake_case for database
      const fieldMapping = {
        title: 'title',
        description: 'description',
        category: 'category',
        targetDate: 'target_date',
        status: 'status',
        progress: 'progress',
        metricType: 'metric_type',
        targetValue: 'target_value',
        currentValue: 'current_value'
      };
      
      // Build update query parts
      Object.entries(updates).forEach(([key, value]) => {
        const dbField = fieldMapping[key];
        if (dbField && allowedFields.includes(dbField)) {
          updateFields.push(`${dbField} = ?`);
          updateValues.push(value);
        }
      });
      
      // If progress is updated to 100, automatically set status to completed
      if (updates.progress === 100 && !updates.status) {
        updateFields.push('status = ?');
        updateValues.push('completed');
      } else if (updates.progress !== undefined && updates.progress < 100 && !updates.status) {
        // If progress is updated to less than 100, set status to inprogress if not already completed
        updateFields.push('status = CASE WHEN status = "completed" THEN status ELSE ? END');
        updateValues.push('inprogress');
      }
      
      // Add goalId to values array
      updateValues.push(goalId);
      
      // Execute update if there are fields to update
      if (updateFields.length > 0) {
        await connection.execute(
          `UPDATE performance_goals SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }
      
      // Get the updated goal
      const [goals] = await connection.query(
        `SELECT * FROM performance_goals WHERE id = ?`,
        [goalId]
      );
      
      if (goals.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }
      
      const goal = goals[0];
      
      // Format the goal
      const formattedGoal = {
        id: goal.id,
        employeeId: goal.employee_id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        targetDate: goal.target_date,
        creationDate: goal.creation_date,
        status: goal.status,
        progress: goal.progress,
        metricType: goal.metric_type,
        targetValue: goal.target_value,
        currentValue: goal.current_value
      };
      
      res.json({
        success: true,
        message: 'Goal updated successfully',
        data: formattedGoal
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to update goal:', error);
    res.status(500).json({
      success: false,
      message: `Failed to update goal: ${error.message}`
    });
  }
});
