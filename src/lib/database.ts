
import { ApiResponse } from './api-models';
import mysql from 'mysql2/promise';
import { toast } from 'sonner';

// Database configuration
const DB_CONFIG = {
  host: 'database-1.cluster-cnye4gmgu5x2.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'OLLI4RVKjgWdHVfc52b6',
  database: 'hr_portal'
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
