import { Employee, ApiResponse, BankAccount } from './api-models';
import { toast } from 'sonner';
import { db } from './database';

// Type definitions
export type { 
  Employee, 
  ApiResponse, 
  PaySlip, 
  BenefitPlan, 
  EmployeeBenefit, 
  TaxDocument,
  PerformanceReview,
  PerformanceGoal,
  SkillAssessment,
  BankAccount
} from './api-models';

// Re-export individual API services
export { payrollApiService } from './api-services/payroll-api';
export { performanceApiService } from './api-services/performance-api';
export { databaseSetupService } from './api-services/database-setup';

// Database configuration
const DB_CONFIG = {
  host: 'database-1.cluster-cnye4gmgu5x2.us-west-1.rds.amazonaws.com',
  username: 'admin',
  password: 'OLLI4RVKjgWdHVfc52b6'
};

// Mock data (until the actual DB connection is established)
const mockEmployees: Employee[] = [
  {
    id: 1,
    name: 'John Doe',
    position: 'Senior Software Engineer',
    department: 'Engineering',
    email: 'john.doe@company.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    hireDate: '2019-03-15',
    status: 'active',
    manager: 'Jane Smith',
    salary: 120000,
    bio: 'John is a senior developer with expertise in React and Node.js. He has been with the company for over 3 years and leads the frontend team.'
  },
  {
    id: 2,
    name: 'Jane Smith',
    position: 'Product Manager',
    department: 'Product',
    email: 'jane.smith@company.com',
    phone: '(555) 987-6543',
    location: 'New York, NY',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    hireDate: '2018-07-10',
    status: 'active',
    manager: 'Robert Johnson',
    salary: 135000,
    bio: 'Jane oversees product development and works closely with engineering and design teams to deliver high-quality products.'
  },
  {
    id: 3,
    name: 'Michael Chen',
    position: 'UX Designer',
    department: 'Design',
    email: 'michael.chen@company.com',
    phone: '(555) 456-7890',
    location: 'Austin, TX',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    hireDate: '2020-01-20',
    status: 'active',
    manager: 'Sarah Williams',
    salary: 95000,
    bio: 'Michael is passionate about creating intuitive user experiences and has a background in both graphic design and user research.'
  },
  {
    id: 4,
    name: 'Sarah Williams',
    position: 'Design Director',
    department: 'Design',
    email: 'sarah.williams@company.com',
    phone: '(555) 789-0123',
    location: 'San Francisco, CA',
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
    hireDate: '2017-11-05',
    status: 'active',
    manager: 'Robert Johnson',
    salary: 145000,
    bio: 'Sarah leads the design team and has over 10 years of experience in product and brand design across multiple industries.'
  },
  {
    id: 5,
    name: 'David Kim',
    position: 'Marketing Specialist',
    department: 'Marketing',
    email: 'david.kim@company.com',
    phone: '(555) 234-5678',
    location: 'Remote',
    avatar: 'https://randomuser.me/api/portraits/men/73.jpg',
    hireDate: '2021-04-12',
    status: 'onleave',
    manager: 'Lisa Chen',
    salary: 85000,
    bio: 'David specializes in digital marketing and social media strategies. He previously worked at a top marketing agency in Chicago.'
  },
  {
    id: 6,
    name: 'Emily Johnson',
    position: 'HR Specialist',
    department: 'HR',
    email: 'emily.johnson@company.com',
    phone: '(555) 345-6789',
    location: 'New York, NY',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    hireDate: '2019-09-22',
    status: 'active',
    manager: 'Robert Johnson',
    salary: 90000,
    bio: 'Emily handles employee relations, benefits administration, and recruitment. She has a master\'s degree in HR management.'
  },
  {
    id: 7,
    name: 'James Wilson',
    position: 'Backend Developer',
    department: 'Engineering',
    email: 'james.wilson@company.com',
    phone: '(555) 456-7890',
    location: 'Remote',
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
    hireDate: '2020-06-15',
    status: 'active',
    manager: 'John Doe',
    salary: 110000,
    bio: 'James specializes in building scalable backend systems using Python and Go. He previously worked at a fintech startup.'
  },
  {
    id: 8,
    name: 'Lisa Chen',
    position: 'Marketing Director',
    department: 'Marketing',
    email: 'lisa.chen@company.com',
    phone: '(555) 567-8901',
    location: 'San Francisco, CA',
    avatar: 'https://randomuser.me/api/portraits/women/76.jpg',
    hireDate: '2018-03-01',
    status: 'active',
    manager: 'Robert Johnson',
    salary: 140000,
    bio: 'Lisa oversees all marketing initiatives and has a proven track record of driving growth through innovative marketing strategies.'
  }
];

// Mock bank accounts data
const mockBankAccounts: BankAccount[] = [
  {
    id: 1,
    employeeId: 1,
    accountType: 'checking',
    bankName: 'Chase Bank',
    accountNumber: '****4567',
    routingNumber: '****1234',
    isPrimary: true,
    createdAt: '2022-01-15T00:00:00Z',
    updatedAt: '2022-01-15T00:00:00Z'
  },
  {
    id: 2,
    employeeId: 1,
    accountType: 'savings',
    bankName: 'Bank of America',
    accountNumber: '****7890',
    routingNumber: '****5678',
    isPrimary: false,
    createdAt: '2022-02-20T00:00:00Z',
    updatedAt: '2022-02-20T00:00:00Z'
  },
  {
    id: 3,
    employeeId: 2,
    accountType: 'checking',
    bankName: 'Wells Fargo',
    accountNumber: '****2345',
    routingNumber: '****9012',
    isPrimary: true,
    createdAt: '2022-01-10T00:00:00Z',
    updatedAt: '2022-01-10T00:00:00Z'
  },
  {
    id: 4,
    employeeId: 3,
    accountType: 'checking',
    bankName: 'Citibank',
    accountNumber: '****6789',
    routingNumber: '****3456',
    isPrimary: true,
    createdAt: '2022-03-05T00:00:00Z',
    updatedAt: '2022-03-05T00:00:00Z'
  },
  {
    id: 5,
    employeeId: 3,
    accountType: 'investment',
    bankName: 'Fidelity',
    accountNumber: '****1234',
    routingNumber: '****7890',
    isPrimary: false,
    createdAt: '2022-04-15T00:00:00Z',
    updatedAt: '2022-04-15T00:00:00Z'
  }
];

// API service class
class ApiService {
  private baseUrl: string;
  
  constructor() {
    // Use the proxied API endpoint
    this.baseUrl = '/api';
    
    console.log('API Service initialized');
  }
  
  // Generic request method
  private async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      // Build the request options
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      // Add body for non-GET requests
      if (method !== 'GET' && data) {
        options.body = JSON.stringify(data);
      }
      
      // Improved logging - only log data for non-GET requests
      if (method === 'GET') {
        console.log(`Making ${method} request to ${this.baseUrl}${endpoint}`);
      } else {
        console.log(`Making ${method} request to ${this.baseUrl}${endpoint}`, data);
      }
      
      // Make the request to the backend API
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const responseData = await response.json();
      
      // Log the response for debugging
      console.log(`Response from ${endpoint}:`, responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || 'API request failed');
      }
      
      // Handle nested response structure
      if (responseData.data !== undefined) {
        console.log(`Extracted 'data' from response for ${endpoint}`);
        return { data: responseData.data as T, error: null };
      } else if (responseData.documents !== undefined) {
        console.log(`Extracted 'documents' from response for ${endpoint}`);
        return { data: responseData.documents as T, error: null };
      } else if (responseData.events !== undefined) {
        console.log(`Extracted 'events' from response for ${endpoint}`);
        return { data: responseData.events as T, error: null };
      } else {
        console.log(`Using full response for ${endpoint}`);
        return { data: responseData as T, error: null };
      }
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Fall back to mock data for GET requests in development
      if (method === 'GET' && import.meta.env.DEV) {
        console.warn('Falling back to mock data for development');
        
        // Return mock data based on the endpoint
        if (endpoint === '/employees') {
          return { data: mockEmployees as unknown as T, error: null };
        } else if (endpoint.startsWith('/employees/')) {
          const id = parseInt(endpoint.split('/').pop() || '0');
          const employee = mockEmployees.find(e => e.id === id);
          return { data: (employee || null) as unknown as T, error: null };
        }
      }
      
      return { data: null as unknown as T, error: errorMessage };
    }
  }
  
  // API methods
  async getEmployees(): Promise<ApiResponse<Employee[]>> {
    return this.request<Employee[]>('/employees');
  }
  
  async getEmployeeById(id: number): Promise<ApiResponse<Employee>> {
    return this.request<Employee>(`/employees/${id}`);
  }
  
  async updateEmployee(id: number, data: Partial<Employee>): Promise<ApiResponse<Employee>> {
    return this.request<Employee>(`/employees/${id}`, 'PUT', data);
  }
  
  async searchEmployees(query: string): Promise<ApiResponse<Employee[]>> {
    try {
      // Try database query first
      const lowercaseQuery = query.toLowerCase();
      const dbResult = await db.query<Employee[]>(
        `SELECT * FROM employees WHERE 
         LOWER(name) LIKE ? OR 
         LOWER(position) LIKE ? OR 
         LOWER(department) LIKE ?`,
        [`%${lowercaseQuery}%`, `%${lowercaseQuery}%`, `%${lowercaseQuery}%`]
      );
      
      if (!dbResult.error && Array.isArray(dbResult.data) && dbResult.data.length > 0) {
        return { data: dbResult.data, error: null };
      }
      
      // Fall back to filtering mock data
      const filtered = mockEmployees.filter(employee => 
        employee.name.toLowerCase().includes(lowercaseQuery) ||
        employee.position.toLowerCase().includes(lowercaseQuery) ||
        employee.department.toLowerCase().includes(lowercaseQuery)
      );
      
      return { data: filtered, error: null };
    } catch (error) {
      console.error('Search failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { data: [], error: errorMessage };
    }
  }
  
  async filterEmployees(filters: Record<string, string>): Promise<ApiResponse<Employee[]>> {
    try {
      // Try database query first with dynamic WHERE clause construction
      if (Object.keys(filters).length > 0) {
        let whereClause = '';
        const params: string[] = [];
        
        Object.entries(filters).forEach(([key, value], index) => {
          if (value) {
            if (index > 0) {
              whereClause += ' AND ';
            }
            whereClause += `LOWER(${key}) LIKE ?`;
            params.push(`%${value.toLowerCase()}%`);
          }
        });
        
        if (whereClause) {
          const dbResult = await db.query<Employee[]>(
            `SELECT * FROM employees WHERE ${whereClause}`,
            params
          );
          
          if (!dbResult.error && Array.isArray(dbResult.data)) {
            return { data: dbResult.data, error: null };
          }
        }
      }
      
      // Fall back to filtering mock data
      let filtered = [...mockEmployees];
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key in mockEmployees[0]) {
          filtered = filtered.filter(employee => 
            // @ts-ignore
            employee[key].toLowerCase().includes(value.toLowerCase())
          );
        }
      });
      
      return { data: filtered, error: null };
    } catch (error) {
      console.error('Filter failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { data: [], error: errorMessage };
    }
  }

  // Bank Account Methods
  async getBankAccounts(employeeId: number): Promise<ApiResponse<BankAccount[]>> {
    try {
      // In a real app, this would be a fetch call to the API
      const accounts = mockBankAccounts.filter(account => account.employeeId === employeeId);
      return { data: accounts, error: null };
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      return { data: [], error: 'Failed to fetch bank accounts' };
    }
  }

  async addBankAccount(account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<BankAccount>> {
    try {
      // In a real app, this would be a POST request to the API
      const newAccount: BankAccount = {
        ...account,
        id: Math.max(...mockBankAccounts.map(a => a.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // If this is set as primary, update other accounts
      if (newAccount.isPrimary) {
        mockBankAccounts.forEach(acc => {
          if (acc.employeeId === newAccount.employeeId) {
            acc.isPrimary = false;
          }
        });
      }
      
      mockBankAccounts.push(newAccount);
      return { data: newAccount, error: null };
    } catch (error) {
      console.error('Error adding bank account:', error);
      return { data: {} as BankAccount, error: 'Failed to add bank account' };
    }
  }

  async updateBankAccount(id: number, updates: Partial<BankAccount>): Promise<ApiResponse<BankAccount>> {
    try {
      // In a real app, this would be a PUT request to the API
      const accountIndex = mockBankAccounts.findIndex(acc => acc.id === id);
      if (accountIndex === -1) {
        return { data: {} as BankAccount, error: 'Bank account not found' };
      }
      
      // If setting as primary, update other accounts
      if (updates.isPrimary) {
        const employeeId = mockBankAccounts[accountIndex].employeeId;
        mockBankAccounts.forEach(acc => {
          if (acc.employeeId === employeeId) {
            acc.isPrimary = false;
          }
        });
      }
      
      const updatedAccount = {
        ...mockBankAccounts[accountIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      mockBankAccounts[accountIndex] = updatedAccount;
      return { data: updatedAccount, error: null };
    } catch (error) {
      console.error('Error updating bank account:', error);
      return { data: {} as BankAccount, error: 'Failed to update bank account' };
    }
  }

  async deleteBankAccount(id: number): Promise<ApiResponse<boolean>> {
    try {
      // In a real app, this would be a DELETE request to the API
      const accountIndex = mockBankAccounts.findIndex(acc => acc.id === id);
      if (accountIndex === -1) {
        return { data: false, error: 'Bank account not found' };
      }
      
      mockBankAccounts.splice(accountIndex, 1);
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting bank account:', error);
      return { data: false, error: 'Failed to delete bank account' };
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();
