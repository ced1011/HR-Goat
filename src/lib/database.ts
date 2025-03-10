import { ApiResponse } from './api-models';
import { toast } from 'sonner';

// API configuration
const API_CONFIG = {
  baseUrl: '/api'
};

class Database {
  private static instance: Database;
  
  private constructor() {
    console.log('Database API client initialized');
  }
  
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
  
  public async testConnection(): Promise<ApiResponse<{ success: boolean }>> {
    try {
      // Make a request to the backend API to test the connection
      const response = await fetch(`${API_CONFIG.baseUrl}/test-connection`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect to database');
      }
      
      return { 
        data: { success: data.success }, 
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
      // In a real implementation, we would have a proper API endpoint for this
      // For now, we'll use a mock implementation that returns mock data
      console.warn('Direct database queries are not supported in the browser. Use API endpoints instead.');
      
      // Return empty result
      return { data: [] as unknown as T, error: null };
    } catch (error) {
      console.error('Database query failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error occurred';
      toast.error('Database query failed', { description: errorMessage });
      return { data: {} as T, error: errorMessage };
    }
  }
  
  public async runScript(scriptName: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      // Make a request to the backend API to run the script
      const response = await fetch(`${API_CONFIG.baseUrl}/run-${scriptName}-script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to run ${scriptName} script`);
      }
      
      return { data: { success: data.success }, error: null };
    } catch (error) {
      console.error('Failed to run script:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to run script', { description: errorMessage });
      return { data: { success: false }, error: errorMessage };
    }
  }
  
  public async executeScript(sqlScript: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      console.warn('Direct script execution is not supported in the browser. Use API endpoints instead.');
      return { data: { success: false }, error: 'Not implemented in browser environment' };
    } catch (error) {
      console.error('Failed to execute SQL script:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error occurred';
      toast.error('Failed to execute SQL script', { description: errorMessage });
      return { data: { success: false }, error: errorMessage };
    }
  }
}

export const db = Database.getInstance();
