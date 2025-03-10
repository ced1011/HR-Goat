import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

// Mock data for attendance reports
const monthlyAttendance = [
  { month: 'Jan', presentPercentage: 96.2, absentPercentage: 3.8 },
  { month: 'Feb', presentPercentage: 95.8, absentPercentage: 4.2 },
  { month: 'Mar', presentPercentage: 94.5, absentPercentage: 5.5 },
  { month: 'Apr', presentPercentage: 96.7, absentPercentage: 3.3 },
  { month: 'May', presentPercentage: 97.1, absentPercentage: 2.9 },
  { month: 'Jun', presentPercentage: 95.3, absentPercentage: 4.7 },
];

const departmentAttendance = [
  { department: 'Engineering', presentPercentage: 96.5, latePercentage: 2.1 },
  { department: 'Marketing', presentPercentage: 95.2, latePercentage: 3.5 },
  { department: 'Sales', presentPercentage: 94.8, latePercentage: 4.2 },
  { department: 'HR', presentPercentage: 97.3, latePercentage: 1.8 },
  { department: 'Finance', presentPercentage: 96.9, latePercentage: 2.3 },
  { department: 'Operations', presentPercentage: 95.6, latePercentage: 3.1 },
];

const leaveDistribution = [
  { type: 'Vacation', days: 450 },
  { type: 'Sick Leave', days: 280 },
  { type: 'Personal', days: 120 },
  { type: 'Maternity/Paternity', days: 180 },
  { type: 'Bereavement', days: 45 },
  { type: 'Unpaid', days: 75 },
];

const AttendanceReports = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="attendance">
        <TabsList className="mb-4">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
          <TabsTrigger value="punctuality">Punctuality</TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Monthly Attendance Rate</CardTitle>
              <CardDescription>Percentage of employees present each month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="w-full">
                  <div className="flex items-end h-60 w-full justify-between">
                    {monthlyAttendance.map((item) => (
                      <div key={item.month} className="flex flex-col items-center">
                        <div className="flex h-52">
                          <div 
                            className="w-12 bg-red-400 rounded-t-none" 
                            style={{ height: `${item.absentPercentage * 2}px` }}
                          ></div>
                          <div 
                            className="w-12 bg-green-400 rounded-t-md" 
                            style={{ height: `${item.presentPercentage * 2}px` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs">{item.month}</div>
                        <div className="mt-1 text-xs font-medium">{item.presentPercentage.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-4 space-x-6">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-xs">Present</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                      <span className="text-xs">Absent</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Overall Attendance</CardTitle>
                <CardDescription>Company-wide statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-40">
                  <div className="text-5xl font-bold text-green-500">96.2%</div>
                  <div className="text-sm text-muted-foreground mt-2">Average Attendance Rate</div>
                  <div className="flex justify-between w-full mt-6">
                    <div className="text-center">
                      <div className="text-xl font-semibold">3.8%</div>
                      <div className="text-xs text-muted-foreground">Absence Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold">2.5%</div>
                      <div className="text-xs text-muted-foreground">Late Arrivals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold">1.2%</div>
                      <div className="text-xs text-muted-foreground">Early Departures</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Department Comparison</CardTitle>
                <CardDescription>Attendance rates by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentAttendance.map((item) => (
                    <div key={item.department}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.department}</span>
                        <span className="text-sm font-medium">{item.presentPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className="bg-green-400 h-2.5 rounded-full" 
                          style={{ width: `${item.presentPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="timeoff" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Distribution</CardTitle>
                <CardDescription>Total days by leave type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="w-full">
                    {leaveDistribution.map((item) => (
                      <div key={item.type} className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.type}</span>
                          <span className="text-sm font-medium">{item.days} days</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className="bg-blue-400 h-2.5 rounded-full" 
                            style={{ width: `${(item.days / Math.max(...leaveDistribution.map(d => d.days))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Time Off</CardTitle>
                <CardDescription>Scheduled leaves in next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <Calendar className="h-10 w-10 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium">12 Employees</p>
                      <p className="text-sm text-muted-foreground">On vacation next week</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <AlertTriangle className="h-10 w-10 text-yellow-500 mr-3" />
                    <div>
                      <p className="font-medium">Engineering Team</p>
                      <p className="text-sm text-muted-foreground">5 members on leave during project deadline</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <Clock className="h-10 w-10 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium">Q3 Planning</p>
                      <p className="text-sm text-muted-foreground">All managers available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Time Off Balance</CardTitle>
              <CardDescription>Average remaining days by leave type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                  <div className="text-2xl font-bold">12.5</div>
                  <div className="text-sm text-muted-foreground">Vacation Days</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                  <div className="text-2xl font-bold">5.2</div>
                  <div className="text-sm text-muted-foreground">Sick Days</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                  <div className="text-2xl font-bold">3.0</div>
                  <div className="text-sm text-muted-foreground">Personal Days</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                  <div className="text-2xl font-bold">20.7</div>
                  <div className="text-sm text-muted-foreground">Total Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="punctuality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Punctuality Trends</CardTitle>
              <CardDescription>This feature is coming soon</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Punctuality Analysis</h3>
                <p className="text-muted-foreground">
                  Detailed punctuality data will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceReports; 