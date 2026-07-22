import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Square, Paperclip, Mic, Copy, Check, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useProviderStore } from '@/stores/providerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { aiService } from '@/services/aiService';
import { voiceService } from '@/services/voiceService';
import { FileParserService } from '@/utils/fileParser';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { activeConversation, conversations, addMessage, updateMessage, createConversation } = useChatStore();
  const { getBestProvider } = useProviderStore();
  const { voice } = useSettingsStore();

  const conversation = conversations.find(c => c.id === activeConversation);
  const messages = conversation?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const provider = getBestProvider();
    if (!provider) {
      toast.error('No AI provider configured. Please add an API key in Settings > Providers.');
      return;
    }

    let convId = activeConversation;
    if (!convId) {
      convId = createConversation();
    }
    if (!convId) return;

    const userContent = input;
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    addMessage(convId, { role: 'user', content: userContent });

    try {
      const allMessages = [...messages, { role: 'user' as const, content: userContent }];

      if (provider.streaming) {
        let assistantMsgId = '';
        let firstChunk = true;

        await aiService.sendMessage(
          allMessages.map(m => ({ ...m, id: crypto.randomUUID(), timestamp: new Date(), attachments: [] })),
          provider,
          (chunk) => {
            if (firstChunk) {
              firstChunk = false;
            }
            setStreamingContent(chunk.content);
            if (chunk.done) {
              setStreamingContent('');
            }
          }
        );

        // Add final message
        addMessage(convId, { 
          role: 'assistant', 
          content: streamingContent || 'Response received',
          model: provider.selectedModel,
          provider: provider.name 
        });
      } else {
        const response = await aiService.sendMessage(
          allMessages.map(m => ({ ...m, id: crypto.randomUUID(), timestamp: new Date(), attachments: [] })),
          provider
        );

        addMessage(convId, { 
          role: 'assistant', 
          content: response.content,
          model: response.model,
          provider: response.provider,
          tokens: response.tokens.total,
          latency: response.latency 
        });

        if (voice.enabled) {
          voiceService.speak(response.content, voice);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to get response');
      addMessage(convId, { 
        role: 'assistant', 
        content: 'Error: Failed to get response from AI provider. Please check your API key and try again.',
        isError: true 
      });
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const attachment = await FileParserService.parseFile(file);
      toast.success(`File uploaded: ${file.name}`);
    } catch (error) {
      toast.error('Failed to parse file');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4">
              <Send className="w-10 h-10 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Start a Conversation</h3>
            <p className="text-dark-400 max-w-md">
              Ask me anything about coding, debugging, or generate complete projects. I support 13+ AI providers.
            </p>
            <div className="mt-6 flex gap-2 flex-wrap justify-center">
              {['Write a React component', 'Debug my Python code', 'Create a Flutter app', 'Explain this code'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm text-dark-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
            onCopy={() => copyToClipboard(message.content)}
          />
        ))}

        {streamingContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">AI</span>
            </div>
            <div className="flex-1 bg-dark-800/50 rounded-2xl p-4 border border-dark-700/50">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{streamingContent}</ReactMarkdown>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                <span className="text-xs text-dark-500">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-dark-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2 bg-dark-800 border border-dark-700 rounded-2xl p-2 focus-within:border-primary-500/50 transition-colors">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept={FileParserService.getSupportedTypes().join(',')}
            />

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... (Shift+Enter for new line)"
              className="flex-1 bg-transparent text-white placeholder-dark-500 resize-none max-h-32 py-2 px-2 focus:outline-none text-sm"
              rows={1}
              style={{ minHeight: '24px' }}
            />

            <button
              onClick={() => {}}
              className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <Square className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-dark-500 mt-2 text-center">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageItem({ message, isLast, onCopy }: { message: any; isLast: boolean; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-primary-600' : 'bg-purple-600'
      }`}>
        <span className="text-xs font-bold text-white">{isUser ? 'U' : 'AI'}</span>
      </div>

      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block rounded-2xl p-4 text-left ${
          isUser 
            ? 'bg-primary-600/20 border border-primary-500/20' 
            : message.isError
            ? 'bg-red-500/10 border border-red-500/20'
            : 'bg-dark-800/50 border border-dark-700/50'
        }`}>
          {isUser ? (
            <p className="text-white whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/
$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 mt-2">
            <button onClick={handleCopy} className="p-1.5 rounded-lg text-dark-500 hover:text-white hover:bg-dark-800 transition-colors" title="Copy">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button className="p-1.5 rounded-lg text-dark-500 hover:text-white hover:bg-dark-800 transition-colors" title="Regenerate">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-dark-500 hover:text-white hover:bg-dark-800 transition-colors" title="Helpful">
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-dark-500 hover:text-white hover:bg-dark-800 transition-colors" title="Not helpful">
              <ThumbsDown className="w-4 h-4" />
            </button>
            {message.model && (
              <span className="text-xs text-dark-500 ml-auto">
                {message.provider} &bull; {message.model} &bull; {message.latency}ms
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
