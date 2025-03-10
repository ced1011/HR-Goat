import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BarChart, LineChart } from 'lucide-react';

// Mock data for performance reports
const departmentPerformance = [
  { department: 'Engineering', averageRating: 4.2 },
  { department: 'Marketing', averageRating: 3.9 },
  { department: 'Sales', averageRating: 4.1 },
  { department: 'HR', averageRating: 4.3 },
  { department: 'Finance', averageRating: 4.0 },
  { department: 'Operations', averageRating: 3.8 },
];

const performanceTrends = [
  { quarter: 'Q1 2023', averageRating: 3.8 },
  { quarter: 'Q2 2023', averageRating: 3.9 },
  { quarter: 'Q3 2023', averageRating: 4.0 },
  { quarter: 'Q4 2023', averageRating: 4.1 },
  { quarter: 'Q1 2024', averageRating: 4.2 },
];

const skillGaps = [
  { skill: 'Leadership', currentAvg: 3.5, targetAvg: 4.2 },
  { skill: 'Technical', currentAvg: 4.1, targetAvg: 4.5 },
  { skill: 'Communication', currentAvg: 3.8, targetAvg: 4.3 },
  { skill: 'Problem Solving', currentAvg: 4.0, targetAvg: 4.4 },
  { skill: 'Teamwork', currentAvg: 4.2, targetAvg: 4.5 },
];

const PerformanceReports = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Department Performance</CardTitle>
              <CardDescription>Average performance rating by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="w-full">
                  {departmentPerformance.map((item) => (
                    <div key={item.department} className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.department}</span>
                        <span className="text-sm font-medium">{item.averageRating.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${(item.averageRating / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Performers</CardTitle>
                <CardDescription>Employees with highest ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <p className="font-medium">Sarah Johnson</p>
                        <p className="text-sm text-muted-foreground">Product Design</p>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                      4.9
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <p className="font-medium">Michael Chen</p>
                        <p className="text-sm text-muted-foreground">Engineering</p>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                      4.8
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <p className="font-medium">Emily Rodriguez</p>
                        <p className="text-sm text-muted-foreground">Sales</p>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                      4.7
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Performance Distribution</CardTitle>
                <CardDescription>Employee count by rating range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Outstanding (4.5-5.0)</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Exceeds Expectations (4.0-4.4)</span>
                      <span className="text-sm font-medium">28</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Meets Expectations (3.0-3.9)</span>
                      <span className="text-sm font-medium">32</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Needs Improvement (2.0-2.9)</span>
                      <span className="text-sm font-medium">6</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Unsatisfactory (0-1.9)</span>
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '2%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Average performance rating over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="w-full">
                <div className="flex items-end h-60 w-full">
                  {performanceTrends.map((item, index) => (
                    <div key={item.quarter} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-12 bg-primary rounded-t-md" 
                        style={{ height: `${(item.averageRating / 5) * 200}px` }}
                      ></div>
                      <div className="mt-2 text-xs text-center">{item.quarter}</div>
                      <div className="mt-1 text-xs font-medium">{item.averageRating.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills Gap Analysis</CardTitle>
              <CardDescription>Current vs. target skill levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skillGaps.map((item) => (
                  <div key={item.skill} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.skill}</span>
                      <span className="text-sm text-muted-foreground">
                        Current: {item.currentAvg.toFixed(1)} / Target: {item.targetAvg.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700 relative">
                      <div 
                        className="h-4 bg-primary rounded-full" 
                        style={{ width: `${(item.currentAvg / 5) * 100}%` }}
                      ></div>
                      <div 
                        className="absolute top-0 h-4 w-0.5 bg-red-500" 
                        style={{ left: `${(item.targetAvg / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Gap: {(item.targetAvg - item.currentAvg).toFixed(1)} points
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceReports; 