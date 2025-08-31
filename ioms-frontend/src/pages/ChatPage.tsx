// src/pages/ChatPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaperPlaneRight, ChatCircle as MessageCircle } from '@phosphor-icons/react';
import chatService from '../services/chat.service';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
  outageId?: string;
}

interface Conversation {
  id: string;
  topic: string;
  participants: Array<{ id: string; name: string; email: string; role: string }>;
  lastMessage: string;
  unread: number;
  outageId?: string;
  createdAt: string;
}

interface ChatUser {
  // Removido: interface não utilizada
}

export default function ChatPage() {
  const { user } = useAuth();
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  // const [users, setUsers] = useState<ChatUser[]>([]); // Descomente se for usar participantes reais
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationTopic, setNewConversationTopic] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar mensagens de uma conversa
  const loadConversationMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const msgs = await chatService.getMessages(conversationId);
      setMessages(msgs.map(msg => ({
        ...msg,
        isCurrentUser: msg.senderId === user?.id
      })));
      setCurrentConversation(conversationId);
      // Marcar como lida (opcional, se houver endpoint)
      setConversations(prev => prev.map(c =>
        c.id === conversationId ? { ...c, unread: 0 } : c
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('Message error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversation) return;
    try {
      setIsLoading(true);
      setError(null);
      const sentMsg = await chatService.sendMessage({
        conversationId: currentConversation,
        text: message
      });
      setMessages(prev => [...prev, { ...sentMsg, isCurrentUser: true }]);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Send error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Criar nova conversa
  const handleCreateConversation = async () => {
    if (!newConversationTopic.trim() || selectedParticipants.length === 0) return;
    try {
      setIsLoading(true);
      setError(null);
      const newConversation = await chatService.createConversation({
        topic: newConversationTopic,
        participantIds: [user?.id, ...selectedParticipants].filter((id): id is string => typeof id === 'string')
      });
      setConversations(prev => [newConversation, ...prev]);
      setShowNewConversation(false);
      setNewConversationTopic('');
      setSelectedParticipants([]);
      setCurrentConversation(newConversation.id);
      // Carregar mensagens da nova conversa
      await loadConversationMessages(newConversation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      console.error('Create error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadChatData = async () => {
      if (!user?.companyId) return;
      try {
        setIsLoading(true);
        setError(null);
        const conversationsData = await chatService.getConversations();
        setConversations(conversationsData);
        // Se necessário, carregar usuários participantes via API
        // const usersData = await userService.getUsers();
        // setUsers(usersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat data');
        console.error('Chat error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadChatData();
  }, [user]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error loading chat:</strong> {error}
            <button 
              onClick={() => window.location.reload()} 
              className="ml-4 text-red-800 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white rounded-lg shadow-sm border">
      {/* ...restante do JSX... */}
    </div>
  );
}
