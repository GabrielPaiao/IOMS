// src/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import chatService, { type ChatMessage, type ChatConversation, type CreateConversationRequest } from '../services/chat.service';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll para a última mensagem
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Carregar conversas
  const loadConversations = useCallback(async () => {
    if (!user?.companyId) return;

    try {
      setIsLoading(true);
      setError(null);

      // TODO: Substituir por chamada real da API
      // const data = await chatService.getConversations();
      // setConversations(data);
      
      // Por enquanto, usar dados mockados
      await loadMockConversations();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.companyId]);

  // Carregar dados mockados (remover em produção)
  const loadMockConversations = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockConversations: ChatConversation[] = [
      {
        id: '1',
        topic: 'ERP Maintenance Discussion',
        participants: [
          { id: '1', name: 'John Doe', email: 'john@company.com', role: 'DEV' },
          { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'KEY_USER' },
          { id: '3', name: 'Admin User', email: 'admin@company.com', role: 'ADMIN' }
        ],
        lastMessage: 'Precisamos atualizar o módulo financeiro',
        unread: 2,
        outageId: '101',
        createdAt: '2025-01-20T09:15:00Z',
        updatedAt: '2025-01-20T10:35:00Z'
      },
      {
        id: '2',
        topic: 'Database Migration Planning',
        participants: [
          { id: '1', name: 'John Doe', email: 'john@company.com', role: 'DEV' },
          { id: '4', name: 'Bob Wilson', email: 'bob@company.com', role: 'KEY_USER' }
        ],
        lastMessage: 'Migration scheduled for tomorrow',
        unread: 0,
        outageId: '102',
        createdAt: '2025-01-21T08:00:00Z',
        updatedAt: '2025-01-21T08:00:00Z'
      }
    ];

    setConversations(mockConversations);
  };

  // Carregar mensagens de uma conversa
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Substituir por chamada real da API
      // const data = await chatService.getMessages(conversationId);
      // setMessages(data);
      
      // Por enquanto, usar dados mockados
      await loadMockMessages(conversationId);
      
      // Marcar como lida
      await markAsRead(conversationId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar mensagens mockadas (remover em produção)
  const loadMockMessages = async (conversationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        conversationId,
        senderId: '2',
        senderName: 'Jane Smith',
        senderEmail: 'jane@company.com',
        text: 'Precisamos atualizar o módulo financeiro',
        timestamp: '2025-01-20T09:15:00Z',
        outageId: conversation.outageId
      },
      {
        id: '2',
        conversationId,
        senderId: user?.id || '',
        senderName: (user?.firstName || '') + ' ' + (user?.lastName || '') || user?.name || 'Unknown User',
        senderEmail: user?.email || '',
        text: 'Podemos agendar para depois das 14h?',
        timestamp: '2025-01-20T10:30:00Z',
        outageId: conversation.outageId
      },
      {
        id: '3',
        conversationId,
        senderId: '1',
        senderName: 'John Doe',
        senderEmail: 'john@company.com',
        text: 'Sim, perfeito. Vou preparar tudo.',
        timestamp: '2025-01-20T10:35:00Z',
        outageId: conversation.outageId
      }
    ];

    setMessages(mockMessages);
    setCurrentConversation(conversation);
  };

  // Enviar mensagem
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !currentConversation) return;

    try {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        conversationId: currentConversation.id,
        senderId: user?.id || '',
        senderName: (user?.firstName || '') + ' ' + (user?.lastName || '') || user?.name || 'Unknown User',
        senderEmail: user?.email || '',
        text: text.trim(),
        timestamp: new Date().toISOString(),
        outageId: currentConversation.outageId
      };

      // Adicionar mensagem localmente
      setMessages(prev => [...prev, newMessage]);

      // TODO: Enviar mensagem para o backend
      // await chatService.sendMessage({
      //   conversationId: currentConversation.id,
      //   text: text.trim()
      // });

      // Atualizar última mensagem na conversa
      setConversations(prev => prev.map(c => 
        c.id === currentConversation.id 
          ? { ...c, lastMessage: text.trim(), updatedAt: new Date().toISOString() }
          : c
      ));

      // Simular resposta automática (remover em produção)
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          conversationId: currentConversation.id,
          senderId: 'bot',
          senderName: 'System Bot',
          senderEmail: 'bot@company.com',
          text: 'Mensagem recebida e processada com sucesso!',
          timestamp: new Date().toISOString(),
          outageId: currentConversation.outageId
        };
        setMessages(prev => [...prev, autoReply]);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  }, [currentConversation, user]);

  // Criar nova conversa
  const createConversation = useCallback(async (data: CreateConversationRequest) => {
    try {
      // TODO: Substituir por chamada real da API
      // const newConversation = await chatService.createConversation(data);
      
      const newConversation: ChatConversation = {
        id: Date.now().toString(),
        topic: data.topic,
        participants: [
          { id: user?.id || '', name: (user?.firstName || '') + ' ' + (user?.lastName || '') || user?.name || 'Unknown', email: user?.email || '', role: user?.role || 'DEV' },
          // TODO: Adicionar participantes reais
        ],
        lastMessage: 'Conversation started',
        unread: 0,
        outageId: data.outageId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([]);

      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }, [user]);

  // Marcar conversa como lida
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      // TODO: Substituir por chamada real da API
      // await chatService.markAsRead(conversationId);
      
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unread: 0 } : c
      ));
      
      // Atualizar contador de não lidas
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, []);

  // Carregar contador de não lidas
  const loadUnreadCount = useCallback(async () => {
    try {
      // TODO: Substituir por chamada real da API
      // const count = await chatService.getUnreadCount();
      // setUnreadCount(count);
      
      // Por enquanto, calcular localmente
      const count = conversations.reduce((total, conv) => total + conv.unread, 0);
      setUnreadCount(count);
      
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, [conversations]);

  // Inicializar WebSocket
  const initializeWebSocket = useCallback(() => {
    if (!user?.id) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    chatService.initializeWebSocket(token, (message: ChatMessage) => {
      // Adicionar nova mensagem recebida
      if (message.conversationId === currentConversation?.id) {
        setMessages(prev => [...prev, message]);
      }

      // Atualizar conversa na lista
      setConversations(prev => prev.map(c => 
        c.id === message.conversationId 
          ? { 
              ...c, 
              lastMessage: message.text, 
              updatedAt: message.timestamp,
              unread: c.unread + 1
            }
          : c
      ));

      // Atualizar contador de não lidas
      setUnreadCount(prev => prev + 1);
    });
  }, [user?.id, currentConversation?.id]);

  // Cleanup WebSocket
  useEffect(() => {
    return () => {
      chatService.disconnect();
    };
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadConversations();
    loadUnreadCount();
  }, [loadConversations, loadUnreadCount]);

  // Inicializar WebSocket quando usuário mudar
  useEffect(() => {
    if (user?.id) {
      initializeWebSocket();
    }
  }, [user?.id, initializeWebSocket]);

  return {
    // Estado
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    unreadCount,
    messagesEndRef,
    
    // Ações
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
    markAsRead,
    setCurrentConversation,
    
    // Utilitários
    scrollToBottom
  };
};
