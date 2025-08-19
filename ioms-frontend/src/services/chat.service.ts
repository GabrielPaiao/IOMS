// src/services/chat.service.ts
import { api } from './api';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  text: string;
  timestamp: string;
  outageId?: string;
}

export interface ChatConversation {
  id: string;
  topic: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
  lastMessage: string;
  unread: number;
  outageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  topic: string;
  participantIds: string[];
  outageId?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  text: string;
}

class ChatService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // WebSocket para mensagens em tempo real
  initializeWebSocket(token: string, onMessage: (message: ChatMessage) => void) {
    try {
      this.ws = new WebSocket(`ws://localhost:3000/ws/chat?token=${token}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            onMessage(data.message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect(token, onMessage);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  private attemptReconnect(token: string, onMessage: (message: ChatMessage) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.initializeWebSocket(token, onMessage);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
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

  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
        params: { limit, offset }
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
