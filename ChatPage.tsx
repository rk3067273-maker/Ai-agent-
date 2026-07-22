import ConversationList from '@/components/chat/ConversationList';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6">
      <ConversationList />
      <div className="flex-1 flex flex-col">
        <ChatInterface />
      </div>
    </div>
  );
}
