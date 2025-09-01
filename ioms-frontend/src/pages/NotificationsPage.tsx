// src/pages/NotificationsPage.tsx
import { useState, useEffect } from 'react';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import notificationsService from '../services/notifications.service';
import { useNotifications } from '../hooks/useNotifications';
import type { OutageNotification } from '../types/outage';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notifications, setNotifications] = useState<OutageNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Carregar notificações
  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const filters: any = {
        recipientId: user.id,
        limit: 50
      };
      
      if (filter === 'unread') {
        filters.read = false;
      }
      
      if (selectedType !== 'all') {
        filters.type = [selectedType];
      }
      
      const data = await notificationsService.getNotifications(filters);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar notificações ao inicializar ou mudar filtros
  useEffect(() => {
    loadNotifications();
  }, [user?.id, filter, selectedType]);

  // Marcar notificação como lida
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Deletar notificação
  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'created': return '📋';
      case 'updated': return '✏️';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'cancelled': return '🚫';
      case 'conflict_detected': return '⚠️';
      case 'reminder': return '⏰';
      default: return 'ℹ️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const notificationTypes = [
    { value: 'all', label: 'Todas' },
    { value: 'created', label: 'Criadas' },
    { value: 'updated', label: 'Atualizadas' },
    { value: 'approved', label: 'Aprovadas' },
    { value: 'rejected', label: 'Rejeitadas' },
    { value: 'conflict_detected', label: 'Conflitos' },
    { value: 'reminder', label: 'Lembretes' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellIcon className="h-8 w-8 text-gray-600" />
              <h1 className="text-2xl font-bold text-[#393939]">Notificações</h1>
              {unreadCount > 0 && (
                <span className="bg-[#FFD700] text-[#393939] text-sm px-2 py-1 rounded-full font-medium">
                  {unreadCount} não lidas
                </span>
              )}
            </div>
            {notifications.some(n => !n.read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-[#393939] text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <CheckIcon className="h-4 w-4" />
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Filtro de leitura */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-[#393939] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                filter === 'unread' 
                  ? 'bg-[#393939] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Não lidas
            </button>
          </div>

          {/* Filtro de tipo */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
          >
            {notificationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de notificações */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-[#393939] mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? 'Você não tem notificações não lidas.' 
                  : 'Você não tem notificações ainda.'
                }
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border p-4 transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-[#FFD700]' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Ícone */}
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${!notification.read ? 'text-[#393939]' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                      
                      <p className={`text-sm mb-2 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{formatTime(notification.createdAt)}</span>
                        {notification.readAt && (
                          <span>Lida em {formatTime(notification.readAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 text-[#393939] hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Marcar como lida"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deletar notificação"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
