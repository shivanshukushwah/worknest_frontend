import { getAPI } from './client';
import { APIResponse, PaginatedResponse, InAppNotification } from '@mytypes/index';

/**
 * Notification Service - Handles in-app notifications
 */

export const notificationAPI = {
  /**
   * Get all notifications
   */
  getNotifications: async (
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<InAppNotification>> => {
    const api = await getAPI();
    const response = await api.get(`/api/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<APIResponse<{ unreadCount: number }>> => {
    const api = await getAPI();
    const response = await api.get('/api/notifications/unread/count');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<APIResponse<InAppNotification>> => {
    const api = await getAPI();
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<APIResponse<null>> => {
    const api = await getAPI();
    const response = await api.post('/api/notifications/read-all');
    return response.data;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId: string): Promise<APIResponse<null>> => {
    const api = await getAPI();
    const response = await api.delete(`/api/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Register push notification token
   */
  registerPushToken: async (token: string): Promise<APIResponse<null>> => {
    const api = await getAPI();
    const response = await api.post('/api/notifications/push-token', { token });
    return response.data;
  },
};
