
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Play, RefreshCw } from 'lucide-react';

interface MockDataTabProps {
  onRunMockData: () => Promise<void>;
  isRunningScript: boolean;
  connectionStatus: 'checking' | 'success' | 'error';
}

const MockDataTab: React.FC<MockDataTabProps> = ({
  onRunMockData,
  isRunningScript,
  connectionStatus,
}) => {
  return (
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
          onClick={onRunMockData} 
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
  );
};

export default MockDataTab;
