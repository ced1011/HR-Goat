import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Download, 
  File, 
  FileText, 
  FileImage, 
  FileArchive, 
  FileSpreadsheet, 
  FileAudio, 
  FileVideo, 
  MoreVertical, 
  Trash, 
  Eye, 
  Search, 
  FileQuestion 
} from 'lucide-react';
import { Document, documentService } from '@/lib/api-services/document-service';
import { format } from 'date-fns';

interface DocumentListProps {
  employeeId?: number;
  onDocumentDeleted?: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  employeeId,
  onDocumentDeleted 
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      let result;
      
      if (employeeId) {
        result = await documentService.getEmployeeDocuments(employeeId);
      } else {
        result = await documentService.getAllDocuments();
      }
      
      if (!result.error && result.data) {
        setDocuments(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [employeeId]);
  
  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      const result = await documentService.deleteDocument(selectedDocument.id);
      
      if (result.data) {
        // Remove the document from the list
        setDocuments(prev => prev.filter(doc => doc.id !== selectedDocument.id));
        
        // Call the callback if provided
        if (onDocumentDeleted) {
          onDocumentDeleted();
        }
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDocument(null);
    }
  };
  
  const getFileIcon = (mimeType: string) => {
    // Handle undefined or empty mimeType
    if (!mimeType) {
      return <FileQuestion className="h-5 w-5" />;
    }
    
    if (mimeType.startsWith('image/')) {
      return <FileImage className="h-5 w-5" />;
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo className="h-5 w-5" />;
    } else if (mimeType.startsWith('audio/')) {
      return <FileAudio className="h-5 w-5" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="h-5 w-5" />;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className="h-5 w-5" />;
    } else if (mimeType.includes('zip') || mimeType.includes('compressed')) {
      return <FileArchive className="h-5 w-5" />;
    } else {
      return <FileQuestion className="h-5 w-5" />;
    }
  };
  
  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-blue-100 text-blue-800';
      case 'resume':
        return 'bg-purple-100 text-purple-800';
      case 'id':
        return 'bg-red-100 text-red-800';
      case 'certificate':
        return 'bg-green-100 text-green-800';
      case 'tax':
        return 'bg-yellow-100 text-yellow-800';
      case 'payroll':
        return 'bg-indigo-100 text-indigo-800';
      case 'performance':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      doc.originalName.toLowerCase().includes(query) ||
      doc.documentType.toLowerCase().includes(query) ||
      doc.description.toLowerCase().includes(query) ||
      (doc.employeeName && doc.employeeName.toLowerCase().includes(query))
    );
  });
  
  const canPreview = (mimeType: string) => {
    // Handle undefined or empty mimeType
    if (!mimeType) {
      return false;
    }
    return mimeType.startsWith('image/') || mimeType === 'application/pdf';
  };
  
  // Fallback function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <File className="h-5 w-5" />
            {employeeId ? 'Employee Documents' : 'All Documents'}
          </span>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </CardTitle>
        <CardDescription>
          {employeeId 
            ? 'View and manage documents for this employee' 
            : 'View and manage all uploaded documents'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-center">
              <p>Loading documents...</p>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery 
              ? 'No documents match your search' 
              : 'No documents have been uploaded yet'}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  {!employeeId && <TableHead>Employee</TableHead>}
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.mimeType || '')}
                        <div>
                          <p className="font-medium truncate max-w-[200px]">
                            {doc.originalName || 'Unnamed Document'}
                          </p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDocumentTypeColor(doc.documentType || 'other')}>
                        {doc.documentType || 'Other'}
                      </Badge>
                    </TableCell>
                    {!employeeId && (
                      <TableCell>
                        {doc.employeeName || 'N/A'}
                      </TableCell>
                    )}
                    <TableCell>
                      {formatFileSize(doc.fileSize || 0)}
                    </TableCell>
                    <TableCell>
                      {doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM d, yyyy') : 'Unknown date'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => window.open(doc.fileUrl || `${window.location.origin}/uploads/${doc.fileName}`, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          
                          {canPreview(doc.mimeType || '') && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedDocument(doc);
                                setIsPreviewOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedDocument?.originalName}
              </DialogTitle>
              <DialogDescription>
                {selectedDocument?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="h-[60vh] overflow-auto">
              {selectedDocument?.mimeType.startsWith('image/') ? (
                <img
                  src={selectedDocument.fileUrl || documentService.getDownloadUrl(selectedDocument.id)}
                  alt={selectedDocument.originalName}
                  className="max-w-full h-auto mx-auto"
                />
              ) : selectedDocument?.mimeType === 'application/pdf' ? (
                <iframe
                  src={`${selectedDocument.fileUrl || documentService.getDownloadUrl(selectedDocument.id)}#toolbar=0`}
                  className="w-full h-full"
                  title={selectedDocument.originalName}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p>Preview not available for this file type</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => window.open(documentService.getDownloadUrl(selectedDocument?.id || 0), '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the document "{selectedDocument?.originalName}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDeleteDocument}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default DocumentList; 