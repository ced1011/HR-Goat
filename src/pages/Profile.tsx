
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-custom/Card';
import Button from '@/components/ui-custom/Button';
import { FadeIn, SlideIn } from '@/components/ui-custom/Animations';
import { apiService, Employee } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  FileText,
  CheckCircle,
  Edit,
  Clock,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setIsLoading(true);
        
        if (!id) {
          // If no ID is provided, we're viewing the current user's profile
          // For demo purposes, we'll just use the first employee
          const allEmployees = await apiService.getEmployees();
          if (allEmployees.error) throw new Error(allEmployees.error);
          
          setEmployee(allEmployees.data[0]);
        } else {
          const response = await apiService.getEmployeeById(Number(id));
          if (response.error) throw new Error(response.error);
          
          setEmployee(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch employee:', error);
        toast.error('Failed to load profile', {
          description: 'Please try again later'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployee();
  }, [id]);
  
  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="h-10 w-48 bg-hr-silver/20 rounded-md animate-pulse" />
          <div className="h-64 bg-white rounded-xl shadow-sm border border-hr-silver/10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-white rounded-xl shadow-sm border border-hr-silver/10 animate-pulse" />
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
          <h2 className="text-2xl font-semibold">Profile Not Found</h2>
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
          <h1 className="text-2xl font-semibold tracking-tight">Employee Profile</h1>
        </SlideIn>
        <SlideIn direction="up" duration={400} delay={100}>
          <p className="text-hr-text-secondary">
            View and manage employee information.
          </p>
        </SlideIn>
      </div>
      
      <FadeIn delay={200}>
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-40 bg-gradient-to-r from-hr-blue to-hr-blue-light">
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          
          <div className="px-6 pb-6 flex flex-col md:flex-row">
            <div className="flex flex-col md:flex-row items-center -mt-16 md:-mt-12">
              <div className="relative">
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-32 h-32 rounded-xl object-cover shadow-apple-md border-4 border-white"
                />
                <div className={cn(
                  "absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white",
                  employee.status === 'active' ? 'bg-green-500' : 
                  employee.status === 'onleave' ? 'bg-amber-500' : 'bg-red-500'
                )} />
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                <h2 className="text-2xl font-semibold">{employee.name}</h2>
                <p className="text-lg text-hr-text-secondary">{employee.position}</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                  <span className="inline-flex items-center px-2.5 py-0.5 bg-hr-silver/10 text-sm rounded-full">
                    {employee.department}
                  </span>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 text-sm rounded-full",
                    employee.status === 'active' ? 'bg-green-50 text-green-600' : 
                    employee.status === 'onleave' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                  )}>
                    {employee.status === 'active' ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : employee.status === 'onleave' ? (
                      <Clock className="mr-1 h-3 w-3" />
                    ) : (
                      <span className="mr-1">⚠️</span>
                    )}
                    <span className="capitalize">{employee.status}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center md:justify-end mt-6 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                icon={<Edit className="h-4 w-4" />}
                className="mr-2"
              >
                Edit Profile
              </Button>
              <Button
                variant="primary"
                size="sm"
              >
                View Performance
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SlideIn direction="up" delay={300} className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-hr-text-secondary mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-hr-text-secondary">Email</p>
                      <p className="font-medium">{employee.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-hr-text-secondary mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-hr-text-secondary">Phone</p>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-hr-text-secondary mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-hr-text-secondary">Location</p>
                      <p className="font-medium">{employee.location}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-hr-text-secondary mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-hr-text-secondary">Hire Date</p>
                      <p className="font-medium">{new Date(employee.hireDate).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'long', day: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-hr-text-secondary mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-hr-text-secondary">Manager</p>
                      <p className="font-medium">{employee.manager || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 text-hr-text-secondary mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-hr-text-secondary">Salary</p>
                      <p className="font-medium">
                        {employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-hr-text-secondary mb-2">Bio</h4>
                <p className="text-sm">{employee.bio || 'No bio available.'}</p>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
        
        <SlideIn direction="up" delay={400}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { icon: FileText, color: 'bg-blue-50 text-blue-600', title: 'Submitted Monthly Report', time: '2 days ago' },
                  { icon: Award, color: 'bg-purple-50 text-purple-600', title: 'Earned Performance Badge', time: '1 week ago' },
                  { icon: Calendar, color: 'bg-amber-50 text-amber-600', title: 'Requested Time Off', time: '2 weeks ago' },
                ].map((activity, i) => (
                  <div key={i} className="flex">
                    <div className={cn("p-2 rounded-lg mr-3 flex-shrink-0", activity.color)}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-hr-text-secondary mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
      
      <SlideIn direction="up" delay={500}>
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="text-center py-10">
              <FileText className="h-10 w-10 mx-auto text-hr-text-secondary mb-2" />
              <p className="text-hr-text-secondary">
                Performance data visualization will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </SlideIn>
    </PageContainer>
  );
};

export default ProfilePage;
