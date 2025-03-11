import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Globe, Terminal, Users } from 'lucide-react';
import BulkEmployeeUpload from '@/components/employee/BulkEmployeeUpload';

const SystemTools = () => {
  const [url, setUrl] = useState('');
  const [command, setCommand] = useState('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchResource = async () => {
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/system/fetch-resource', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch resource');
      }
      
      setResult(JSON.stringify(data, null, 2));
      toast.success('Resource fetched successfully');
    } catch (error) {
      console.error('Error fetching resource:', error);
      toast.error('Failed to fetch resource', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      setResult(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const executeCommand = async () => {
    if (!command) {
      toast.error('Please enter a command');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/system/fetch-resource', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to execute command');
      }
      
      setResult(data.stdout || 'Command executed successfully (no output)');
      toast.success('Command executed successfully');
    } catch (error) {
      console.error('Error executing command:', error);
      toast.error('Failed to execute command', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      setResult(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <PageContainer title="System Tools" description="Advanced system tools for administrators">
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="url">
            <Globe className="h-4 w-4 mr-2" />
            URL Fetcher
          </TabsTrigger>
          <TabsTrigger value="command">
            <Terminal className="h-4 w-4 mr-2" />
            Command Executor
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="h-4 w-4 mr-2" />
            Bulk Employee Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>URL Fetcher</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Fetch content from any URL. This tool can be used to check if external resources are available.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter URL (e.g., http://example.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <Button onClick={fetchResource} disabled={isLoading}>
                    {isLoading ? 'Fetching...' : 'Fetch'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="font-mono text-xs h-64"
                  value={result}
                  readOnly
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="command" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Command Executor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Execute system commands. This tool is for advanced administrators only.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter command (e.g., ls -la)"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                  />
                  <Button onClick={executeCommand} disabled={isLoading}>
                    {isLoading ? 'Executing...' : 'Execute'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="font-mono text-xs h-64"
                  value={result}
                  readOnly
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-4">
          <BulkEmployeeUpload />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default SystemTools; 