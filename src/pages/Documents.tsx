import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { File, Upload } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentList from '@/components/documents/DocumentList';
import { useAuth } from '@/contexts/AuthContext';

const Documents = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  const handleUploadComplete = () => {
    // Trigger a refresh of the document list
    setRefreshTrigger(prev => prev + 1);
    // Switch to the all documents tab
    setActiveTab('all');
  };
  
  const handleDocumentDeleted = () => {
    // Trigger a refresh of the document list
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Upload, view, and manage documents
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <DocumentUpload onUploadComplete={handleUploadComplete} />
        </div>
        
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              {user?.employeeId && (
                <TabsTrigger value="my">My Documents</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <DocumentList 
                key={`all-${refreshTrigger}`} 
                onDocumentDeleted={handleDocumentDeleted} 
              />
            </TabsContent>
            {user?.employeeId && (
              <TabsContent value="my" className="mt-4">
                <DocumentList 
                  key={`my-${refreshTrigger}`} 
                  employeeId={user.employeeId} 
                  onDocumentDeleted={handleDocumentDeleted} 
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
};

export default Documents; 