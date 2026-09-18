import client from './client';
import { NotificationItem } from '../types';

export interface CreateNotificationDto {
  audience: 'All' | 'HR' | 'Manager' | 'Employee';
  recipientId?: string | null;
  category: string;
  title: string;
  message: string;
  targetPath?: string;
}

export const notificationApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await client.get('/Notifications');
    return (response.data || []).map((x: any) => ({
      id: x.id,
      audience: x.audience,
      recipientId: x.recipientId,
      category: x.category || 'General',
      title: x.title,
      message: x.message,
      time: x.time || (x.createdAt ? new Date(x.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'),
      unread: x.unread !== undefined ? x.unread : true,
      priority: x.priority || 'Normal',
      targetPath: x.targetPath || '',
      createdAt: x.createdAt || new Date().toISOString(),
    }));
  },

  sendNotification: async (data: CreateNotificationDto): Promise<any> => {
    const response = await client.post('/Notifications', data);
    return response.data;
  },

  markAsRead: async (id: string): Promise<any> => {
    const response = await client.patch(`/Notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<any> => {
    const response = await client.patch('/Notifications/read-all');
    return response.data;
  },
};

export default notificationApi;

