// src/pages/ChatPage.tsx
export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-180px)]">
      <div className="w-1/3 border-r p-4">
        <h2 className="font-bold mb-4">Conversations</h2>
        {/* Lista de chats */}
        <div className="space-y-2">
          {['ERP Maintenance', 'Database Update'].map((topic) => (
            <div key={topic} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
              {topic}
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 p-4">
        <div className="h-full flex flex-col">
          <div className="border-b pb-4">
            <h3 className="font-bold">Selected Conversation</h3>
          </div>
          <div className="flex-grow my-4 overflow-auto">
            {/* Mensagens aparecerão aqui */}
          </div>
          <div className="mt-auto">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}