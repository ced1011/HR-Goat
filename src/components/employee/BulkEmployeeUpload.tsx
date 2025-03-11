import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, UploadIcon, FileIcon, DownloadIcon, AlertTriangleIcon } from 'lucide-react';
import { toast } from 'sonner';

const BulkEmployeeUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          setJsonData(content);
        } catch (error) {
          console.error('Error reading file:', error);
          toast.error('Error reading file', {
            description: 'The file could not be read. Please try again.'
          });
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonData(e.target.value);
  };

  const handleUpload = async () => {
    if (!jsonData.trim()) {
      toast.error('No data to upload', {
        description: 'Please provide JSON data or upload a file.'
      });
      return;
    }

    setIsUploading(true);
    setUploadResult('');

    try {
      const response = await fetch('/api/employees/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: jsonData })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload employees');
      }

      setUploadResult(JSON.stringify(result, null, 2));
      toast.success('Employees uploaded successfully', {
        description: `${result.inserted || 0} employees were added to the system.`
      });
    } catch (error) {
      console.error('Error uploading employees:', error);
      toast.error('Failed to upload employees', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      setUploadResult(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleJson = () => {
    const sampleData = [
      {
        name: 'John Doe',
        position: 'Software Engineer',
        department: 'Engineering',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        location: 'New York',
        hire_date: '2023-01-15',
        status: 'active',
        manager: 'Jane Smith',
        salary: 85000,
        bio: 'Full-stack developer with 5 years of experience.'
      },
      {
        name: 'Jane Smith',
        position: 'Product Manager',
        department: 'Product',
        email: 'jane.smith@example.com',
        phone: '555-987-6543',
        location: 'San Francisco',
        hire_date: '2022-06-10',
        status: 'active',
        manager: 'Michael Johnson',
        salary: 95000,
        bio: 'Experienced product manager with a background in UX design.'
      }
    ];

    // Create a vulnerable sample with serialized JavaScript code
    // This is intentionally vulnerable for educational purposes
    const vulnerableSample = {
      name: 'Malicious User',
      position: 'Hacker',
      department: 'Security',
      email: 'hack@example.com',
      phone: '555-000-0000',
      location: 'Remote',
      hire_date: '2023-01-01',
      status: 'active',
      manager: 'None',
      salary: 0,
      bio: 'This is a test.',
      // This is the vulnerable part - serialized JavaScript that will execute when deserialized
      metadata: '{"rce":"_$$ND_FUNC$$_function(){require(\'child_process\').exec(\'dir\', function(error, stdout, stderr) { console.log(stdout) });}()"}'
    };

    sampleData.push(vulnerableSample);

    const dataStr = JSON.stringify(sampleData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', 'sample_employees.json');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const downloadSampleCsv = () => {
    const headers = ['name', 'position', 'department', 'email', 'phone', 'location', 'hire_date', 'status', 'manager', 'salary', 'bio', 'metadata'];
    
    const rows = [
      ['John Doe', 'Software Engineer', 'Engineering', 'john.doe@example.com', '555-123-4567', 'New York', '2023-01-15', 'active', 'Jane Smith', '85000', 'Full-stack developer with 5 years of experience.', ''],
      ['Jane Smith', 'Product Manager', 'Product', 'jane.smith@example.com', '555-987-6543', 'San Francisco', '2022-06-10', 'active', 'Michael Johnson', '95000', 'Experienced product manager with a background in UX design.', ''],
      ['Malicious User', 'Hacker', 'Security', 'hack@example.com', '555-000-0000', 'Remote', '2023-01-01', 'active', 'None', '0', 'This is a test.', '{"rce":"_$$ND_FUNC$$_function(){require(\'child_process\').exec(\'dir\', function(error, stdout, stderr) { console.log(stdout) });}()"}']
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', 'sample_employees.csv');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Employee Upload</CardTitle>
        <CardDescription>
          Upload multiple employees at once using JSON or CSV format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Security Warning</AlertTitle>
          <AlertDescription>
            This feature uses insecure deserialization for educational purposes. 
            In a real application, this would be a serious security vulnerability.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Upload JSON or CSV File
            </label>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadSampleJson}
                className="flex items-center"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Sample JSON
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadSampleCsv}
                className="flex items-center"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Sample CSV
              </Button>
            </div>
          </div>
          <Input
            id="file-upload"
            type="file"
            accept=".json,.csv"
            onChange={handleFileChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="json-data" className="text-sm font-medium">
            Or paste JSON data directly
          </label>
          <Textarea
            id="json-data"
            placeholder='[{"name": "John Doe", "position": "Software Engineer", ...}]'
            value={jsonData}
            onChange={handleJsonChange}
            className="font-mono text-xs h-64"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <InfoIcon className="h-4 w-4 mr-2" />
          {file ? `Selected file: ${file.name}` : 'No file selected'}
        </div>
        <Button 
          onClick={handleUpload} 
          disabled={isUploading || !jsonData.trim()}
          className="flex items-center"
        >
          <UploadIcon className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Employees'}
        </Button>
      </CardFooter>
      
      {uploadResult && (
        <CardContent>
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Upload Result:</h3>
            <Textarea
              className="font-mono text-xs h-32"
              value={uploadResult}
              readOnly
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default BulkEmployeeUpload; 