
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Table, FileText } from 'lucide-react';
import { databaseSetupService } from '@/lib/api-services/database-setup';
import { toast } from 'sonner';

import DatabaseConnectionCard from '@/components/database/DatabaseConnectionCard';
import DatabaseSetupTab from '@/components/database/DatabaseSetupTab';
import MockDataTab from '@/components/database/MockDataTab';
import SqlScriptsTab from '@/components/database/SqlScriptsTab';

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
    <PageContainer className="max-w-6xl mx-auto">
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Database Setup</h1>
        <p className="text-hr-text-secondary">
          Configure and manage your database connection.
        </p>
      </div>
      
      <div className="grid gap-6">
        <DatabaseConnectionCard 
          connectionStatus={connectionStatus}
          connectionMessage={connectionMessage}
        />
        
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
            <DatabaseSetupTab
              onRunSetup={handleRunSetupScript}
              isRunningScript={isRunningScript}
              connectionStatus={connectionStatus}
              tables={tables}
            />
          </TabsContent>
          
          <TabsContent value="mockdata">
            <MockDataTab
              onRunMockData={handleRunMockDataScript}
              isRunningScript={isRunningScript}
              connectionStatus={connectionStatus}
            />
          </TabsContent>
          
          <TabsContent value="scripts">
            <SqlScriptsTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default DatabaseSetup;
