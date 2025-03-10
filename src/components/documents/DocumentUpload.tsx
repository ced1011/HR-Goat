import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { documentService } from '@/lib/api-services/document-service';

interface DocumentUploadProps {
  employeeId?: number;
  onUploadComplete?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  employeeId,
  onUploadComplete 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('general');
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const documentTypes = [
    { value: 'general', label: 'General Document' },
    { value: 'contract', label: 'Contract' },
    { value: 'resume', label: 'Resume/CV' },
    { value: 'id', label: 'ID Document' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'tax', label: 'Tax Document' },
    { value: 'payroll', label: 'Payroll Document' },
    { value: 'performance', label: 'Performance Review' },
    { value: 'other', label: 'Other' }
  ];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };
  
  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create a simulated progress update
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 300);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('description', description);
      
      if (employeeId) {
        formData.append('employeeId', employeeId.toString());
      }
      
      const result = await documentService.uploadDocument(formData);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Complete the progress bar
      setUploadProgress(100);
      
      // Reset form
      setFile(null);
      setDescription('');
      setDocumentType('general');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
      setError(errorMessage);
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
        <CardDescription>
          Upload documents in any format (PDF, Word, Excel, images, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a description for this document"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  file ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                
                {file ? (
                  <div className="flex items-center justify-between p-2 bg-background rounded">
                    <div className="flex items-center gap-2">
                      <File className="h-6 w-6 text-primary" />
                      <div className="text-left">
                        <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={e => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      Drag and drop your file here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports all file types up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFile(null);
            setDescription('');
            setDocumentType('general');
            setError(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          disabled={isUploading}
        >
          Clear
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!file || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentUpload; 