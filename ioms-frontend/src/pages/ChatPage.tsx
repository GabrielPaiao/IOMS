// src/pages/ChatPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaperPlaneRight, ChatCircle as MessageCircle } from '@phosphor-icons/react';
import chatService from '../services/chat.service';
import authService from '../services/auth.service';

interface Message {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  isCurrentUser: boolean;
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

interface Conversation {
  id: string;
  title: string;
  participants: Array<{ id: string; name: string; email: string; role: string }>;
  lastMessage: string;
  unread: number;
  outageId?: string;
  createdAt: string;
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
      console.log(`[CHATPAGE] Loading conversation messages for: ${conversationId}`);
      setIsLoading(true);
      setError(null);

      // Sair da conversa anterior se houver uma
      if (currentConversation && currentConversation !== conversationId) {
        console.log(`[CHATPAGE] Leaving previous conversation: ${currentConversation}`);
        chatService.leaveConversation(currentConversation);
      }

      const response = await chatService.getMessages(conversationId);
      const msgs = response.messages || [];
      setMessages(msgs.map(msg => ({
        ...msg,
        isCurrentUser: msg.userId === user?.id
      })));
      setCurrentConversation(conversationId);

      // Aguardar um pouco para o WebSocket estar conectado antes de enviar join
      console.log(`[CHATPAGE] Waiting for WebSocket to be ready before joining conversation: ${conversationId}`);
      setTimeout(() => {
        console.log(`[CHATPAGE] Attempting to join conversation: ${conversationId}`);
        chatService.joinConversation(conversationId);
      }, 1000);

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
        content: message
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
        title: newConversationTopic,
        participantEmails: selectedParticipants,
        type: 'group'
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

  // Carregar dados iniciais e inicializar WebSocket
  useEffect(() => {
    const loadChatData = async () => {
      if (!user?.companyId) return;
      try {
        setIsLoading(true);
        setError(null);
        
        // Carregar conversas
        console.log('[CHATPAGE] Loading conversations...');
        const conversationsData = await chatService.getConversations();
        console.log('[CHATPAGE] Conversations loaded:', conversationsData);
        console.log('[CHATPAGE] Number of conversations:', conversationsData?.length || 0);
        console.log('[CHATPAGE] First conversation structure:', conversationsData[0]);
        
        setConversations(conversationsData);
        
        // Inicializar WebSocket
        const token = authService.getAccessToken();
        console.log('[CHATPAGE] Token for WebSocket:', token ? 'Token available' : 'No token found');
        if (token) {
          console.log('[CHATPAGE] Initializing WebSocket connection...');
          chatService.initializeWebSocket(token, (chatMessage) => {
            // Adicionar mensagem recebida se for da conversa atual
            if (chatMessage.conversationId === currentConversation) {
              const message: Message = {
                ...chatMessage,
                isCurrentUser: chatMessage.userId === user?.id
              };
              setMessages(prev => [...prev, message]);
            }
          });
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat data');
        console.error('Chat error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChatData();
    
    // Cleanup: desconectar WebSocket quando componente desmontar
    return () => {
      if (currentConversation) {
        chatService.leaveConversation(currentConversation);
      }
      chatService.disconnect();
    };
  }, [user, currentConversation]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };  if (isLoading) {
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Chat</h1>
        
        <div className="flex bg-white rounded-lg shadow-sm border" style={{height: '80vh'}}>
          {/* Lista de Conversas */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
              <button
                onClick={() => setShowNewConversation(true)}
                className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Nova Conversa
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => loadConversationMessages(conv.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      currentConversation === conv.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 truncate">{conv.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage || 'Sem mensagens'}</p>
                    {conv.unread > 0 && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma conversa encontrada
                </div>
              )}
            </div>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 flex flex-col">
            {currentConversation ? (
              <>
                {/* Header da Conversa */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conversations.find(c => c.id === currentConversation)?.title || 'Conversa'}
                  </h3>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isCurrentUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        {!message.isCurrentUser && (
                          <p className="text-xs font-medium mb-1 opacity-75">
                            {message.user.firstName} {message.user.lastName}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input de Mensagem */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <PaperPlaneRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione uma conversa
                  </h3>
                  <p className="text-gray-600">
                    Escolha uma conversa existente ou crie uma nova para começar a conversar.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Nova Conversa */}
        {showNewConversation && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowNewConversation(false)}></div>
              <div className="relative bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Conversa</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título da Conversa
                    </label>
                    <input
                      type="text"
                      value={newConversationTopic}
                      onChange={(e) => setNewConversationTopic(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite o título da conversa..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Participantes
                    </label>
                    <input
                      type="text"
                      value={selectedParticipants.join(', ')}
                      onChange={(e) => setSelectedParticipants(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="exemplo@empresa.com, outro@empresa.com..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Digite os emails dos participantes separados por vírgula. Você será incluído automaticamente na conversa.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowNewConversation(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateConversation}
                    disabled={!newConversationTopic.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Criar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
