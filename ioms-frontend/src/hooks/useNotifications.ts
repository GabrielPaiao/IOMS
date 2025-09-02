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

    // Listener para contador de não lidas inicial
    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    // Listener para atualização do contador
    const handleUnreadCountUpdated = (data: { increment?: number; decrement?: number }) => {
      if (data.increment) {
        setUnreadCount(prev => prev + data.increment!);
      }
      if (data.decrement) {
        setUnreadCount(prev => Math.max(0, prev - data.decrement!));
      }
    };

    // Listener para todas as notificações marcadas como lidas
    const handleAllRead = () => {
      setUnreadCount(0);
    };

    // Registrar listeners
    notificationsService.on('new_notification', handleNewNotification);
    notificationsService.on('unread_count', handleUnreadCount);
    notificationsService.on('unread_count_updated', handleUnreadCountUpdated);
    notificationsService.on('all_read', handleAllRead);

    // Fallback listeners para compatibilidade
    notificationsService.on('outage', handleNewNotification);
    notificationsService.on('approval', handleNewNotification);
    notificationsService.on('conflict', handleNewNotification);
    notificationsService.on('reminder', handleNewNotification);

    // Polling como fallback (a cada 30 segundos)
    const pollInterval = setInterval(loadUnreadCount, 30000);

    return () => {
      // Remover listeners
      notificationsService.off('new_notification', handleNewNotification);
      notificationsService.off('unread_count', handleUnreadCount);
      notificationsService.off('unread_count_updated', handleUnreadCountUpdated);
      notificationsService.off('all_read', handleAllRead);
      notificationsService.off('outage', handleNewNotification);
      notificationsService.off('approval', handleNewNotification);
      notificationsService.off('conflict', handleNewNotification);
      notificationsService.off('reminder', handleNewNotification);
      
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
