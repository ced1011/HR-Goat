import { ApiResponse } from '../api-models';
import { toast } from 'sonner';

export interface Document {
  id: number;
  employeeId: number | null;
  documentType: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileUrl?: string;
  fileSize: number;
  mimeType: string;
  description: string;
  uploadDate: string;
  employeeName?: string;
}

class DocumentService {
  private baseUrl = '/api';
  
  async getAllDocuments(): Promise<ApiResponse<Document[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/documents`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch documents');
      }
      
      return { data: data.documents, error: null };
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to fetch documents', { description: errorMessage });
      return { data: [], error: errorMessage };
    }
  }
  
  async getEmployeeDocuments(employeeId: number): Promise<ApiResponse<Document[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/employee/${employeeId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch employee documents');
      }
      
      return { data: data.documents, error: null };
    } catch (error) {
      console.error('Failed to fetch employee documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to fetch employee documents', { description: errorMessage });
      return { data: [], error: errorMessage };
    }
  }
  
  async uploadDocument(formData: FormData): Promise<ApiResponse<Document>> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document');
      }
      
      toast.success('Document uploaded successfully');
      return { data: data.document, error: null };
    } catch (error) {
      console.error('Failed to upload document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to upload document', { description: errorMessage });
      return { data: null as unknown as Document, error: errorMessage };
    }
  }
  
  async deleteDocument(id: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete document');
      }
      
      toast.success('Document deleted successfully');
      return { data: true, error: null };
    } catch (error) {
      console.error('Failed to delete document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to delete document', { description: errorMessage });
      return { data: false, error: errorMessage };
    }
  }
  
  getDownloadUrl(id: number): string {
    return `${this.baseUrl}/documents/download/${id}`;
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.startsWith('video/')) {
      return 'video';
    } else if (mimeType.startsWith('audio/')) {
      return 'audio';
    } else if (mimeType === 'application/pdf') {
      return 'file-pdf';
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return 'file-spreadsheet';
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return 'file-presentation';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return 'file-text';
    } else if (mimeType.includes('zip') || mimeType.includes('compressed')) {
      return 'file-archive';
    } else {
      return 'file';
    }
  }
}

export const documentService = new DocumentService(); 