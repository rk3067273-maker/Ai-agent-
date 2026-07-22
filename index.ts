// AI Provider Types
export interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  customEndpoint?: string;
  models: AIModel[];
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  streaming: boolean;
  timeout: number;
  retryCount: number;
  priority: number;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastHealthCheck?: Date;
  usageStats: ProviderUsageStats;
  errorLogs: ProviderErrorLog[];
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  supportsVision: boolean;
  supportsStreaming: boolean;
  pricing?: {
    input: number;
    output: number;
  };
}

export interface ProviderUsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
  successRate: number;
  lastUsed?: Date;
}

export interface ProviderErrorLog {
  id: string;
  timestamp: Date;
  error: string;
  statusCode?: number;
  requestId?: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
  tokens?: number;
  latency?: number;
  attachments?: FileAttachment[];
  isStreaming?: boolean;
  isError?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  provider: string;
  isPinned: boolean;
  isArchived: boolean;
  tags: string[];
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  url?: string;
}

// Voice Types
export interface VoiceSettings {
  enabled: boolean;
  voice: string;
  speed: number;
  volume: number;
  pitch: number;
  language: string;
  pushToTalk: boolean;
  continuousListening: boolean;
  noiseReduction: boolean;
  wakeWord?: string;
  wakeWordEnabled: boolean;
}

// Code Workspace Types
export interface CodeFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isOpen: boolean;
  isModified: boolean;
  isActive: boolean;
}

export interface CodeProject {
  id: string;
  name: string;
  files: CodeFile[];
  activeFileId?: string;
  language: string;
  framework?: string;
}

// Settings Types
export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  fontSize: number;
  codeFontSize: number;
  sidebarCollapsed: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  defaultProvider: string;
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  responseStyle: 'concise' | 'balanced' | 'detailed';
  memoryEnabled: boolean;
  memoryLimit: number;
  exportFormat: 'json' | 'md' | 'txt';
  highContrast: boolean;
  reduceMotion: boolean;
}

// Admin Types
export interface SystemStats {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  activeProviders: number;
  totalProviders: number;
  averageLatency: number;
  uptime: number;
  errorsLast24h: number;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  action: string;
  user?: string;
  details: string;
  severity: 'info' | 'warning' | 'error';
}

// Project Generation Types
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  files: ProjectFile[];
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
}

export interface ProjectFile {
  path: string;
  content: string;
  isDirectory?: boolean;
}

export interface GeneratedProject {
  id: string;
  name: string;
  template: string;
  files: ProjectFile[];
  createdAt: Date;
  readme: string;
  buildInstructions: string;
  deployInstructions: string;
}

// API Response Types
export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  latency: number;
  finishReason: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  model?: string;
  provider?: string;
}

// Memory Types
export interface ConversationMemory {
  id: string;
  conversationId: string;
  summary: string;
  keyPoints: string[];
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreference {
  key: string;
  value: any;
  category: string;
  updatedAt: Date;
}
