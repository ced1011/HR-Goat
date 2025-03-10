
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, XCircle, Database, FileText } from 'lucide-react';
import { databaseSetupService } from '@/lib/database-setup';
import { useQuery, useMutation } from '@tanstack/react-query';
import PageContainer from '@/components/layout/PageContainer';
import { toast } from 'sonner';
import setupDatabaseSQL from '@/lib/sql/setup-database.sql?raw';
import insertMockDataSQL from '@/lib/sql/insert-mock-data.sql?raw';

const DatabaseSetup = () => {
  const [activeTab, setActiveTab] = useState('status');
  
  // Check database status
  const { data: dbStatus, isLoading: isStatusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['databaseStatus'],
    queryFn: () => databaseSetupService.checkDatabaseStatus()
  });
  
  // Setup database mutation
  const { mutate: setupDatabase, isPending: isSettingUp } = useMutation({
    mutationFn: () => databaseSetupService.setupDatabase(),
    onSuccess: (result) => {
      if (result.error) {
        toast.error('Database setup failed', { description: result.error });
      } else {
        toast.success('Database setup completed successfully!');
        refetchStatus();
      }
    },
    onError: (error) => {
      toast.error('Database setup failed', { 
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });
  
  const handleSetupClick = () => {
    setupDatabase();
  };
  
  const dbExists = dbStatus?.data?.exists;
  
  return (
    <PageContainer title="Database Setup" description="Set up the HR portal database">
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Database Configuration</CardTitle>
            <CardDescription>
              Configure and manage your HR portal database connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Host</h3>
                  <p className="text-sm text-muted-foreground break-all">
                    database-1.cluster-cnye4gmgu5x2.us-east-1.rds.amazonaws.com
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Username</h3>
                  <p className="text-sm text-muted-foreground">admin</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Database Name</h3>
                  <p className="text-sm text-muted-foreground">hr_portal</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">••••••••••••••••</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {isStatusLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking database status...</span>
              </div>
            ) : dbExists ? (
              <Alert variant="success" className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Database is set up and connected</AlertTitle>
                <AlertDescription>
                  The database schema exists and is accessible.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Database setup required</AlertTitle>
                <AlertDescription>
                  The database schema does not exist or is not accessible.
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="status">
              <Database className="h-4 w-4 mr-2" />
              Status & Setup
            </TabsTrigger>
            <TabsTrigger value="schema">
              <FileText className="h-4 w-4 mr-2" />
              Schema SQL
            </TabsTrigger>
            <TabsTrigger value="data">
              <FileText className="h-4 w-4 mr-2" />
              Mock Data SQL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Database Status</CardTitle>
                <CardDescription>
                  Check the status of your database and set up the required schema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTitle>Important Note</AlertTitle>
                  <AlertDescription>
                    Setting up the database will create all required tables and insert initial data.
                    This operation can be safely run on a new database, but may cause data loss on an existing database.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      <span>Database Connection</span>
                    </div>
                    {isStatusLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Checking...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {dbExists ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Connected</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">Not Connected</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between border p-4 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span>Database Schema</span>
                    </div>
                    {isStatusLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Checking...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {dbExists ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Exists</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">Not Found</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSetupClick} 
                  disabled={isSettingUp || isStatusLoading}
                  className="w-full md:w-auto"
                >
                  {isSettingUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSettingUp ? 'Setting Up Database...' : 'Set Up Database'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="schema">
            <Card>
              <CardHeader>
                <CardTitle>Database Schema SQL</CardTitle>
                <CardDescription>
                  SQL script that creates all the required tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-[600px]">
                  <pre className="text-xs md:text-sm">
                    <code>{setupDatabaseSQL}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Mock Data SQL</CardTitle>
                <CardDescription>
                  SQL script that inserts initial mock data into the tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-[600px]">
                  <pre className="text-xs md:text-sm">
                    <code>{insertMockDataSQL}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default DatabaseSetup;
