
import { ApiResponse } from './api-models';
import mysql from 'mysql2/promise';
import { toast } from 'sonner';
import fs from 'fs';

// Database configuration
const DB_CONFIG = {
  host: 'database-1.cluster-cnye4gmgu5x2.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'OLLI4RVKjgWdHVfc52b6',
  database: 'hrportal'
};

class Database {
  private static instance: Database;
  private pool: mysql.Pool;
  
  private constructor() {
    this.pool = mysql.createPool({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('Database connection pool initialized');
  }
  
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
  
  public async testConnection(): Promise<ApiResponse<{ success: boolean }>> {
    try {
      // Try to connect to the database
      const connection = await this.pool.getConnection();
      connection.release();
      
      return { 
        data: { success: true }, 
        error: null 
      };
    } catch (error) {
      console.error('Database connection test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error occurred';
      toast.error('Database connection test failed', { description: errorMessage });
      return { data: { success: false }, error: errorMessage };
    }
  }
  
  public async query<T>(sql: string, params?: any[]): Promise<ApiResponse<T>> {
    try {
      const [results] = await this.pool.execute(sql, params);
      return { data: results as T, error: null };
    } catch (error) {
      console.error('Database query failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error occurred';
      toast.error('Database query failed', { description: errorMessage });
      return { data: {} as T, error: errorMessage };
    }
  }
  
  public async runScript(scriptName: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      // In a browser environment, we'd typically fetch these scripts from a server
      // For this example, simulate fetching the script content based on script name
      let sqlScript = '';
      
      // Simple mapping for demo purposes
      if (scriptName === 'setup-database') {
        sqlScript = `
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
      } else if (scriptName === 'insert-mock-data') {
        sqlScript = `
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
      }
      
      return await this.executeScript(sqlScript);
    } catch (error) {
      console.error('Failed to run script:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to run script', { description: errorMessage });
      return { data: { success: false }, error: errorMessage };
    }
  }
  
  public async executeScript(sqlScript: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const connection = await this.pool.getConnection();
      
      try {
        // Split the script by semicolons to execute multiple statements
        const statements = sqlScript
          .split(';')
          .map(statement => statement.trim())
          .filter(statement => statement.length > 0);
        
        for (const statement of statements) {
          await connection.execute(statement);
        }
        
        return { data: { success: true }, error: null };
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Failed to execute SQL script:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error occurred';
      toast.error('Failed to execute SQL script', { description: errorMessage });
      return { data: { success: false }, error: errorMessage };
    }
  }
  
  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('Database connection pool closed');
    }
  }
}

export const db = Database.getInstance();
