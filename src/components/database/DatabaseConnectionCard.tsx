
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Database, RefreshCw } from 'lucide-react';

interface DatabaseConnectionCardProps {
  connectionStatus: 'checking' | 'success' | 'error';
  connectionMessage: string;
}

const DatabaseConnectionCard: React.FC<DatabaseConnectionCardProps> = ({
  connectionStatus,
  connectionMessage,
}) => {
  return (
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
  );
};

export default DatabaseConnectionCard;
