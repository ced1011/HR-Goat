
import { toast } from 'sonner';
import { ApiResponse, PerformanceReview, PerformanceGoal, SkillAssessment } from '../api-models';

// Mock data for performance
const mockPerformanceReviews: PerformanceReview[] = [
  {
    id: 1,
    employeeId: 1,
    reviewerId: 4,
    periodStart: '2023-01-01',
    periodEnd: '2023-06-30',
    submissionDate: '2023-07-15',
    status: 'completed',
    overallRating: 4.2,
    strengths: 'Strong technical skills, excellent team player, proactive problem solver.',
    areasOfImprovement: 'Could improve documentation practices and sometimes struggles with deadlines on larger projects.',
    comments: 'John has been a valuable asset to the engineering team this past half-year. His contributions to the new product launch were significant.',
    reviewer: {
      id: 4,
      name: 'Sarah Williams',
      position: 'Design Director',
      avatar: 'https://randomuser.me/api/portraits/women/63.jpg'
    }
  },
  {
    id: 2,
    employeeId: 1,
    reviewerId: 4,
    periodStart: '2022-07-01',
    periodEnd: '2022-12-31',
    submissionDate: '2023-01-10',
    status: 'completed',
    overallRating: 4.0,
    strengths: 'Technical expertise, collaboration with design team, solution-oriented approach.',
    areasOfImprovement: 'Time management and prioritization could be improved.',
    comments: 'John continues to grow as an engineer and has shown improvement in cross-functional collaboration.',
    reviewer: {
      id: 4,
      name: 'Sarah Williams',
      position: 'Design Director',
      avatar: 'https://randomuser.me/api/portraits/women/63.jpg'
    }
  }
];

const mockPerformanceGoals: PerformanceGoal[] = [
  {
    id: 1,
    employeeId: 1,
    title: 'Complete Advanced React Certification',
    description: 'Finish the advanced React course and obtain certification to improve frontend development skills.',
    category: 'professional',
    targetDate: '2023-09-30',
    creationDate: '2023-01-15',
    status: 'inprogress',
    progress: 75,
    metricType: 'completion',
    targetValue: 100,
    currentValue: 75
  },
  {
    id: 2,
    employeeId: 1,
    title: 'Improve Code Review Efficiency',
    description: 'Reduce average time to complete code reviews while maintaining quality feedback.',
    category: 'team',
    targetDate: '2023-12-31',
    creationDate: '2023-01-15',
    status: 'inprogress',
    progress: 60,
    metricType: 'time',
    targetValue: 24,
    currentValue: 36
  },
  {
    id: 3,
    employeeId: 1,
    title: 'Mentor Junior Developer',
    description: 'Provide regular mentoring sessions to help onboard and train the new junior developer.',
    category: 'personal',
    targetDate: '2023-12-31',
    creationDate: '2023-02-01',
    status: 'inprogress',
    progress: 50,
    metricType: 'sessions',
    targetValue: 20,
    currentValue: 10
  }
];

const mockSkillAssessments: SkillAssessment[] = [
  {
    id: 1,
    employeeId: 1,
    skillName: 'React.js',
    category: 'technical',
    rating: 4.5,
    assessmentDate: '2023-07-01',
    assessorId: 4,
    comments: 'Strong expertise in React, consistently delivers high-quality components and solutions.'
  },
  {
    id: 2,
    employeeId: 1,
    skillName: 'Node.js',
    category: 'technical',
    rating: 4.0,
    assessmentDate: '2023-07-01',
    assessorId: 4,
    comments: 'Good understanding of Node.js backend development, continues to improve.'
  },
  {
    id: 3,
    employeeId: 1,
    skillName: 'Team Communication',
    category: 'soft',
    rating: 3.8,
    assessmentDate: '2023-07-01',
    assessorId: 4,
    comments: 'Communicates well with the team, can sometimes be more proactive in updates.'
  },
  {
    id: 4,
    employeeId: 1,
    skillName: 'Problem Solving',
    category: 'soft',
    rating: 4.2,
    assessmentDate: '2023-07-01',
    assessorId: 4,
    comments: 'Excellent problem-solver, approaches challenges with creativity and persistence.'
  }
];

class PerformanceApiService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = '/api/performance';
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
      if (endpoint.startsWith('/reviews/employee/') && method === 'GET') {
        const employeeId = parseInt(endpoint.split('/').pop() || '0');
        responseData = mockPerformanceReviews.filter(r => r.employeeId === employeeId);
      } else if (endpoint.startsWith('/goals/employee/') && method === 'GET') {
        const employeeId = parseInt(endpoint.split('/').pop() || '0');
        responseData = mockPerformanceGoals.filter(g => g.employeeId === employeeId);
      } else if (endpoint.startsWith('/goals/') && method === 'PUT') {
        const goalId = parseInt(endpoint.split('/').pop() || '0');
        const goalIndex = mockPerformanceGoals.findIndex(g => g.id === goalId);
        if (goalIndex >= 0) {
          mockPerformanceGoals[goalIndex] = { ...mockPerformanceGoals[goalIndex], ...data };
          responseData = mockPerformanceGoals[goalIndex];
        } else {
          throw new Error('Goal not found');
        }
      } else if (endpoint.startsWith('/skills/employee/') && method === 'GET') {
        const employeeId = parseInt(endpoint.split('/').pop() || '0');
        responseData = mockSkillAssessments.filter(s => s.employeeId === employeeId);
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
  async getEmployeeReviews(employeeId: number): Promise<ApiResponse<PerformanceReview[]>> {
    return this.request<PerformanceReview[]>(`/reviews/employee/${employeeId}`);
  }
  
  async getEmployeeGoals(employeeId: number): Promise<ApiResponse<PerformanceGoal[]>> {
    return this.request<PerformanceGoal[]>(`/goals/employee/${employeeId}`);
  }
  
  async updateGoal(goalId: number, data: Partial<PerformanceGoal>): Promise<ApiResponse<PerformanceGoal>> {
    return this.request<PerformanceGoal>(`/goals/${goalId}`, 'PUT', data);
  }
  
  async getEmployeeSkills(employeeId: number): Promise<ApiResponse<SkillAssessment[]>> {
    return this.request<SkillAssessment[]>(`/skills/employee/${employeeId}`);
  }
}

export const performanceApiService = new PerformanceApiService();
