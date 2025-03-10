
import { Employee } from './api-models';
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
  SkillAssessment
} from './api-models';

// Re-export individual API services
export { payrollApiService } from './api-services/payroll-api';
export { performanceApiService } from './api-services/performance-api';
export { databaseSetupService } from './api-services/database-setup';

// Database configuration
const DB_CONFIG = {
  host: 'database-1.cluster-cnye4gmgu5x2.us-east-1.rds.amazonaws.com',
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

// API service class
class ApiService {
  private baseUrl: string;
  
  constructor() {
    // In a real implementation, this would be an actual API endpoint
    this.baseUrl = '/api';
    
    console.log('API Service initialized with DB config:', {
      host: DB_CONFIG.host,
      username: DB_CONFIG.username,
      // Password masked for security
    });
  }
  
  // Generic request method
  private async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      // For now, this is mocked
      // In a real implementation, this would make actual HTTP requests
      
      console.log(`Making ${method} request to ${endpoint}`, data);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to fetch from database first, fall back to mock data if needed
      let responseData: any;
      
      // Database queries based on endpoints
      if (endpoint === '/employees' && method === 'GET') {
        const dbResult = await db.query<Employee[]>('SELECT * FROM employees');
        if (!dbResult.error && Array.isArray(dbResult.data) && dbResult.data.length > 0) {
          responseData = dbResult.data;
        } else {
          // Fall back to mock data
          responseData = mockEmployees;
        }
      } else if (endpoint.startsWith('/employees/') && method === 'GET') {
        const id = parseInt(endpoint.split('/').pop() || '0');
        const dbResult = await db.query<Employee[]>('SELECT * FROM employees WHERE id = ?', [id]);
        
        if (!dbResult.error && Array.isArray(dbResult.data) && dbResult.data.length > 0) {
          responseData = dbResult.data[0];
        } else {
          // Fall back to mock data
          responseData = mockEmployees.find(emp => emp.id === id);
        }
        
        if (!responseData) {
          throw new Error('Employee not found');
        }
      } else {
        // Mock successful response for other endpoints
        responseData = { success: true };
      }
      
      return { data: responseData as T, error: null };
    } catch (error) {
      console.error('API request failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('API request failed', { description: errorMessage });
      return { data: {} as T, error: errorMessage };
    }
  }
  
  // API methods
  async getEmployees(): Promise<ApiResponse<Employee[]>> {
    return this.request<Employee[]>('/employees');
  }
  
  async getEmployeeById(id: number): Promise<ApiResponse<Employee>> {
    return this.request<Employee>(`/employees/${id}`);
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
}

// Export a singleton instance
export const apiService = new ApiService();
