import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-custom/Card';
import Button from '@/components/ui-custom/Button';
import { FadeIn, SlideIn } from '@/components/ui-custom/Animations';
import { apiService, performanceApiService, Employee, PerformanceReview, PerformanceGoal, SkillAssessment } from '@/lib/api';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Target,
  BarChart,
  Star,
  CheckCircle,
  Clock,
  Calendar,
  ChevronRight,
  User,
  Pencil,
  Clipboard,
  PlusCircle,
  LineChart,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import GoalForm from '@/components/performance/GoalForm';

const PerformancePage = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [skills, setSkills] = useState<SkillAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        let employeeId: number;
        
        if (!id) {
          const allEmployees = await apiService.getEmployees();
          if (allEmployees.error) throw new Error(allEmployees.error);
          
          setEmployee(allEmployees.data[0]);
          employeeId = allEmployees.data[0].id;
        } else {
          const response = await apiService.getEmployeeById(Number(id));
          if (response.error) throw new Error(response.error);
          
          setEmployee(response.data);
          employeeId = response.data.id;
        }
        
        const [reviewsRes, goalsRes, skillsRes] = await Promise.all([
          performanceApiService.getEmployeeReviews(employeeId),
          performanceApiService.getEmployeeGoals(employeeId),
          performanceApiService.getEmployeeSkills(employeeId)
        ]);
        
        if (reviewsRes.error) throw new Error(reviewsRes.error);
        if (goalsRes.error) throw new Error(goalsRes.error);
        if (skillsRes.error) throw new Error(skillsRes.error);
        
        setReviews(reviewsRes.data);
        setGoals(goalsRes.data);
        setSkills(skillsRes.data);
      } catch (error) {
        console.error('Failed to fetch performance information:', error);
        toast.error('Failed to load performance information', {
          description: 'Please try again later'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleUpdateGoalProgress = async (goalId: number, newProgress: number) => {
    try {
      const response = await performanceApiService.updateGoal(goalId, {
        progress: newProgress
      });
      
      if (response.error) throw new Error(response.error);
      
      setGoals(goals.map(goal =>
        goal.id === goalId ? { ...goal, progress: newProgress } : goal
      ));
      
      toast.success('Goal progress updated');
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast.error('Failed to update goal progress', {
        description: 'Please try again later'
      });
    }
  };
  
  const handleGoalCreated = async () => {
    if (!employee) return;
    
    try {
      const response = await performanceApiService.getEmployeeGoals(employee.id);
      if (response.error) throw new Error(response.error);
      
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to refresh goals:', error);
    }
  };
  
  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="h-10 w-48 bg-hr-silver/20 rounded-md animate-pulse" />
          <div className="h-64 bg-white rounded-xl shadow-sm border border-hr-silver/10 animate-pulse" />
          <div className="grid grid-cols-1 gap-6">
            <div className="h-48 bg-white rounded-xl shadow-sm border border-hr-silver/10 animate-pulse" />
          </div>
        </div>
      </PageContainer>
    );
  }
  
  if (!employee) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">Employee Not Found</h2>
          <p className="text-hr-text-secondary mt-2">
            The employee profile you're looking for doesn't exist.
          </p>
          <Button
            variant="primary"
            className="mt-6"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <div className="space-y-1 mb-6">
        <SlideIn direction="up" duration={400}>
          <h1 className="text-2xl font-semibold tracking-tight">Performance Management</h1>
        </SlideIn>
        <SlideIn direction="up" duration={400} delay={100}>
          <p className="text-hr-text-secondary">
            Track goals, reviews, and skill development.
          </p>
        </SlideIn>
      </div>
      
      <FadeIn delay={200}>
        <Tabs defaultValue="goals" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="goals" className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center">
              <Clipboard className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Skills
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-hr-blue" />
                    <span>Performance Goals</span>
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsGoalFormOpen(true)}
                    className="flex items-center"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {goals.length > 0 ? (
                  <div className="space-y-6">
                    {goals.map((goal) => (
                      <div key={goal.id} className="border border-hr-silver/10 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between bg-hr-silver/5 p-3">
                          <div className="flex items-center">
                            <div className={cn(
                              "p-2 rounded-lg mr-3",
                              goal.category === 'personal' ? "bg-purple-50 text-purple-600" :
                              goal.category === 'professional' ? "bg-blue-50 text-blue-600" :
                              "bg-green-50 text-green-600"
                            )}>
                              {goal.category === 'personal' ? (
                                <User className="h-4 w-4" />
                              ) : goal.category === 'professional' ? (
                                <Trophy className="h-4 w-4" />
                              ) : (
                                <Users className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{goal.title}</h4>
                              <p className="text-xs text-hr-text-secondary">
                                Target: {new Date(goal.targetDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className={cn(
                            "px-2 py-0.5 text-xs rounded-full",
                            goal.status === 'completed' ? "bg-green-50 text-green-600" :
                            goal.status === 'inprogress' ? "bg-blue-50 text-blue-600" :
                            goal.status === 'notstarted' ? "bg-gray-50 text-gray-600" :
                            "bg-red-50 text-red-500"
                          )}>
                            <span className="capitalize">
                              {goal.status === 'inprogress' ? 'In Progress' : goal.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          {goal.description && (
                            <p className="text-sm mb-3">{goal.description}</p>
                          )}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                            <div className="flex justify-between mt-2">
                              <div className="text-xs text-hr-text-secondary">
                                <span className="font-medium">Metric:</span> {goal.metricType}
                                {goal.metricType !== 'completion' && (
                                  <span> ({goal.currentValue}/{goal.targetValue})</span>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateGoalProgress(goal.id, Math.max(0, goal.progress - 10))}
                                  disabled={goal.progress <= 0}
                                >
                                  -10%
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateGoalProgress(goal.id, Math.min(100, goal.progress + 10))}
                                  disabled={goal.progress >= 100}
                                >
                                  +10%
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto text-hr-silver mb-2" />
                    <p className="text-hr-text-secondary">No goals set yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsGoalFormOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Your First Goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-6">
            <FadeIn delay={200}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-hr-blue" />
                    <span>Performance Reviews</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Review History', { description: 'This would show complete review history' })}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border border-hr-silver/10 rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between bg-hr-silver/5 p-3">
                            <div className="flex items-center">
                              <div className="p-2 rounded-lg mr-3 bg-blue-50 text-hr-blue">
                                <Calendar className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="font-medium">Performance Review</h4>
                                <div className="flex items-center text-xs text-hr-text-secondary mt-0.5">
                                  <span>{new Date(review.periodStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {new Date(review.periodEnd).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                              </div>
                            </div>
                            <div className={cn(
                              "px-2 py-0.5 text-xs rounded-full",
                              review.status === 'completed' ? "bg-green-50 text-green-600" :
                              review.status === 'submitted' ? "bg-amber-50 text-amber-600" :
                              "bg-blue-50 text-hr-blue"
                            )}>
                              <span className="capitalize">{review.status}</span>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <img
                                  src={review.reviewer?.avatar}
                                  alt={review.reviewer?.name}
                                  className="w-8 h-8 rounded-full mr-2"
                                />
                                <div>
                                  <div className="text-sm font-medium">{review.reviewer?.name}</div>
                                  <div className="text-xs text-hr-text-secondary">{review.reviewer?.position}</div>
                                </div>
                              </div>
                              <div className="flex items-center bg-hr-silver/10 px-2 py-1 rounded-lg">
                                <Star className="h-3 w-3 text-amber-500 mr-1" />
                                <span className="text-sm font-medium">{review.overallRating.toFixed(1)}</span>
                                <span className="text-xs text-hr-text-secondary ml-1">/5</span>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <h5 className="text-sm font-medium mb-1">Strengths</h5>
                                <p className="text-sm text-hr-text-secondary">{review.strengths}</p>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium mb-1">Areas for Improvement</h5>
                                <p className="text-sm text-hr-text-secondary">{review.areasOfImprovement}</p>
                              </div>
                              
                              {review.comments && (
                                <div>
                                  <h5 className="text-sm font-medium mb-1">Additional Comments</h5>
                                  <p className="text-sm text-hr-text-secondary">{review.comments}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4 flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.info('Review Details', { description: 'This would show full review details' })}
                              >
                                View Full Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Trophy className="h-10 w-10 mx-auto text-hr-text-secondary mb-2" />
                      <p className="text-hr-text-secondary">No performance reviews available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>
          
          <TabsContent value="skills" className="space-y-6">
            <FadeIn delay={200}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-hr-blue" />
                    <span>Skill Assessment</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Skill Development', { description: 'This would open skill development resources' })}
                  >
                    Development Resources
                  </Button>
                </CardHeader>
                <CardContent>
                  {skills.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="aspect-[4/3] flex items-center justify-center bg-hr-silver/5 rounded-lg">
                          <div className="text-center p-8">
                            <LineChart className="h-8 w-8 mx-auto text-hr-text-secondary mb-2" />
                            <p className="text-sm text-hr-text-secondary">
                              Skills radar chart visualization will appear here
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Skill Rating Summary</h4>
                          
                          <div className="border border-hr-silver/10 rounded-lg p-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Technical Skills</span>
                              <span className="font-medium">4.3 / 5</span>
                            </div>
                            <Progress value={86} className="mb-3" />
                            
                            <div className="flex justify-between text-sm mb-1">
                              <span>Soft Skills</span>
                              <span className="font-medium">4.0 / 5</span>
                            </div>
                            <Progress value={80} className="mb-3" />
                            
                            <div className="flex justify-between text-sm mb-1">
                              <span>Leadership</span>
                              <span className="font-medium">3.7 / 5</span>
                            </div>
                            <Progress value={74} />
                          </div>
                          
                          <div className="text-right">
                            <Button
                              variant="link"
                              size="sm"
                              className="text-hr-blue"
                              onClick={() => toast.info('Self Assessment', { description: 'This would open the self assessment form' })}
                            >
                              Complete Self-Assessment
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Individual Skill Ratings</h4>
                        <div className="space-y-3">
                          {skills.map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between bg-hr-silver/5 p-3 rounded-lg">
                              <div className="flex items-center">
                                <div className={cn(
                                  "p-2 rounded-lg mr-3",
                                  skill.category === 'technical' ? "bg-blue-50 text-hr-blue" :
                                  skill.category === 'soft' ? "bg-green-50 text-green-600" :
                                  skill.category === 'leadership' ? "bg-purple-50 text-purple-600" :
                                  "bg-amber-50 text-amber-600"
                                )}>
                                  <Star className="h-4 w-4" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-sm">{skill.skillName}</h5>
                                  <p className="text-xs text-hr-text-secondary capitalize">{skill.category} skill</p>
                                </div>
                              </div>
                              <div className="flex items-center bg-white px-2 py-1 rounded-lg shadow-sm">
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-3 w-3",
                                        i < Math.floor(skill.rating) ? "text-amber-500" : "text-hr-silver/30",
                                        i === Math.floor(skill.rating) && skill.rating % 1 > 0 ? "text-amber-500 opacity-50" : ""
                                      )}
                                      fill={i < Math.floor(skill.rating) || (i === Math.floor(skill.rating) && skill.rating % 1 > 0) ? "currentColor" : "none"}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-medium ml-1">{skill.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Star className="h-10 w-10 mx-auto text-hr-text-secondary mb-2" />
                      <p className="text-hr-text-secondary">No skill assessments available.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => toast.info('Skill Assessment', { description: 'This would open the skill assessment form' })}
                      >
                        Start Skill Assessment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>
        </Tabs>
      </FadeIn>
      
      {/* Goal Form Dialog */}
      {employee && (
        <GoalForm 
          isOpen={isGoalFormOpen}
          onClose={() => setIsGoalFormOpen(false)}
          employeeId={employee.id}
          onGoalCreated={handleGoalCreated}
        />
      )}
    </PageContainer>
  );
};

export default PerformancePage;

