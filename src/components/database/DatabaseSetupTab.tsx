
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Play, RefreshCw } from 'lucide-react';
import DatabaseTablesCard from './DatabaseTablesCard';

interface DatabaseSetupTabProps {
  onRunSetup: () => Promise<void>;
  isRunningScript: boolean;
  connectionStatus: 'checking' | 'success' | 'error';
  tables: Array<{ name: string; rowCount: number }>;
}

const DatabaseSetupTab: React.FC<DatabaseSetupTabProps> = ({
  onRunSetup,
  isRunningScript,
  connectionStatus,
  tables,
}) => {
  return (
    <>
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
            onClick={onRunSetup} 
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
      
      <DatabaseTablesCard tables={tables} />
    </>
  );
};

export default DatabaseSetupTab;
