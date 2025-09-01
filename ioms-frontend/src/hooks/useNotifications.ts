// src/hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import notificationsService from '../services/notifications.service';
import type { OutageNotification } from '../types/outage';

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<OutageNotification | null>(null);

  // Carregar contador inicial
  useEffect(() => {
    if (user?.id) {
      loadUnreadCount();
    }
  }, [user?.id]);

  // Configurar listeners de notificações em tempo real
  useEffect(() => {
    if (!user?.id) return;

    // Listener para novas notificações
    const handleNewNotification = (notification: OutageNotification) => {
      setLatestNotification(notification);
      setUnreadCount(prev => prev + 1);
    };

    // Listener para notificações lidas
    const handleNotificationRead = () => {
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    // Listener para todas as notificações marcadas como lidas
    const handleAllRead = () => {
      setUnreadCount(0);
    };

    // Registrar listeners
    notificationsService.on('outage', handleNewNotification);
    notificationsService.on('approval', handleNewNotification);
    notificationsService.on('conflict', handleNewNotification);
    notificationsService.on('reminder', handleNewNotification);
    notificationsService.on('notification_read', handleNotificationRead);
    notificationsService.on('all_read', handleAllRead);

    // Polling como fallback (a cada 30 segundos)
    const pollInterval = setInterval(loadUnreadCount, 30000);

    return () => {
      // Remover listeners
      notificationsService.off('outage', handleNewNotification);
      notificationsService.off('approval', handleNewNotification);
      notificationsService.off('conflict', handleNewNotification);
      notificationsService.off('reminder', handleNewNotification);
      notificationsService.off('notification_read', handleNotificationRead);
      notificationsService.off('all_read', handleAllRead);
      
      clearInterval(pollInterval);
    };
  }, [user?.id]);

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    unreadCount,
    latestNotification,
    markAsRead,
    markAllAsRead,
    refreshCount: loadUnreadCount
  };
}
