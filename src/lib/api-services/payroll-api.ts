
import { toast } from 'sonner';
import { ApiResponse, PaySlip, BenefitPlan, EmployeeBenefit, TaxDocument } from '../api-models';

// Mock data for payroll
const mockPayslips: PaySlip[] = [
  {
    id: 1,
    employeeId: 1,
    periodStart: '2023-05-01',
    periodEnd: '2023-05-15',
    grossAmount: 3500,
    netAmount: 2650,
    taxes: 700,
    otherDeductions: 150,
    paymentDate: '2023-05-16',
    status: 'paid'
  },
  {
    id: 2,
    employeeId: 1,
    periodStart: '2023-05-16',
    periodEnd: '2023-05-31',
    grossAmount: 3500,
    netAmount: 2650,
    taxes: 700,
    otherDeductions: 150,
    paymentDate: '2023-06-01',
    status: 'paid'
  },
  {
    id: 3,
    employeeId: 1,
    periodStart: '2023-06-01',
    periodEnd: '2023-06-15',
    grossAmount: 3500,
    netAmount: 2650,
    taxes: 700,
    otherDeductions: 150,
    paymentDate: '2023-06-16',
    status: 'paid'
  },
  {
    id: 4,
    employeeId: 1,
    periodStart: '2023-06-16',
    periodEnd: '2023-06-30',
    grossAmount: 3500,
    netAmount: 2650,
    taxes: 700,
    otherDeductions: 150,
    paymentDate: '2023-07-01',
    status: 'paid'
  }
];

const mockBenefitPlans: BenefitPlan[] = [
  {
    id: 1,
    name: 'Premium Health Plan',
    type: 'health',
    description: 'Comprehensive health insurance with dental and vision coverage',
    coverage: 'Full family coverage with $500 deductible',
    monthlyCost: 750,
    employerContribution: 600
  },
  {
    id: 2,
    name: '401(k) Retirement Plan',
    type: 'retirement',
    description: 'Retirement savings with employer matching up to 5%',
    coverage: 'Investment options through Fidelity',
    monthlyCost: 0,
    employerContribution: 0
  },
  {
    id: 3,
    name: 'Life & Disability Insurance',
    type: 'insurance',
    description: 'Life insurance (2x annual salary) and short/long-term disability',
    coverage: 'Employee only, optional family riders available',
    monthlyCost: 85,
    employerContribution: 85
  }
];

const mockEmployeeBenefits: EmployeeBenefit[] = [
  {
    id: 1,
    employeeId: 1,
    benefitPlanId: 1,
    enrollmentDate: '2020-01-01',
    status: 'active',
    benefitPlan: mockBenefitPlans[0]
  },
  {
    id: 2,
    employeeId: 1,
    benefitPlanId: 2,
    enrollmentDate: '2020-01-01',
    status: 'active',
    benefitPlan: mockBenefitPlans[1]
  }
];

const mockTaxDocuments: TaxDocument[] = [
  {
    id: 1,
    employeeId: 1,
    year: 2022,
    documentType: 'W2',
    fileUrl: '/documents/W2-2022.pdf',
    uploadDate: '2023-01-15',
    description: 'W-2 Wage and Tax Statement for 2022'
  },
  {
    id: 2,
    employeeId: 1,
    year: 2021,
    documentType: 'W2',
    fileUrl: '/documents/W2-2021.pdf',
    uploadDate: '2022-01-17',
    description: 'W-2 Wage and Tax Statement for 2021'
  }
];

class PayrollApiService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = '/api/payroll';
  }
  
  private async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`Making ${method} request to ${endpoint}`, data);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let responseData: any;
      
      // Handle mock responses based on endpoints
      if (endpoint === '/payslips' && method === 'GET') {
        responseData = mockPayslips;
      } else if (endpoint.startsWith('/payslips/employee/') && method === 'GET') {
        const employeeId = parseInt(endpoint.split('/').pop() || '0');
        responseData = mockPayslips.filter(p => p.employeeId === employeeId);
      } else if (endpoint === '/benefits/plans' && method === 'GET') {
        responseData = mockBenefitPlans;
      } else if (endpoint.startsWith('/benefits/employee/') && method === 'GET') {
        const employeeId = parseInt(endpoint.split('/').pop() || '0');
        responseData = mockEmployeeBenefits
          .filter(b => b.employeeId === employeeId)
          .map(benefit => {
            return {
              ...benefit,
              benefitPlan: mockBenefitPlans.find(plan => plan.id === benefit.benefitPlanId)
            };
          });
      } else if (endpoint.startsWith('/tax-documents/employee/') && method === 'GET') {
        const employeeId = parseInt(endpoint.split('/').pop() || '0');
        responseData = mockTaxDocuments.filter(d => d.employeeId === employeeId);
      } else {
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
  async getPayslips(): Promise<ApiResponse<PaySlip[]>> {
    return this.request<PaySlip[]>('/payslips');
  }
  
  async getEmployeePayslips(employeeId: number): Promise<ApiResponse<PaySlip[]>> {
    return this.request<PaySlip[]>(`/payslips/employee/${employeeId}`);
  }
  
  async getBenefitPlans(): Promise<ApiResponse<BenefitPlan[]>> {
    return this.request<BenefitPlan[]>('/benefits/plans');
  }
  
  async getEmployeeBenefits(employeeId: number): Promise<ApiResponse<EmployeeBenefit[]>> {
    return this.request<EmployeeBenefit[]>(`/benefits/employee/${employeeId}`);
  }
  
  async getTaxDocuments(employeeId: number): Promise<ApiResponse<TaxDocument[]>> {
    return this.request<TaxDocument[]>(`/tax-documents/employee/${employeeId}`);
  }
}

export const payrollApiService = new PayrollApiService();
