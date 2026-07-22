import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { ChatConversation, ChatMessage, FileAttachment } from '@/types';

interface ChatState {
  conversations: ChatConversation[];
  activeConversation: string | null;
  isGenerating: boolean;
  isStreaming: boolean;
  searchQuery: string;

  // Actions
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  regenerateMessage: (conversationId: string, messageId: string) => void;
  pinConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  searchConversations: (query: string) => ChatConversation[];
  exportConversation: (id: string, format: 'json' | 'md' | 'txt') => string;
  importConversation: (data: string, format: 'json' | 'md' | 'txt') => void;
  clearAllConversations: () => void;
  getConversationMessages: (id: string) => ChatMessage[];
  setSearchQuery: (query: string) => void;
  stopGeneration: () => void;
  continueResponse: (conversationId: string, messageId: string) => void;
  addAttachment: (conversationId: string, messageId: string, attachment: FileAttachment) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversation: null,
      isGenerating: false,
      isStreaming: false,
      searchQuery: '',

      createConversation: (title) => {
        const id = uuidv4();
        const newConversation: ChatConversation = {
          id,
          title: title || 'New Conversation',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          model: '',
          provider: '',
          isPinned: false,
          isArchived: false,
          tags: [],
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversation: id,
        }));
        return id;
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversation: state.activeConversation === id ? null : state.activeConversation,
        }));
      },

      setActiveConversation: (id) => {
        set({ activeConversation: id });
      },

      addMessage: (conversationId, message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: uuidv4(),
          timestamp: new Date(),
        };
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, newMessage],
                  updatedAt: new Date(),
                  title: c.messages.length === 0 && message.role === 'user' 
                    ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                    : c.title,
                }
              : c
          ),
        }));
      },

      updateMessage: (conversationId, messageId, updates) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, ...updates } : m
                  ),
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      deleteMessage: (conversationId, messageId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) }
              : c
          ),
        }));
      },

      regenerateMessage: (conversationId, messageId) => {
        // Implementation handled in chat service
        console.log('Regenerate:', conversationId, messageId);
      },

      pinConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c
          ),
        }));
      },

      renameConversation: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title } : c
          ),
        }));
      },

      searchConversations: (query) => {
        if (!query) return get().conversations;
        const lowerQuery = query.toLowerCase();
        return get().conversations.filter(
          (c) =>
            c.title.toLowerCase().includes(lowerQuery) ||
            c.messages.some((m) => m.content.toLowerCase().includes(lowerQuery))
        );
      },

      exportConversation: (id, format) => {
        const conversation = get().conversations.find((c) => c.id === id);
        if (!conversation) return '';

        if (format === 'json') {
          return JSON.stringify(conversation, null, 2);
        } else if (format === 'md') {
          return `# ${conversation.title}\n\n${conversation.messages
            .map((m) => `**${m.role}:**\n${m.content}\n`)
            .join('\n')}`;
        } else {
          return conversation.messages.map((m) => `${m.role}: ${m.content}`).join('\n\n');
        }
      },

      importConversation: (data, format) => {
        try {
          if (format === 'json') {
            const conversation = JSON.parse(data);
            conversation.id = uuidv4();
            conversation.createdAt = new Date(conversation.createdAt);
            conversation.updatedAt = new Date();
            set((state) => ({
              conversations: [conversation, ...state.conversations],
            }));
          }
        } catch (e) {
          console.error('Failed to import conversation:', e);
        }
      },

      clearAllConversations: () => {
        set({ conversations: [], activeConversation: null });
      },

      getConversationMessages: (id) => {
        const conversation = get().conversations.find((c) => c.id === id);
        return conversation?.messages || [];
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      stopGeneration: () => {
        set({ isGenerating: false, isStreaming: false });
      },

      continueResponse: (conversationId, messageId) => {
        console.log('Continue:', conversationId, messageId);
      },

      addAttachment: (conversationId, messageId, attachment) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId
                      ? { ...m, attachments: [...(m.attachments || []), attachment] }
                      : m
                  ),
                }
              : c
          ),
        }));
      },
    }),
    {
      name: 'nexus-chat-store',
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
);
