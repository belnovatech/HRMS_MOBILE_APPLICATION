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

  createLeaveBalance: async (data: { employeeId: string; leaveType: string; year: number; total: number }): Promise<any> => {
    const response = await client.post('/leave/balances', data);
    return response.data;
  },

  decideLeave: async (
    id: string,
    status: 'Approved' | 'Rejected',
    reason = '',
    details?: { employeeId?: string; leaveType?: string; startDate?: string }
  ): Promise<any> => {
    try {
      const response = await client.patch(`/Leave/${id}/decision`, {
        status,
        reason,
      });
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.title ||
        err?.response?.data?.message ||
        err?.message ||
        '';

      if (
        status === 'Approved' &&
        (err?.response?.status === 409 || errorMessage.includes('entitlement')) &&
        details?.employeeId &&
        details?.leaveType
      ) {
        try {
          const year = details.startDate
            ? new Date(details.startDate).getFullYear()
            : new Date().getFullYear();
          await client.post('/leave/balances', {
            employeeId: details.employeeId,
            leaveType: details.leaveType,
            year: isNaN(year) ? new Date().getFullYear() : year,
            total: 18,
          });

          const retryRes = await client.patch(`/Leave/${id}/decision`, {
            status,
            reason,
          });
          return retryRes.data;
        } catch (retryErr) {
          console.warn('Auto-entitlement balance creation failed:', retryErr);
          throw err;
        }
      }

      throw err;
    }
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

