// src/components/NotificationDropdown.tsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import notificationsService from '../services/notifications.service';
import { useNotifications } from '../hooks/useNotifications';
import type { OutageNotification } from '../types/outage';

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const { user } = useAuth();
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<OutageNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carregar notificações quando o dropdown abrir
  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const notificationsData = await notificationsService.getNotifications({ 
        recipientId: user.id, 
        read: false, 
        limit: 10 
      });
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificação como lida e remover da lista
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Marcar todas como lidas e limpar lista
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications([]);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carregar notificações ao abrir dropdown
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, user?.id]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botão de notificação */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-[#393939] transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#FFD700] text-[#393939] text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#393939]">Notificações</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-[#393939] hover:text-gray-600"
              >
                Marcar todas como lida
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FFD700] mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Carregando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <BellIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#393939] truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-[#393939] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <Link 
                to="/notifications" 
                className="text-sm text-[#393939] hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                Ver todas as notificações
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
