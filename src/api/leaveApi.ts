import client from './client';
import { LeaveRequest } from '../types';

export interface CreateLeaveDto {
  employeeId: string;
  employeeName?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveBalanceDto {
  id: string;
  employeeId: string;
  leaveType: string;
  year: number;
  total: number;
  used: number;
  available: number;
}

export const leaveApi = {
  getLeaves: async (employeeId?: string, status?: string): Promise<LeaveRequest[]> => {
    const params: Record<string, string> = {};
    if (employeeId) params.employeeId = employeeId;
    if (status) params.status = status;
    const response = await client.get('/Leave', { params });
    return (response.data || []).map((x: any) => ({
      id: x.id,
      employeeId: x.employeeId,
      employeeName: x.employeeName || 'Employee',
      initials: (x.employeeName || 'EM').slice(0, 2).toUpperCase(),
      avatarBg: '#2563eb',
      leaveType: x.leaveType,
      startDate: x.startDate,
      endDate: x.endDate,
      duration: x.durationDays ? `${x.durationDays} Day(s)` : `${x.duration || 1} Day(s)`,
      reason: x.reason,
      status: x.status || 'Pending',
      appliedOn: x.appliedOn || new Date().toISOString(),
      rejectReason: x.rejectReason,
    }));
  },

  applyLeave: async (data: CreateLeaveDto): Promise<any> => {
    const response = await client.post('/Leave', data);
    return response.data;
  },

  decideLeave: async (id: string, status: 'Approved' | 'Rejected', reason = ''): Promise<any> => {
    const response = await client.patch(`/Leave/${id}/decision`, {
      status,
      reason,
    });
    return response.data;
  },

  getLeaveBalances: async (employeeId?: string): Promise<LeaveBalanceDto[]> => {
    const response = await client.get('/leave/balances');
    const data: LeaveBalanceDto[] = response.data || [];
    if (employeeId) {
      return data.filter((item) => item.employeeId === employeeId);
    }
    return data;
  },

  getLeavePolicies: async (): Promise<any[]> => {
    const response = await client.get('/leave/policies');
    return response.data || [];
  },
};

export default leaveApi;

