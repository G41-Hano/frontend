import { createContext, useContext, useState, useEffect } from 'react';
import { ACCESS_TOKEN } from "../constants"
import api from '../api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN)
    if (token) {
      try {
        const response = await api.get('/api/notifications/');
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/api/notifications/${notificationId}/mark-as-read/`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/api/notifications/mark-all-as-read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}/`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const getNotificationPath = (notification) => {
    switch (notification.type) {
      case 'student_transfer':
        return '/t/transfer-requests';
      case 'transfer_approved':
      case 'transfer_rejected':
        return `/t/classes/${notification.data.classroom_id}`;
      case 'student_added':
      case 'student_removed':
        return `/s/classes/${notification.data.classroom_id}`;
      default:
        return null;
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      refreshNotifications: fetchNotifications,
      deleteNotification,
      getNotificationPath
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 