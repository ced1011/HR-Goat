
import { db } from '../database';
import { ApiResponse } from '../api-models';
import { toast } from 'sonner';
import setupDatabaseSQL from '../sql/setup-database.sql?raw';
import insertMockDataSQL from '../sql/insert-mock-data.sql?raw';

interface SetupResult {
  schemaCreated: boolean;
  dataInserted: boolean;
}

class DatabaseSetupService {
  async setupDatabase(): Promise<ApiResponse<SetupResult>> {
    try {
      console.log('Starting database setup...');
      
      // Create schema
      const schemaResult = await db.executeScript(setupDatabaseSQL);
      if (schemaResult.error) {
        throw new Error(`Schema creation failed: ${schemaResult.error}`);
      }
      
      // Insert mock data
      const dataResult = await db.executeScript(insertMockDataSQL);
      if (dataResult.error) {
        throw new Error(`Data insertion failed: ${dataResult.error}`);
      }
      
      toast.success('Database setup completed successfully');
      
      return {
        data: {
          schemaCreated: true,
          dataInserted: true
        },
        error: null
      };
    } catch (error) {
      console.error('Database setup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Database setup failed', { description: errorMessage });
      
      return {
        data: {
          schemaCreated: false,
          dataInserted: false
        },
        error: errorMessage
      };
    }
  }
  
  async checkDatabaseStatus(): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      // Try to query the employees table to see if it exists
      const result = await db.query('SELECT 1 FROM employees LIMIT 1');
      
      return {
        data: {
          exists: !result.error
        },
        error: null
      };
    } catch (error) {
      // If there's an error, the table likely doesn't exist
      return {
        data: {
          exists: false
        },
        error: null
      };
    }
  }
}

export const databaseSetupService = new DatabaseSetupService();
