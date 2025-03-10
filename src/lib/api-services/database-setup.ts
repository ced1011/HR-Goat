
import { toast } from 'sonner';
import { ApiResponse } from '../api-models';

class DatabaseSetupService {
  private baseUrl: string;
  
  constructor() {
    // Base URL for the backend server
    this.baseUrl = 'http://localhost:5000/api';
  }
  
  async testConnection(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/test-connection`);
      const data = await response.json();
      
      if (!response.ok) {
        return {
          data: { success: false, message: data.message || 'Failed to connect to database' },
          error: data.message
        };
      }
      
      return {
        data: { success: data.success, message: data.message },
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
      const response = await fetch(`${this.baseUrl}/run-setup-script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          data: { success: false, message: data.message || 'Failed to run setup script' },
          error: data.message
        };
      }
      
      return {
        data: { success: data.success, message: data.message },
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
      const response = await fetch(`${this.baseUrl}/run-mock-data-script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          data: { success: false, message: data.message || 'Failed to run mock data script' },
          error: data.message
        };
      }
      
      return {
        data: { success: data.success, message: data.message },
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
      const response = await fetch(`${this.baseUrl}/database-stats`);
      const data = await response.json();
      
      if (!response.ok) {
        return {
          data: { tables: [] },
          error: data.message
        };
      }
      
      return {
        data: { tables: data.tables || [] },
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
