
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
  Mail
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
  ];
  
  return (
    <PageContainer>
      <div className="space-y-1 mb-6">
        <SlideIn direction="up" duration={400}>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        </SlideIn>
        <SlideIn direction="up" duration={400} delay={100}>
          <p className="text-hr-text-secondary">
            Welcome back! Here's what's happening.
          </p>
        </SlideIn>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StaggeredContainer staggerDelay={100}>
          {stats.map((stat, index) => (
            <SlideIn key={stat.title} delay={index * 100} direction="up">
              <Card hover className="h-full" onClick={() => console.log(`Navigate to ${stat.title}`)}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-hr-text-secondary">{stat.title}</p>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <h3 className="text-2xl font-semibold">{stat.value}</h3>
                      <span className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded-full",
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
        <div className="col-span-1 lg:col-span-2">
          <FadeIn delay={400}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Performance Overview</CardTitle>
                <Button variant="outline" size="sm">
                  View Report
                </Button>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="aspect-[4/2] flex items-center justify-center bg-hr-silver/5 rounded-lg">
                  <div className="text-center p-8">
                    <LineChart className="h-8 w-8 mx-auto text-hr-text-secondary mb-2" />
                    <p className="text-sm text-hr-text-secondary">
                      Performance data visualization will appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
        
        <div>
          <SlideIn direction="up" delay={500}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activities</CardTitle>
                <Button variant="ghost" size="sm" className="text-hr-blue">
                  See all
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex">
                      <div className={cn("p-2 rounded-lg mr-3", activity.color)}>
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SlideIn direction="up" delay={600}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Announcements</CardTitle>
              <Button variant="ghost" size="sm" className="text-hr-blue">
                All announcements
              </Button>
            </CardHeader>
            <CardContent className="pb-2">
              {announcements.map(announcement => (
                <div 
                  key={announcement.id} 
                  className="mb-4 pb-4 border-b border-hr-silver/10 last:border-0 last:pb-0"
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
                    <span className="text-xs text-hr-text-secondary">
                      {announcement.date}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </SlideIn>
        
        <SlideIn direction="up" delay={700}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>New Team Members</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-hr-blue"
                onClick={() => navigate('/employees')}
              >
                <span>View all</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="mr-3 relative">
                      <img
                        src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${24 + i}.jpg`}
                        alt="Employee avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">
                        {['Alex Morgan', 'Jamie Chen', 'Taylor Swift'][i]}
                      </h4>
                      <p className="text-xs text-hr-text-secondary">
                        {['Product Designer', 'Software Engineer', 'Marketing Specialist'][i]}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-hr-text-secondary">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
