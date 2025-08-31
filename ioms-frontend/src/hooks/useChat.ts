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

  // Chamada real da API
  const data = await chatService.getConversations();
  setConversations(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.companyId]);



  // Carregar mensagens de uma conversa
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      setError(null);

  // Chamada real da API
  const data = await chatService.getMessages(conversationId);
  setMessages(data);
      
      // Marcar como lida
      await markAsRead(conversationId);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);



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


      // Enviar mensagem para o backend
      await chatService.sendMessage({
        conversationId: currentConversation.id,
        text: text.trim()
      });

      // Atualizar última mensagem na conversa
      setConversations(prev => prev.map(c => 
        c.id === currentConversation.id 
          ? { ...c, lastMessage: text.trim(), updatedAt: new Date().toISOString() }
          : c
      ));



    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  }, [currentConversation, user]);

  // Criar nova conversa
  const createConversation = useCallback(async (data: CreateConversationRequest) => {
    try {
  // Chamada real da API
  const newConversation = await chatService.createConversation(data);
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

  // Chamada real da API
  await chatService.markAsRead(conversationId);
      
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

  // Chamada real da API
  const count = await chatService.getUnreadCount();
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
