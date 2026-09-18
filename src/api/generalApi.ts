import client from './client';
import { Holiday, Announcement, TeamMember } from '../types';

export interface DashboardSummaryDto {
  totalEmployees?: number;
  presentToday?: number;
  onLeaveToday?: number;
  pendingLeaves?: number;
  totalPayrollMonth?: number;
  recentActivities?: any[];
}

export const generalApi = {
  getTeam: async (): Promise<TeamMember[]> => {
    const response = await client.get('/Team');
    return (response.data || []).map((x: any) => ({
      id: x.id || x.employeeNumber || 'TM',
      name: x.name || x.username || 'Team Member',
      designation: x.designation || 'Staff',
      initials: (x.name || 'TM').slice(0, 2).toUpperCase(),
      color: x.role === 'manager' ? '#7c3aed' : '#2563eb',
      checkIn: x.checkIn || '09:00 AM',
      status: (x.status || 'Present') as TeamMember['status'],
      performance: x.performance || '94%',
      email: x.email || '',
      phone: x.phone || '',
    }));
  },

  getHolidays: async (): Promise<Holiday[]> => {
    const response = await client.get('/holidays');
    return (response.data || []).map((x: any, idx: number) => ({
      id: x.id || idx + 1,
      date: x.date || '',
      name: x.name || x.title || '',
      day: x.day || '',
      type: x.type || 'Public Holiday',
    }));
  },

  getAnnouncements: async (): Promise<Announcement[]> => {
    const response = await client.get('/announcements');
    return (response.data || []).map((x: any, idx: number) => ({
      id: x.id || idx + 1,
      title: x.title || '',
      category: x.category || 'General',
      date: x.date || '',
      content: x.content || x.message || '',
      important: !!x.important,
    }));
  },

  getDashboardSummary: async (): Promise<DashboardSummaryDto> => {
    const response = await client.get('/Dashboard/summary');
    return response.data || {};
  },
};

export default generalApi;

