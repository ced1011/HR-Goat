
import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-custom/Card';
import { FadeIn, SlideIn, StaggeredContainer } from '@/components/ui-custom/Animations';
import Button from '@/components/ui-custom/Button';
import { 
  Users, 
  Calendar, 
  BriefcaseBusiness, 
  LineChart, 
  Activity,
  FileCheck,
  Clock,
  ChevronRight,
  BellRing,
  Mail,
  TrendingUp,
  Award,
  CheckCircle,
  TrendingDown,
  Target,
  DollarSign,
  Percent,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Mock data
  const stats = [
    { 
      title: 'Total Employees', 
      value: '248', 
      change: '+12', 
      icon: Users, 
      color: 'bg-blue-50 text-hr-blue' 
    },
    { 
      title: 'Open Positions', 
      value: '15', 
      change: '+3', 
      icon: BriefcaseBusiness, 
      color: 'bg-purple-50 text-purple-600' 
    },
    { 
      title: 'Time Off Requests', 
      value: '8', 
      change: '-2', 
      icon: Calendar, 
      color: 'bg-amber-50 text-amber-600' 
    },
    { 
      title: 'Documents Pending', 
      value: '12', 
      change: '+5', 
      icon: FileCheck, 
      color: 'bg-green-50 text-green-600' 
    },
    { 
      title: 'Departments', 
      value: '7', 
      change: '+1', 
      icon: Building, 
      color: 'bg-cyan-50 text-cyan-600' 
    },
    { 
      title: 'Training Completion', 
      value: '86%', 
      change: '+4%', 
      icon: Target, 
      color: 'bg-pink-50 text-pink-600' 
    },
    { 
      title: 'Monthly Budget', 
      value: '$138K', 
      change: '-5%', 
      icon: DollarSign, 
      color: 'bg-indigo-50 text-indigo-600' 
    },
    { 
      title: 'Retention Rate', 
      value: '92%', 
      change: '+2%', 
      icon: Percent, 
      color: 'bg-emerald-50 text-emerald-600' 
    },
  ];
  
  const activities = [
    { 
      id: 1, 
      title: 'Performance Review Due', 
      description: 'Your annual review is scheduled for next week', 
      time: '2 days ago', 
      icon: Activity, 
      color: 'bg-blue-50 text-hr-blue'
    },
    { 
      id: 2, 
      title: 'Time Off Approved', 
      description: 'Your vacation request has been approved', 
      time: '3 days ago', 
      icon: Clock, 
      color: 'bg-green-50 text-green-600'
    },
    { 
      id: 3, 
      title: 'New Company Policy', 
      description: 'Updated remote work policy is now available', 
      time: '1 week ago', 
      icon: FileCheck, 
      color: 'bg-amber-50 text-amber-600'
    },
  ];
  
  const announcements = [
    {
      id: 1,
      title: 'Company All-Hands Meeting',
      description: 'Join us for the quarterly company meeting on Friday at 2 PM.',
      date: 'Jun 10',
    },
    {
      id: 2,
      title: 'New Health Benefits',
      description: 'We\'ve updated our health benefits package for the upcoming year.',
      date: 'Jun 05',
    },
    {
      id: 3,
      title: 'Office Closure',
      description: 'The office will be closed on Monday for the national holiday.',
      date: 'Jun 15',
    },
    {
      id: 4,
      title: 'Team Building Event',
      description: 'Join us for team building activities next Thursday afternoon.',
      date: 'Jun 20',
    },
  ];

  // Performance data for visualization
  const performanceData = [
    { month: 'Jan', productivity: 83 },
    { month: 'Feb', productivity: 85 },
    { month: 'Mar', productivity: 82 },
    { month: 'Apr', productivity: 89 },
    { month: 'May', productivity: 92 },
    { month: 'Jun', productivity: 90 },
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Alex Morgan',
      position: 'Product Designer',
      avatar: 'https://randomuser.me/api/portraits/men/24.jpg',
      online: true
    },
    {
      id: 2,
      name: 'Jamie Chen',
      position: 'Software Engineer',
      avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
      online: true
    },
    {
      id: 3,
      name: 'Taylor Swift',
      position: 'Marketing Specialist',
      avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
      online: true
    },
    {
      id: 4,
      name: 'Chris Brown',
      position: 'UI/UX Designer',
      avatar: 'https://randomuser.me/api/portraits/men/27.jpg',
      online: false
    },
    {
      id: 5,
      name: 'Sarah Johnson',
      position: 'HR Coordinator',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      online: true
    },
    {
      id: 6,
      name: 'Michael Park',
      position: 'Data Analyst',
      avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
      online: false
    }
  ];
  
  return (
    <PageContainer>
      <div className="space-y-1 mb-6">
        <SlideIn direction="up" duration={400}>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <div className="text-sm text-hr-text-secondary bg-hr-silver/10 px-3 py-1.5 rounded-full">
              🔔 New Team Members and Announcements sections expanded
            </div>
          </div>
        </SlideIn>
        <SlideIn direction="up" duration={400} delay={100}>
          <p className="text-hr-text-secondary">
            Welcome back! Here's what's happening today.
          
          </p>
        </SlideIn>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">       
        {/* Announcements - Expanded */}
        <SlideIn direction="up" delay={700}>
          <Card className="h-full bg-white shadow-apple-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-lg font-semibold">Announcements</CardTitle>
              <Button variant="ghost" size="sm" className="text-hr-blue">
                All announcements
              </Button>
            </CardHeader>
            <CardContent className="py-4">
              {announcements.map(announcement => (
                <div 
                  key={announcement.id} 
                  className="mb-4 pb-4 border-b border-hr-silver/10 last:border-0 last:pb-0 hover:bg-hr-silver/5 p-3 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="bg-blue-50 p-2 rounded-lg mr-3">
                        <BellRing className="h-4 w-4 text-hr-blue" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{announcement.title}</h4>
                        <p className="text-xs text-hr-text-secondary mt-1">
                          {announcement.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium bg-hr-silver/10 px-2 py-1 rounded-full text-hr-text-secondary">
                      {announcement.date}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </SlideIn>
      </div>
      {/* First row: stat cards in a responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StaggeredContainer staggerDelay={100}>
          {stats.map((stat, index) => (
            <SlideIn key={stat.title} delay={index * 100} direction="up">
              <Card hover className="h-full bg-white shadow-apple-sm hover:shadow-apple-md">
                <CardContent className="p-5 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-hr-text-secondary font-medium">{stat.title}</p>
                    <div className="flex items-baseline space-x-2 mt-1.5">
                      <h3 className="text-2xl font-semibold">{stat.value}</h3>
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      )}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-lg", stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          ))}
        </StaggeredContainer>
        
      </div>
      
      
      {/* Second row: 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Performance Overview - 2 column wide */}
        <FadeIn delay={400} className="lg:col-span-2">
          <Card className="h-full bg-white shadow-apple-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-lg font-semibold">Performance Overview</CardTitle>
              <Button variant="outline" size="sm" className="text-hr-blue border-hr-blue hover:bg-hr-blue/5">
                View Details
              </Button>
            </CardHeader>
            <CardContent className="pb-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50/50 rounded-lg p-4 flex items-center space-x-4">
                  <div className="bg-hr-blue/10 p-3 rounded-full">
                    <TrendingUp className="h-5 w-5 text-hr-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-hr-text-secondary">Productivity</p>
                    <h4 className="text-xl font-semibold">92%</h4>
                  </div>
                </div>
                <div className="bg-green-50/50 rounded-lg p-4 flex items-center space-x-4">
                  <div className="bg-green-500/10 p-3 rounded-full">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-hr-text-secondary">Goal Completion</p>
                    <h4 className="text-xl font-semibold">87%</h4>
                  </div>
                </div>
                <div className="bg-purple-50/50 rounded-lg p-4 flex items-center space-x-4">
                  <div className="bg-purple-500/10 p-3 rounded-full">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-hr-text-secondary">Tasks Completed</p>
                    <h4 className="text-xl font-semibold">148</h4>
                  </div>
                </div>
              </div>
              <div className="aspect-[4/2] flex flex-col justify-center bg-hr-silver/5 rounded-lg p-4">
                <div className="h-40 w-full">
                  <div className="h-full flex items-end space-x-2 justify-around">
                    {performanceData.map((item) => (
                      <div key={item.month} className="flex flex-col items-center">
                        <div className="relative w-12">
                          <div 
                            className="w-12 bg-hr-blue rounded-t-md transition-all duration-500"
                            style={{ height: `${item.productivity}px` }}
                          ></div>
                        </div>
                        <span className="text-xs mt-2 text-hr-text-secondary">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm text-hr-text-secondary">Performance Trend - Last 6 Months</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
        
        {/* Recent Activities */}
        <SlideIn direction="up" delay={500}>
          <Card className="h-full bg-white shadow-apple-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
              <Button variant="ghost" size="sm" className="text-hr-blue">
                See all
              </Button>
            </CardHeader>
            <CardContent className="px-4 py-4">
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex p-3 rounded-lg hover:bg-hr-silver/5 transition-colors">
                    <div className={cn("p-2 rounded-lg mr-3 self-start", activity.color)}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{activity.title}</h4>
                      <p className="text-xs text-hr-text-secondary mt-0.5">{activity.description}</p>
                      <p className="text-xs text-hr-text-secondary mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
      
      {/* Third row: 2-column layout with expanded sections */}

    </PageContainer>
  );
};

export default Dashboard;
