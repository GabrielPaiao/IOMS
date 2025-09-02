import api from './api';
import { authService } from './auth.service';
import type { OutageNotification } from '../types/outage';

export interface NotificationFilters {
  read?: boolean;
  type?: string[];
  priority?: string[];
  recipientId?: string;
  page?: number;
  limit?: number;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  outageUpdates: boolean;
  approvalRequests: boolean;
  conflictAlerts: boolean;
  reminders: boolean;
}

class NotificationsService {
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    console.log('NotificationsService inicializado');
  }

  // Sistema de eventos
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // API REST para notificações
  async getNotifications(filters?: NotificationFilters): Promise<OutageNotification[]> {
    console.log('DEBUG: getNotifications chamado');
    const user = authService.getStoredUser();
    console.log('DEBUG: User from authService:', user);
    
    if (!user) {
      console.log('DEBUG: No user in localStorage');
      return [];
    }
    
    if (!user.id) {
      console.log('DEBUG: No user ID found:', user);
      return [];
    }
    
    const params = {
      ...filters,
      recipientId: user.id
    };
    
    console.log('DEBUG: Making API call with params:', params);
    const response = await api.get('/notifications', { params });
    console.log('DEBUG: API response:', response.data);
    
    // A API retorna um objeto com paginação, extrair apenas as notificações
    if (response.data && response.data.notifications) {
      return response.data.notifications;
    }
    
    // Fallback para compatibilidade
    return response.data || [];
  }

  async getNotificationById(id: string): Promise<OutageNotification> {
    const response = await api.get<OutageNotification>(`/notifications/${id}`);
    return response.data;
  }

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    const user = authService.getStoredUser();
    if (!user?.id) return;
    
    await api.put(`/notifications/mark-all-read/${user.id}`);
  }

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  async getUnreadCount(): Promise<number> {
    const user = authService.getStoredUser();
    if (!user) {
      console.log('DEBUG: No user in localStorage for unread count');
      return 0;
    }
    
    if (!user.id) {
      console.log('DEBUG: No user ID found for unread count:', user);
      return 0;
    }

    const token = authService.getAccessToken();
    console.log('DEBUG: Token exists:', !!token);
    
    console.log('DEBUG: Getting unread count for user:', user.id);
    try {
      const response = await api.get<{ count: number }>(`/notifications/unread-count/${user.id}`);
      console.log('DEBUG: Unread count response:', response.data);
      return response.data.count;
    } catch (error) {
      console.error('DEBUG: Error getting unread count:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    await api.put('/notifications/preferences', preferences);
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  }

  // Métodos para enviar notificações específicas
  async sendOutageNotification(outageId: string, recipients: string[], type: string, message: string): Promise<void> {
    await api.post(`/notifications/outage/${outageId}`, {
      recipients,
      type,
      message
    });
  }

  async sendApprovalNotification(outageId: string, recipients: string[], message: string): Promise<void> {
    await api.post(`/notifications/approval/${outageId}`, {
      recipients,
      message
    });
  }

  async sendConflictNotification(outageId: string, recipients: string[], conflictData: any): Promise<void> {
    await api.post(`/notifications/conflict/${outageId}`, {
      recipients,
      conflictData
    });
  }

  destroy() {
    this.listeners.clear();
  }
}

// Criar e exportar instância
const notificationsService = new NotificationsService();

export default notificationsService;