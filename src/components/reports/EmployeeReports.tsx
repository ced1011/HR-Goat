import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, PieChart, Users } from 'lucide-react';

// Mock data for employee reports
const departmentDistribution = [
  { department: 'Engineering', count: 24 },
  { department: 'Marketing', count: 12 },
  { department: 'Sales', count: 18 },
  { department: 'HR', count: 6 },
  { department: 'Finance', count: 8 },
  { department: 'Operations', count: 10 },
];

const locationDistribution = [
  { location: 'New York', count: 30 },
  { location: 'San Francisco', count: 25 },
  { location: 'Chicago', count: 15 },
  { location: 'Remote', count: 8 },
];

const tenureDistribution = [
  { range: '0-1 years', count: 15 },
  { range: '1-3 years', count: 22 },
  { range: '3-5 years', count: 18 },
  { range: '5-10 years', count: 12 },
  { range: '10+ years', count: 5 },
];

const EmployeeReports = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="distribution">
        <TabsList className="mb-4">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="turnover">Turnover</TabsTrigger>
        </TabsList>
        
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Department Distribution</CardTitle>
                <CardDescription>Employee count by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="w-full">
                    {departmentDistribution.map((item) => (
                      <div key={item.department} className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.department}</span>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${(item.count / Math.max(...departmentDistribution.map(d => d.count))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Location Distribution</CardTitle>
                <CardDescription>Employee count by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="w-full">
                    {locationDistribution.map((item) => (
                      <div key={item.location} className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.location}</span>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${(item.count / Math.max(...locationDistribution.map(d => d.count))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tenure Distribution</CardTitle>
              <CardDescription>Employee count by years at company</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60 flex items-center justify-center">
                <div className="w-full">
                  {tenureDistribution.map((item) => (
                    <div key={item.range} className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.range}</span>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...tenureDistribution.map(d => d.count))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="demographics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demographics Data</CardTitle>
              <CardDescription>This feature is coming soon</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Demographics Report</h3>
                <p className="text-muted-foreground">
                  Detailed demographics data will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="turnover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Turnover Analysis</CardTitle>
              <CardDescription>This feature is coming soon</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center">
                <BarChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Turnover Report</h3>
                <p className="text-muted-foreground">
                  Detailed turnover analysis will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeReports; 