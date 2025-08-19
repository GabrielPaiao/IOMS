import api from './api';
import type { OutageNotification, User } from '../types/outage';
import { config } from '../../config';

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
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeWebSocket();
    this.setupHeartbeat();
  }

  // Inicializar WebSocket
  private initializeWebSocket() {
    try {
      const wsUrl = config.WS_BASE_URL || config.API_BASE_URL.replace('http', 'ws') + '/notifications';
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket conectado para notificações');
        this.reconnectAttempts = 0;
        this.authenticateWebSocket();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket desconectado');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
      };
    } catch (error) {
      console.error('Erro ao inicializar WebSocket:', error);
      this.fallbackToPolling();
    }
  }

  // Autenticar WebSocket
  private authenticateWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
      if (token) {
        this.ws.send(JSON.stringify({
          type: 'auth',
          token
        }));
      }
    }
  }

  // Configurar heartbeat
  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 segundos
  }

  // Agendar reconexão
  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.initializeWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Máximo de tentativas de reconexão atingido, usando polling');
      this.fallbackToPolling();
    }
  }

  // Fallback para polling
  private fallbackToPolling() {
    console.log('Usando polling como fallback para notificações');
    // Implementar polling aqui se necessário
  }

  // Processar mensagens WebSocket
  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'outage_notification':
        this.emit('outage', data.payload);
        break;
      case 'approval_request':
        this.emit('approval', data.payload);
        break;
      case 'conflict_alert':
        this.emit('conflict', data.payload);
        break;
      case 'reminder':
        this.emit('reminder', data.payload);
        break;
      default:
        console.log('Tipo de notificação desconhecido:', data.type);
    }
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

  private emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Erro no callback de notificação:', error);
        }
      });
    }
  }

  // API REST para notificações
  async getNotifications(filters?: NotificationFilters): Promise<OutageNotification[]> {
    const response = await api.get<OutageNotification[]>('/notifications', { params: filters });
    return response.data;
  }

  async getNotificationById(id: string): Promise<OutageNotification> {
    const response = await api.get<OutageNotification>(`/notifications/${id}`);
    return response.data;
  }

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  }

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
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
    await api.post('/notifications/send', {
      outageId,
      recipients,
      type,
      message
    });
  }

  // Limpar recursos
  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
