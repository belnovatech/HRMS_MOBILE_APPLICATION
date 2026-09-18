import client from './client';
import { User, UserRole } from '../types';

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    name: string;
    department?: string;
    designation?: string;
    reportsTo?: string;
    employeeNumber?: string;
  };
}

export const authApi = {
  login: async (identifier: string, password: string): Promise<LoginResponse> => {
    const response = await client.post<LoginResponse>('/Auth/login', {
      identifier: identifier.trim(),
      password,
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await client.get('/Auth/me');
    const data = response.data;
    return {
      id: data.id || data.employeeNumber || 'USR',
      employeeId: data.employeeNumber || data.id,
      email: data.email || '',
      username: data.username || '',
      role: (data.role?.toLowerCase() || 'employee') as UserRole,
      name: data.name || data.username || 'User',
      designation: data.designation || 'Employee',
      department: data.department || 'General',
      reportsTo: data.reportsTo,
      avatar: (data.name || 'U').slice(0, 2).toUpperCase(),
      avatarBg: data.role === 'hr' ? '#2563eb' : data.role === 'manager' ? '#7c3aed' : '#10b981',
    };
  },

  logout: async (): Promise<void> => {
    try {
      await client.post('/Auth/logout');
    } catch {
      // Ignored if session already invalidated
    }
  },

  requestOtp: async (identifier: string): Promise<void> => {
    await client.post('/Auth/request-otp', { identifier: identifier.trim() });
  },

  verifyOtp: async (identifier: string, otp: string): Promise<LoginResponse> => {
    const response = await client.post<LoginResponse>('/Auth/verify-otp', {
      identifier: identifier.trim(),
      otp: otp.trim(),
    });
    return response.data;
  },

  resetPassword: async (identifier: string, otp: string, newPassword: string): Promise<void> => {
    await client.post('/Auth/reset-password', {
      identifier: identifier.trim(),
      otp: otp.trim(),
      newPassword,
    });
  },
};

export default authApi;

