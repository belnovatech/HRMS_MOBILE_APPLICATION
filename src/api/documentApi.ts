import client from './client';
import { EmployeeDocument } from '../types';

export interface CreateDocumentDto {
  employeeId: string;
  employeeName?: string;
  title: string;
  fileName: string;
  category?: string;
  size?: string;
  fileId?: string;
}

export const documentApi = {
  getDocuments: async (employeeId?: string, status?: string): Promise<EmployeeDocument[]> => {
    const params: Record<string, string> = {};
    if (employeeId) params.employeeId = employeeId;
    if (status) params.status = status;
    const response = await client.get('/Documents', { params });
    return (response.data || []).map((x: any) => ({
      id: x.id,
      title: x.title,
      fileName: x.fileName,
      category: x.category || 'General',
      size: x.size || '1.2 MB',
      uploaded: x.uploaded || new Date().toISOString(),
      status: x.status || 'Verified',
      fileId: x.fileId,
      employeeId: x.employeeId,
      employee: x.employeeName,
    }));
  },

  uploadFile: async (file: File): Promise<{ id: string; fileName: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post('/Files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  createDocument: async (data: CreateDocumentDto): Promise<any> => {
    const response = await client.post('/Documents', data);
    return response.data;
  },

  verifyDocument: async (id: string, status = 'Verified'): Promise<any> => {
    const response = await client.patch(`/Documents/${id}/status`, { status });
    return response.data;
  },

  downloadFile: async (id: string): Promise<Blob> => {
    const response = await client.get(`/Files/${id}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default documentApi;
