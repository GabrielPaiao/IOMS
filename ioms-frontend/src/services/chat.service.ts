// src/services/chat.service.ts
import { api } from './api';
import { io, Socket } from 'socket.io-client';
import { config } from '../../config';

export interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  replyToMessageId?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  replyToMessage?: {
    id: string;
    content: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface ChatConversation {
  id: string;
  title: string;
  description?: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
  lastMessage: string;
  unread?: number;
  outageId?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export interface MessagesResponse {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateConversationRequest {
  title: string;
  participantEmails: string[];
  description?: string;
  type?: 'direct' | 'group' | 'outage' | 'application';
  relatedOutageId?: string;
  relatedApplicationId?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  replyToMessageId?: string;
  attachmentUrl?: string;
  attachmentType?: string;
}

class ChatService {
  private socket: Socket | null = null;

  // Socket.IO para mensagens em tempo real
  initializeWebSocket(token: string, onMessage: (message: ChatMessage) => void) {
    try {
      console.log('[FRONTEND] Initializing WebSocket with token:', token ? 'Token provided' : 'No token');
      
      this.socket = io(`${config.WS_BASE_URL}/chat`, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });
      
      this.socket.on('connect', () => {
        console.log('[FRONTEND] Socket.IO connected successfully');
      });

      this.socket.on('message:received', (message: ChatMessage) => {
        console.log('[FRONTEND] Message received via WebSocket:', message);
        onMessage(message);
      });

      this.socket.on('disconnect', () => {
        console.log('[FRONTEND] Socket.IO disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('[FRONTEND] Socket.IO connection error:', error);
      });

    } catch (error) {
      console.error('[FRONTEND] Error initializing Socket.IO:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Juntar-se a uma conversa específica
  joinConversation(conversationId: string) {
    if (this.socket && this.socket.connected) {
      console.log(`[FRONTEND] Socket is connected, emitting join for conversation: ${conversationId}`);
      this.socket.emit('conversation:join', { conversationId });
      console.log(`[FRONTEND] Join event emitted for conversation: ${conversationId}`);
    } else {
      console.log(`[FRONTEND] Socket not connected (socket: ${!!this.socket}, connected: ${this.socket?.connected}), cannot join conversation: ${conversationId}`);
      
      // Tentar novamente quando conectar
      if (this.socket) {
        this.socket.once('connect', () => {
          console.log(`[FRONTEND] Socket connected, retrying join for conversation: ${conversationId}`);
          this.socket!.emit('conversation:join', { conversationId });
        });
      }
    }
  }

  // Sair de uma conversa específica
  leaveConversation(conversationId: string) {
    if (this.socket && this.socket.connected) {
      console.log(`[FRONTEND] Socket is connected, emitting leave for conversation: ${conversationId}`);
      this.socket.emit('conversation:leave', { conversationId });
      console.log(`[FRONTEND] Leave event emitted for conversation: ${conversationId}`);
    } else {
      console.log(`[FRONTEND] Socket not connected (socket: ${!!this.socket}, connected: ${this.socket?.connected}), cannot leave conversation: ${conversationId}`);
    }
  }

  // API REST para operações de chat
  async getConversations(): Promise<ChatConversation[]> {
    try {
      const response = await api.get('/chat/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<ChatConversation> {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  async createConversation(data: CreateConversationRequest): Promise<ChatConversation> {
    try {
      const response = await api.post('/chat/conversations', data);
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async getMessages(conversationId: string, limit = 50, page = 1): Promise<MessagesResponse> {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
        params: { limit, page }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(data: SendMessageRequest): Promise<ChatMessage> {
    try {
      const response = await api.post('/chat/messages', data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async markAsRead(conversationId: string): Promise<void> {
    try {
      await api.put(`/chat/conversations/${conversationId}/read`);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/chat/conversations/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  async searchConversations(query: string): Promise<ChatConversation[]> {
    try {
      const response = await api.get('/chat/conversations/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }
  }

  async addParticipant(conversationId: string, participantId: string): Promise<void> {
    try {
      await api.post(`/chat/conversations/${conversationId}/participants`, {
        participantId
      });
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  async removeParticipant(conversationId: string, participantId: string): Promise<void> {
    try {
      await api.delete(`/chat/conversations/${conversationId}/participants/${participantId}`);
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  async updateConversationTopic(conversationId: string, topic: string): Promise<ChatConversation> {
    try {
      const response = await api.put(`/chat/conversations/${conversationId}`, { topic });
      return response.data;
    } catch (error) {
      console.error('Error updating conversation topic:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await api.delete(`/chat/conversations/${conversationId}`);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Métodos para integração com outages
  async getOutageConversations(outageId: string): Promise<ChatConversation[]> {
    try {
      const response = await api.get(`/chat/outages/${outageId}/conversations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching outage conversations:', error);
      throw error;
    }
  }

  async createOutageConversation(outageId: string, topic: string, participantIds: string[]): Promise<ChatConversation> {
    try {
      const response = await api.post(`/chat/outages/${outageId}/conversations`, {
        topic,
        participantIds
      });
      return response.data;
    } catch (error) {
      console.error('Error creating outage conversation:', error);
      throw error;
    }
  }

  // Métodos para notificações de chat
  async subscribeToNotifications(userId: string): Promise<void> {
    try {
      await api.post('/chat/notifications/subscribe', { userId });
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw error;
    }
  }

  async unsubscribeFromNotifications(userId: string): Promise<void> {
    try {
      await api.post('/chat/notifications/unsubscribe', { userId });
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      throw error;
    }
  }

  // Métodos para histórico e auditoria
  async getChatHistory(userId: string, startDate: string, endDate: string): Promise<ChatMessage[]> {
    try {
      const response = await api.get('/chat/history', {
        params: { userId, startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  async exportConversation(conversationId: string, format: 'json' | 'csv' = 'json'): Promise<any> {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/export`, {
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting conversation:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
export default chatService;
