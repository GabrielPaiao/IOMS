// src/pages/ChatPage.tsx
import { useState } from 'react';
import { PaperPlaneRight } from '@phosphor-icons/react';

type Message = {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
};

type Conversation = {
  id: string;
  topic: string;
  lastMessage: string;
  unread: number;
  outageId?: string;
};

export default function ChatPage() {
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  
  // Dados mockados das conversas
  const conversations: Conversation[] = [
    {
      id: '1',
      topic: 'ERP Maintenance',
      lastMessage: 'Precisamos atualizar o módulo financeiro',
      unread: 2,
      outageId: '101'
    },
    {
      id: '2',
      topic: 'Database Update',
      lastMessage: 'Migration scheduled for tomorrow',
      unread: 0,
      outageId: '102'
    }
  ];

  // Dados mockados das mensagens
  const messages: Record<string, Message[]> = {
    '1': [
      {
        id: '1',
        sender: 'dev@company.com',
        text: 'Precisamos atualizar o módulo financeiro',
        timestamp: '2025-07-20T09:15:00Z',
        isCurrentUser: false
      },
      {
        id: '2',
        sender: 'ku@company.com',
        text: 'Podemos agendar para depois das 14h?',
        timestamp: '2025-07-20T10:30:00Z',
        isCurrentUser: true
      },
      {
        id: '3',
        sender: 'dev@company.com',
        text: 'Sim, perfeito. Vou preparar tudo.',
        timestamp: '2025-07-20T10:35:00Z',
        isCurrentUser: false
      }
    ],
    '2': [
      {
        id: '1',
        sender: 'admin@company.com',
        text: 'Database migration scheduled for tomorrow',
        timestamp: '2025-07-21T08:00:00Z',
        isCurrentUser: false
      }
    ]
  };

  const handleSendMessage = () => {
    if (message.trim() && currentConversation) {
      // Lógica para enviar mensagem
      setMessage('');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white rounded-lg shadow-sm border">
      {/* Lista de conversas */}
      <div className="w-1/3 border-r p-4 flex flex-col">
        <h2 className="font-bold text-lg mb-6 text-gray-800">Conversations</h2>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setCurrentConversation(conv.id)}
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
      <div className="w-2/3 flex flex-col">
        {currentConversation ? (
          <>
            <div className="border-b p-4">
              <h3 className="font-bold text-gray-800">
                {conversations.find(c => c.id === currentConversation)?.topic}
              </h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages[currentConversation]?.map((msg) => (
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
                          {msg.sender.split('@')[0]}
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
            </div>
            
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                <PaperPlaneRight size={24} className="text-gray-400" />
              </div>
              <h3 className="font-medium">Select a conversation</h3>
              <p className="text-sm mt-1">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}