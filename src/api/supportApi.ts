import client from './client';
import { HelpTicket } from '../types';

export interface CreateTicketDto {
  employeeId: string;
  employeeName?: string;
  category: string;
  subject: string;
  description: string;
  priority?: string;
}

export const supportApi = {
  getTickets: async (employeeId?: string): Promise<HelpTicket[]> => {
    const params: Record<string, string> = {};
    if (employeeId) params.employeeId = employeeId;
    const response = await client.get('/Support/tickets', { params });
    return (response.data || []).map((x: any) => ({
      id: x.id,
      employeeId: x.employeeId,
      employeeName: x.employeeName || 'Employee',
      category: x.category || 'General',
      subject: x.subject,
      description: x.description,
      date: x.createdDate || x.date || new Date().toISOString().split('T')[0],
      status: x.status || 'Open',
      priority: x.priority || 'Normal',
      responseNote: x.responseNote,
    }));
  },

  createTicket: async (data: CreateTicketDto): Promise<any> => {
    const response = await client.post('/Support/tickets', data);
    return response.data;
  },

  updateTicket: async (id: string, status: string, responseNote?: string): Promise<any> => {
    const response = await client.patch(`/Support/tickets/${id}`, {
      status,
      responseNote,
    });
    return response.data;
  },
};

export default supportApi;

