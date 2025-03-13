import { BankAccount, ApiResponse } from '../api-models';

// Use the proxy configuration from vite.config.ts
const baseUrl = '/api';

export const bankAccountService = {
  // Get all bank accounts for an employee
  async getBankAccounts(employeeId: number): Promise<ApiResponse<BankAccount[]>> {
    try {
      const response = await fetch(`${baseUrl}/bank-accounts/${employeeId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch bank accounts');
      }
      
      return { data: data.data, error: null };
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
  
  // Add a new bank account
  async addBankAccount(account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<BankAccount>> {
    try {
      const response = await fetch(`${baseUrl}/bank-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(account)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to add bank account');
      }
      
      return { data: data.data, error: null };
    } catch (error) {
      console.error('Error adding bank account:', error);
      return { 
        data: {} as BankAccount, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
  
  // Update a bank account
  async updateBankAccount(id: number, updates: Partial<BankAccount>): Promise<ApiResponse<BankAccount>> {
    try {
      const response = await fetch(`${baseUrl}/bank-accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update bank account');
      }
      
      return { data: data.data, error: null };
    } catch (error) {
      console.error('Error updating bank account:', error);
      return { 
        data: {} as BankAccount, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
  
  // Delete a bank account
  async deleteBankAccount(id: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${baseUrl}/bank-accounts/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete bank account');
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting bank account:', error);
      return { 
        data: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
  
  // Set a bank account as primary
  async setPrimaryBankAccount(id: number): Promise<ApiResponse<BankAccount>> {
    return this.updateBankAccount(id, { isPrimary: true });
  }
}; 