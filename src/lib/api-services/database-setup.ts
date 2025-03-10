
import { toast } from 'sonner';
import { ApiResponse } from '../api-models';
import { db } from '../database';

class DatabaseSetupService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = '/api/database-setup';
  }
  
  async testConnection(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      // Try to connect to the database
      const result = await db.testConnection();
      
      if (result.error) {
        return {
          data: { success: false, message: `Failed to connect to database: ${result.error}` },
          error: result.error
        };
      }
      
      return {
        data: { success: true, message: 'Successfully connected to database' },
        error: null
      };
    } catch (error) {
      console.error('Database connection test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        data: { success: false, message: errorMessage },
        error: errorMessage
      };
    }
  }
  
  async runSetupScript(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const result = await db.runScript('setup-database');
      
      if (result.error) {
        return {
          data: { success: false, message: `Failed to run setup script: ${result.error}` },
          error: result.error
        };
      }
      
      return {
        data: { success: true, message: 'Database setup script executed successfully' },
        error: null
      };
    } catch (error) {
      console.error('Failed to run database setup script:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        data: { success: false, message: errorMessage },
        error: errorMessage
      };
    }
  }
  
  async runMockDataScript(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const result = await db.runScript('insert-mock-data');
      
      if (result.error) {
        return {
          data: { success: false, message: `Failed to run mock data script: ${result.error}` },
          error: result.error
        };
      }
      
      return {
        data: { success: true, message: 'Mock data inserted successfully' },
        error: null
      };
    } catch (error) {
      console.error('Failed to run mock data script:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        data: { success: false, message: errorMessage },
        error: errorMessage
      };
    }
  }
  
  async getDatabaseStats(): Promise<ApiResponse<{ tables: { name: string; rowCount: number }[] }>> {
    try {
      const result = await db.query('SHOW TABLES');
      
      if (result.error) {
        return {
          data: { tables: [] },
          error: result.error
        };
      }
      
      const tables: { name: string; rowCount: number }[] = [];
      
      // Parse the tables from the result
      if (Array.isArray(result.data)) {
        for (const table of result.data) {
          const tableName = Object.values(table)[0] as string;
          const countResult = await db.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          
          if (!countResult.error && Array.isArray(countResult.data) && countResult.data.length > 0) {
            tables.push({
              name: tableName,
              rowCount: countResult.data[0].count
            });
          } else {
            tables.push({
              name: tableName,
              rowCount: 0
            });
          }
        }
      }
      
      return {
        data: { tables },
        error: null
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        data: { tables: [] },
        error: errorMessage
      };
    }
  }
}

export const databaseSetupService = new DatabaseSetupService();
