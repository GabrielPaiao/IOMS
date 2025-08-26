// src/pages/ChatPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaperPlaneRight, ChatCircle as MessageCircle } from '@phosphor-icons/react';

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
  id: string;
  name: string;
  email: string;
  role: string;
  isOnline: boolean;
  lastSeen?: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationTopic, setNewConversationTopic] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

        // TODO: Substituir por chamadas reais da API
        // Por enquanto, usar dados mockados
        await loadMockData();
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat data');
        console.error('Chat error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatData();
  }, [user?.companyId]);

  const loadMockData = async () => {
    // Simular delay de carregamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dados mockados das conversas
    const mockConversations: Conversation[] = [
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
        createdAt: '2025-01-20T09:15:00Z'
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
        createdAt: '2025-01-21T08:00:00Z'
      }
    ];

    // Dados mockados dos usuários
    const mockUsers: ChatUser[] = [
      { id: '1', name: 'John Doe', email: 'john@company.com', role: 'DEV', isOnline: true },
      { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'KEY_USER', isOnline: false, lastSeen: '2025-01-20T18:30:00Z' },
      { id: '3', name: 'Admin User', email: 'admin@company.com', role: 'ADMIN', isOnline: true },
      { id: '4', name: 'Bob Wilson', email: 'bob@company.com', role: 'KEY_USER', isOnline: false, lastSeen: '2025-01-21T09:15:00Z' }
    ];

    setConversations(mockConversations);
    setUsers(mockUsers);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversation) return;

    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: user?.id || '',
        senderName: (user?.firstName || '') + ' ' + (user?.lastName || '') || user?.name || 'Unknown User',
        senderEmail: user?.email || '',
        text: message.trim(),
        timestamp: new Date().toISOString(),
        isCurrentUser: true,
        outageId: conversations.find(c => c.id === currentConversation)?.outageId
      };

      // Adicionar mensagem localmente
      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      // TODO: Enviar mensagem para o backend
      console.log('Sending message to backend:', newMessage);

      // Simular resposta automática (remover em produção)
      setTimeout(() => {
        const autoReply: Message = {
          id: (Date.now() + 1).toString(),
          senderId: 'bot',
          senderName: 'System Bot',
          senderEmail: 'bot@company.com',
          text: 'Mensagem recebida e processada com sucesso!',
          timestamp: new Date().toISOString(),
          isCurrentUser: false,
          outageId: conversations.find(c => c.id === currentConversation)?.outageId
        };
        setMessages(prev => [...prev, autoReply]);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const handleCreateConversation = async () => {
    if (!newConversationTopic.trim() || selectedParticipants.length === 0) return;

    try {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        topic: newConversationTopic.trim(),
        participants: [
          { id: user?.id || '', name: (user?.firstName || '') + ' ' + (user?.lastName || '') || user?.name || 'Unknown', email: user?.email || '', role: user?.role || 'DEV' },
          ...users.filter(u => selectedParticipants.includes(u.id))
        ],
        lastMessage: 'Conversation started',
        unread: 0,
        createdAt: new Date().toISOString()
      };

      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation.id);
      setShowNewConversation(false);
      setNewConversationTopic('');
      setSelectedParticipants([]);

      // TODO: Criar conversa no backend
      console.log('Creating conversation in backend:', newConversation);

    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Error creating conversation. Please try again.');
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      // TODO: Carregar mensagens do backend
      // Por enquanto, usar dados mockados
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: '2',
          senderName: 'Jane Smith',
          senderEmail: 'jane@company.com',
          text: 'Precisamos atualizar o módulo financeiro',
          timestamp: '2025-01-20T09:15:00Z',
          isCurrentUser: false,
          outageId: conversation.outageId
        },
        {
          id: '2',
          senderId: user?.id || '',
          senderName: (user?.firstName || '') + ' ' + (user?.lastName || '') || user?.name || 'Unknown User',
          senderEmail: user?.email || '',
          text: 'Podemos agendar para depois das 14h?',
          timestamp: '2025-01-20T10:30:00Z',
          isCurrentUser: true,
          outageId: conversation.outageId
        },
        {
          id: '3',
          senderId: '1',
          senderName: 'John Doe',
          senderEmail: 'john@company.com',
          text: 'Sim, perfeito. Vou preparar tudo.',
          timestamp: '2025-01-20T10:35:00Z',
          isCurrentUser: false,
          outageId: conversation.outageId
        }
      ];

      setMessages(mockMessages);
      setCurrentConversation(conversationId);

      // Marcar como lida
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unread: 0 } : c
      ));

    } catch (error) {
      console.error('Error loading messages:', error);
      alert('Error loading messages. Please try again.');
    }
  };

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
      {/* Lista de conversas */}
      <div className="w-1/3 border-r p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-gray-800">Conversations</h2>
          <button
            onClick={() => setShowNewConversation(true)}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
          >
            <MessageCircle size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => loadConversationMessages(conv.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversation === conv.id
                  ? 'bg-blue-50 border border-blue-100'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-800">{conv.topic}</h3>
                {conv.unread > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {conv.unread}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate mt-1">{conv.lastMessage}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex -space-x-1">
                  {conv.participants.slice(0, 3).map((participant) => (
                    <div
                      key={participant.id}
                      className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600"
                      title={`${participant.name} (${participant.role})`}
                    >
                      {participant.name.charAt(0)}
                    </div>
                  ))}
                  {conv.participants.length > 3 && (
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
                      +{conv.participants.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(conv.createdAt)}
                </span>
              </div>
              {conv.outageId && (
                <span className="inline-block mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Outage #{conv.outageId}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Área de conversa */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">
                  {conversations.find(c => c.id === currentConversation)?.topic}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {conversations.find(c => c.id === currentConversation)?.participants.length} participants
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.isCurrentUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.isCurrentUser && (
                        <span className="font-medium text-sm">
                          {msg.senderName}
                        </span>
                      )}
                      <span className="text-xs opacity-80">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperPlaneRight size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={24} className="text-gray-400" />
              </div>
              <h3 className="font-medium">Select a conversation</h3>
              <p className="text-sm mt-1">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal para nova conversa */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold mb-4">New Conversation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={newConversationTopic}
                  onChange={(e) => setNewConversationTopic(e.target.value)}
                  placeholder="Enter conversation topic..."
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participants
                </label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                  {users.filter(u => u.id !== user?.id).map((u) => (
                    <label key={u.id} className="flex items-center space-x-2 p-1">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParticipants([...selectedParticipants, u.id]);
                          } else {
                            setSelectedParticipants(selectedParticipants.filter(id => id !== u.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{u.name} ({u.role})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowNewConversation(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConversation}
                disabled={!newConversationTopic.trim() || selectedParticipants.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}