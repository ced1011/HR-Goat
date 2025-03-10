
// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  error: string | null;
}

// Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  employeeId?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Employee Types
export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'onleave';
  manager: string;
  salary: number;
  bio: string;
}

// Payroll Types
export interface PaySlip {
  id: number;
  employeeId: number;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  netAmount: number;
  taxes: number;
  otherDeductions: number;
  paymentDate: string;
  status: 'paid' | 'pending' | 'cancelled';
}

export interface BenefitPlan {
  id: number;
  name: string;
  type: string;
  description: string;
  coverage: string;
  monthlyCost: number;
  employerContribution: number;
}

export interface EmployeeBenefit {
  id: number;
  employeeId: number;
  benefitPlanId: number;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'pending';
  benefitPlan?: BenefitPlan;
}

export interface TaxDocument {
  id: number;
  employeeId: number;
  year: number;
  documentType: string;
  fileUrl: string;
  uploadDate: string;
  description: string;
}

// Performance Types
export interface PerformanceReview {
  id: number;
  employeeId: number;
  reviewerId: number;
  periodStart: string;
  periodEnd: string;
  submissionDate: string;
  status: 'draft' | 'submitted' | 'completed';
  overallRating: number;
  strengths: string;
  areasOfImprovement: string;
  comments: string;
  reviewer?: {
    id: number;
    name: string;
    position: string;
    avatar: string;
  };
}

export interface PerformanceGoal {
  id: number;
  employeeId: number;
  title: string;
  description: string;
  category: 'personal' | 'professional' | 'team';
  targetDate: string;
  creationDate: string;
  status: 'notstarted' | 'inprogress' | 'completed' | 'cancelled';
  progress: number;
  metricType: string;
  targetValue: number;
  currentValue: number;
}

export interface SkillAssessment {
  id: number;
  employeeId: number;
  skillName: string;
  category: string;
  rating: number;
  assessmentDate: string;
  assessorId: number;
  comments: string;
}
