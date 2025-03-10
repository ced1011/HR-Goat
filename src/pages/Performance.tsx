
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
  LineChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PerformancePage = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [skills, setSkills] = useState<SkillAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        let employeeId: number;
        
        if (!id) {
          // If no ID is provided, we're viewing the current user's profile
          // For demo purposes, we'll just use the first employee
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
        
        // Fetch performance data
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
        console.error('Failed to fetch performance data:', error);
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
        progress: newProgress,
        currentValue: newProgress, // Simplified for demo
        status: newProgress >= 100 ? 'completed' : 'inprogress'
      });
      
      if (response.error) throw new Error(response.error);
      
      // Update local state
      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, ...response.data } : goal
      ));
      
      toast.success('Goal progress updated', {
        description: 'Your progress has been saved'
      });
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast.error('Failed to update goal', {
        description: 'Please try again'
      });
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
      
      <Tabs defaultValue="goals" className="mb-6">
        <TabsList className="mb-6">
          <TabsTrigger value="goals" className="flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center">
            <Trophy className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Skills
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="goals" className="space-y-6">
          <FadeIn delay={200}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-hr-blue" />
                  <span>Performance Goals</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={() => toast.info('Add Goal', { description: 'This would open the add goal dialog' })}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Goal
                </Button>
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
                              goal.category === 'professional' ? "bg-blue-50 text-hr-blue" :
                              goal.category === 'personal' ? "bg-amber-50 text-amber-600" :
                              "bg-purple-50 text-purple-600"
                            )}>
                              {goal.category === 'professional' ? (
                                <Clipboard className="h-4 w-4" />
                              ) : goal.category === 'personal' ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Users className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{goal.title}</h4>
                              <div className="flex items-center text-xs text-hr-text-secondary mt-0.5">
                                <span className="capitalize">{goal.category}</span>
                                <span className="mx-1">•</span>
                                <span>Due {new Date(goal.targetDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}</span>
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "px-2 py-0.5 text-xs rounded-full",
                            goal.status === 'completed' ? "bg-green-50 text-green-600" :
                            goal.status === 'inprogress' ? "bg-blue-50 text-hr-blue" :
                            "bg-hr-silver/10 text-hr-text-secondary"
                          )}>
                            <span className="capitalize">{goal.status === 'notstarted' ? 'Not Started' : goal.status}</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm mb-4">{goal.description}</p>
                          
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-hr-text-secondary">Progress</span>
                            <span className="text-xs font-medium">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="mb-3" />
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-hr-text-secondary">
                              {goal.metricType && (
                                <span>
                                  {goal.currentValue} of {goal.targetValue} {goal.metricType}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateGoalProgress(goal.id, Math.min(100, goal.progress + 10))}
                                disabled={goal.progress >= 100}
                              >
                                Update Progress
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Pencil className="h-3 w-3" />}
                                onClick={() => toast.info('Edit Goal', { description: 'This would open the edit goal dialog' })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Target className="h-10 w-10 mx-auto text-hr-text-secondary mb-2" />
                    <p className="text-hr-text-secondary">No goals set yet.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => toast.info('Add Goal', { description: 'This would open the add goal dialog' })}
                    >
                      Create Your First Goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
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
    </PageContainer>
  );
};

export default PerformancePage;
