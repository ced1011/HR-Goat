import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart, PieChart, Users, Calendar, TrendingUp, Download } from 'lucide-react';
import EmployeeReports from '@/components/reports/EmployeeReports';
import PerformanceReports from '@/components/reports/PerformanceReports';
import AttendanceReports from '@/components/reports/AttendanceReports';

const Reports = () => {
  const [activeReport, setActiveReport] = useState<'employees' | 'performance' | 'attendance'>('employees');

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Side Panel for Report Selection */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Report Categories</CardTitle>
                <CardDescription>Select a report type to view</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant={activeReport === 'employees' ? 'default' : 'ghost'} 
                    className="justify-start"
                    onClick={() => setActiveReport('employees')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Employee Reports
                  </Button>
                  <Button 
                    variant={activeReport === 'performance' ? 'default' : 'ghost'} 
                    className="justify-start"
                    onClick={() => setActiveReport('performance')}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Performance Reports
                  </Button>
                  <Button 
                    variant={activeReport === 'attendance' ? 'default' : 'ghost'} 
                    className="justify-start"
                    onClick={() => setActiveReport('attendance')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Attendance Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Main Content Area */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>
                  {activeReport === 'employees' && 'Employee Reports'}
                  {activeReport === 'performance' && 'Performance Reports'}
                  {activeReport === 'attendance' && 'Attendance Reports'}
                </CardTitle>
                <CardDescription>
                  {activeReport === 'employees' && 'View and analyze employee data across departments'}
                  {activeReport === 'performance' && 'Track performance metrics and trends'}
                  {activeReport === 'attendance' && 'Monitor attendance patterns and time-off'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeReport === 'employees' && <EmployeeReports />}
                {activeReport === 'performance' && <PerformanceReports />}
                {activeReport === 'attendance' && <AttendanceReports />}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports; 