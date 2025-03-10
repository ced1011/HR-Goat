
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { databaseSetupService } from '@/lib/api-services/database-setup';
import { db } from '@/lib/database';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Database, Play, Table, RefreshCw, FileText, Info } from 'lucide-react';

const DatabaseSetup = () => {
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [connectionMessage, setConnectionMessage] = useState('Checking database connection...');
  const [isRunningScript, setIsRunningScript] = useState(false);
  const [tables, setTables] = useState<{ name: string; rowCount: number }[]>([]);
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await databaseSetupService.testConnection();
        
        if (result.error) {
          setConnectionStatus('error');
          setConnectionMessage(result.error);
        } else {
          setConnectionStatus('success');
          setConnectionMessage(result.data.message);
          fetchDatabaseStats();
        }
      } catch (err: unknown) {
        const error = err as Error;
        setConnectionStatus('error');
        setConnectionMessage(error.message || 'Unknown error occurred');
      }
    };
    
    checkConnection();
  }, []);
  
  const fetchDatabaseStats = async () => {
    const result = await databaseSetupService.getDatabaseStats();
    if (!result.error) {
      setTables(result.data.tables);
    }
  };
  
  const handleRunSetupScript = async () => {
    setIsRunningScript(true);
    
    try {
      const result = await databaseSetupService.runSetupScript();
      
      if (result.error) {
        toast.error('Setup Failed', {
          description: result.error
        });
      } else {
        toast.success('Setup Complete', {
          description: result.data.message
        });
        fetchDatabaseStats();
      }
    } catch (error) {
      toast.error('Script Execution Failed', {
        description: 'An unexpected error occurred'
      });
    } finally {
      setIsRunningScript(false);
    }
  };
  
  const handleRunMockDataScript = async () => {
    setIsRunningScript(true);
    
    try {
      const result = await databaseSetupService.runMockDataScript();
      
      if (result.error) {
        toast.error('Failed to Insert Mock Data', {
          description: result.error
        });
      } else {
        toast.success('Mock Data Inserted', {
          description: result.data.message
        });
        fetchDatabaseStats();
      }
    } catch (error) {
      toast.error('Script Execution Failed', {
        description: 'An unexpected error occurred'
      });
    } finally {
      setIsRunningScript(false);
    }
  };
  
  return (
    <PageContainer
      className="max-w-6xl mx-auto"
    >
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Database Setup</h1>
        <p className="text-hr-text-secondary">
          Configure and manage your database connection.
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={connectionStatus === 'success' ? 'default' : 'destructive'} className="mb-4">
              <div className="flex items-center">
                {connectionStatus === 'checking' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : connectionStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                <AlertTitle>
                  {connectionStatus === 'checking' ? 'Checking Connection' : 
                   connectionStatus === 'success' ? 'Connection Established' : 
                   'Connection Error'}
                </AlertTitle>
              </div>
              <AlertDescription>{connectionMessage}</AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Host</h3>
                  <p className="text-sm">database-1.cluster-cnye4gmgu5x2.us-east-1.rds.amazonaws.com</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Username</h3>
                  <p className="text-sm">admin</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Password</h3>
                  <p className="text-sm">••••••••••••••••</p>
                </div>
              </div>
              
              <div className="flex mt-4">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm"
                  className="mr-2"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="setup">
          <TabsList className="mb-4">
            <TabsTrigger value="setup">
              <Database className="h-4 w-4 mr-1" />
              Database Setup
            </TabsTrigger>
            <TabsTrigger value="mockdata">
              <Table className="h-4 w-4 mr-1" />
              Mock Data
            </TabsTrigger>
            <TabsTrigger value="scripts">
              <FileText className="h-4 w-4 mr-1" />
              SQL Scripts
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Initialize Database</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Run the setup script to create the necessary database tables for the HR application.
                  This will create tables for employees, departments, performance reviews, payroll, and other HR data.
                </p>
                
                <Alert className="mb-4">
                  <Info className="h-4 w-4 mr-2" />
                  <AlertTitle>Before you begin</AlertTitle>
                  <AlertDescription>
                    Make sure your database connection is working properly. Running this script will create
                    new tables if they don't exist, but will not delete existing data.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleRunSetupScript} 
                  disabled={connectionStatus !== 'success' || isRunningScript}
                >
                  {isRunningScript ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running Script...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Setup Script
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            {tables.length > 0 && (
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Table className="mr-2 h-5 w-5" />
                    Database Tables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tables.map((table) => (
                      <div key={table.name} className="flex items-center justify-between p-3 bg-muted/40 rounded-md">
                        <div className="flex items-center">
                          <Table className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-mono text-sm">{table.name}</span>
                        </div>
                        <Badge variant="outline">{table.rowCount} rows</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="mockdata">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Insert Mock Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Populate the database with sample data for testing and development purposes.
                  This includes employees, departments, performance reviews, payroll information, and more.
                </p>
                
                <Alert className="mb-4">
                  <Info className="h-4 w-4 mr-2" />
                  <AlertTitle>Note</AlertTitle>
                  <AlertDescription>
                    This will add mock data to your database. It's designed to work with the
                    tables created by the setup script. Make sure you've run the setup script first.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleRunMockDataScript} 
                  disabled={connectionStatus !== 'success' || isRunningScript}
                >
                  {isRunningScript ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Inserting Data...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Insert Mock Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scripts">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>SQL Scripts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  View the SQL scripts used to set up the database and insert mock data.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Setup Database Script</h3>
                    <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                      <pre className="text-xs">{`-- This is a simplified representation of the setup script
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(100),
  department VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  location VARCHAR(100),
  avatar VARCHAR(255),
  hireDate DATE,
  status ENUM('active', 'inactive', 'onleave') DEFAULT 'active',
  manager VARCHAR(100),
  salary DECIMAL(10, 2),
  bio TEXT
);

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  managerId INT,
  FOREIGN KEY (managerId) REFERENCES employees(id)
);

-- More tables for performance, payroll, etc. would be defined here
`}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Mock Data Script</h3>
                    <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                      <pre className="text-xs">{`-- This is a simplified representation of the mock data script
INSERT INTO employees (name, position, department, email, phone, location, avatar, hireDate, status, manager, salary, bio)
VALUES
  ('John Doe', 'Senior Software Engineer', 'Engineering', 'john.doe@company.com', '(555) 123-4567', 'San Francisco, CA', 'https://randomuser.me/api/portraits/men/32.jpg', '2019-03-15', 'active', 'Jane Smith', 120000, 'John is a senior developer with expertise in React and Node.js.'),
  ('Jane Smith', 'Product Manager', 'Product', 'jane.smith@company.com', '(555) 987-6543', 'New York, NY', 'https://randomuser.me/api/portraits/women/44.jpg', '2018-07-10', 'active', 'Robert Johnson', 135000, 'Jane oversees product development and works closely with engineering and design teams.'),
  -- More employee records would be inserted here

INSERT INTO departments (name, description, managerId)
VALUES
  ('Engineering', 'Software development and infrastructure', 1),
  ('Product', 'Product management and design', 2),
  -- More department records would be inserted here
`}</pre>
                    </div>
                  </div>
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
