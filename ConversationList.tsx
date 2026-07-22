import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pin, Trash2, Edit3, MessageSquare, X } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

export default function ConversationList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const { conversations, activeConversation, setActiveConversation, createConversation, deleteConversation, pinConversation, renameConversation, searchConversations } = useChatStore();

  const filtered = searchQuery ? searchConversations(searchQuery) : conversations;
  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleRename = (id: string) => {
    if (editTitle.trim()) {
      renameConversation(id, editTitle);
    }
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <div className="w-72 bg-dark-900 border-r border-dark-800 flex flex-col h-full">
      <div className="p-4 border-b border-dark-800">
        <button
          onClick={() => createConversation()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {sorted.length === 0 && (
          <div className="text-center py-8 text-dark-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
          </div>
        )}

        {sorted.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => setActiveConversation(conversation.id)}
            className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
              activeConversation === conversation.id
                ? 'bg-primary-500/10 border border-primary-500/20'
                : 'hover:bg-dark-800 border border-transparent'
            }`}
          >
            <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
              activeConversation === conversation.id ? 'text-primary-400' : 'text-dark-500'
            }`} />

            <div className="flex-1 min-w-0">
              {editingId === conversation.id ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleRename(conversation.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename(conversation.id)}
                  className="w-full bg-dark-800 border border-primary-500 rounded px-2 py-1 text-sm text-white focus:outline-none"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <p className={`text-sm font-medium truncate ${
                    activeConversation === conversation.id ? 'text-primary-400' : 'text-dark-300'
                  }`}>
                    {conversation.title}
                  </p>
                  <p className="text-xs text-dark-500">
                    {conversation.messages.length} messages
                  </p>
                </>
              )}
            </div>

            {conversation.isPinned && <Pin className="w-3 h-3 text-primary-400 flex-shrink-0" />}

            <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setEditingId(conversation.id); setEditTitle(conversation.title); }}
                className="p-1 rounded hover:bg-dark-700 text-dark-500 hover:text-white"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); pinConversation(conversation.id); }}
                className="p-1 rounded hover:bg-dark-700 text-dark-500 hover:text-white"
              >
                <Pin className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteConversation(conversation.id); }}
                className="p-1 rounded hover:bg-red-500/20 text-dark-500 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
