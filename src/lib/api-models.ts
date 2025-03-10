
// Common type definitions for all API services

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
  status: 'active' | 'onleave' | 'terminated';
  manager?: string;
  salary?: number;
  bio?: string;
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
  status: 'pending' | 'processed' | 'paid';
}

export interface BenefitPlan {
  id: number;
  name: string;
  type: 'health' | 'retirement' | 'insurance' | 'other';
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
  status: 'active' | 'pending' | 'terminated';
  benefitPlan?: BenefitPlan;
}

export interface TaxDocument {
  id: number;
  employeeId: number;
  year: number;
  documentType: 'W2' | 'W4' | '1099' | 'other';
  fileUrl: string;
  uploadDate: string;
  description?: string;
}

// Performance Types
export interface PerformanceReview {
  id: number;
  employeeId: number;
  reviewerId: number;
  periodStart: string;
  periodEnd: string;
  submissionDate: string;
  status: 'draft' | 'submitted' | 'inprogress' | 'completed';
  overallRating: number;
  strengths?: string;
  areasOfImprovement?: string;
  comments?: string;
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
  category: 'personal' | 'professional' | 'team' | 'company';
  targetDate: string;
  creationDate: string;
  status: 'notstarted' | 'inprogress' | 'completed';
  progress: number;
  metricType?: string;
  targetValue?: number;
  currentValue?: number;
}

export interface SkillAssessment {
  id: number;
  employeeId: number;
  skillName: string;
  category: 'technical' | 'soft' | 'leadership' | 'domain';
  rating: number;
  assessmentDate: string;
  assessorId?: number;
  comments?: string;
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
}
