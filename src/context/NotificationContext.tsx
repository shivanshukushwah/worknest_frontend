import React, { createContext, useContext, useState, useCallback } from 'react';
import { InAppNotification } from '@mytypes/index';
import { notificationAPI } from '@api/index';

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  registerPushToken: (token: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await notificationAPI.getNotifications(page, limit);

      if (response.success && response.data) {
        setNotifications(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch notifications');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();

      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationAPI.markAsRead(notificationId);

      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        await fetchUnreadCount();
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Unknown error';
      setError(message);
    }
  }, [fetchUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationAPI.markAllAsRead();

      if (response.success) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Unknown error';
      setError(message);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationAPI.deleteNotification(notificationId);

      if (response.success) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
        await fetchUnreadCount();
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Unknown error';
      setError(message);
    }
  }, [fetchUnreadCount]);

  const registerPushToken = useCallback(async (token: string) => {
    try {
      const response = await notificationAPI.registerPushToken(token);

      if (!response.success) {
        console.warn('Failed to register push token');
      }
    } catch (err: any) {
      console.error('Error registering push token:', err);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    registerPushToken,
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
