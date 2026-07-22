import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIProvider, ProviderErrorLog } from '@/types';

interface ProviderState {
  providers: AIProvider[];
  activeProvider: string | null;
  routingMode: 'manual' | 'auto' | 'smart';
  isLoading: boolean;
  error: string | null;

  addProvider: (provider: AIProvider) => void;
  updateProvider: (id: string, updates: Partial<AIProvider>) => void;
  removeProvider: (id: string) => void;
  setActiveProvider: (id: string | null) => void;
  setRoutingMode: (mode: 'manual' | 'auto' | 'smart') => void;
  testProvider: (id: string) => Promise<boolean>;
  healthCheckAll: () => Promise<void>;
  getEnabledProviders: () => AIProvider[];
  getHealthyProviders: () => AIProvider[];
  getBestProvider: () => AIProvider | null;
  addErrorLog: (providerId: string, error: ProviderErrorLog) => void;
  updateUsageStats: (providerId: string, tokens: number, latency: number) => void;
  reorderProviders: (providers: AIProvider[]) => void;
}

const defaultProviders: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-4o, GPT-3.5 Turbo',
    icon: 'Brain',
    enabled: false,
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable multimodal model', maxTokens: 128000, supportsVision: true, supportsStreaming: true, pricing: { input: 0.005, output: 0.015 } },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable', maxTokens: 128000, supportsVision: true, supportsStreaming: true, pricing: { input: 0.00015, output: 0.0006 } },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High capability', maxTokens: 128000, supportsVision: true, supportsStreaming: true, pricing: { input: 0.01, output: 0.03 } },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective', maxTokens: 16385, supportsVision: false, supportsStreaming: true, pricing: { input: 0.0005, output: 0.0015 } },
    ],
    selectedModel: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 1,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini Pro, Gemini Ultra',
    icon: 'Sparkles',
    enabled: false,
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Advanced reasoning', maxTokens: 2097152, supportsVision: true, supportsStreaming: true },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient', maxTokens: 1048576, supportsVision: true, supportsStreaming: true },
      { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', description: 'General purpose', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
    ],
    selectedModel: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 8192,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 2,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus',
    icon: 'MessageSquare',
    enabled: false,
    apiKey: '',
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Best balance of performance', maxTokens: 200000, supportsVision: true, supportsStreaming: true, pricing: { input: 0.003, output: 0.015 } },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Highest capability', maxTokens: 200000, supportsVision: true, supportsStreaming: true, pricing: { input: 0.015, output: 0.075 } },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast and affordable', maxTokens: 200000, supportsVision: true, supportsStreaming: true, pricing: { input: 0.00025, output: 0.00125 } },
    ],
    selectedModel: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 3,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference',
    icon: 'Zap',
    enabled: false,
    apiKey: '',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', description: 'Powerful open model', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Fast and efficient', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Mixture of experts', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google lightweight', maxTokens: 8192, supportsVision: false, supportsStreaming: true },
    ],
    selectedModel: 'llama-3.1-70b-versatile',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 4,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Large, Mistral Medium',
    icon: 'Wind',
    enabled: false,
    apiKey: '',
    baseUrl: 'https://api.mistral.ai/v1',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', description: 'Top-tier performance', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', description: 'Balanced performance', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
      { id: 'mistral-small-latest', name: 'Mistral Small', description: 'Fast and efficient', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
      { id: 'codestral-latest', name: 'Codestral', description: 'Code specialized', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
    ],
    selectedModel: 'mistral-large-latest',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 5,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Command R, Command R+',
    icon: 'Command',
    enabled: false,
    apiKey: '',
    baseUrl: 'https://api.cohere.ai/v1',
    models: [
      { id: 'command-r-plus', name: 'Command R+', description: 'Advanced reasoning', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
      { id: 'command-r', name: 'Command R', description: 'General purpose', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
      { id: 'command', name: 'Command', description: 'Fast generation', maxTokens: 4096, supportsVision: false, supportsStreaming: true },
    ],
    selectedModel: 'command-r-plus',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 6,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek Chat, DeepSeek Coder',
    icon: 'Code2',
    enabled: false,
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'General chat', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Code specialized', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
    ],
    selectedModel: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 7,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'Sonar models with search',
    icon: 'Search',
    enabled: false,
    apiKey: '',
    baseUrl: 'https://api.perplexity.ai',
    models: [
      { id: 'llama-3.1-sonar-large-128k-online', name: 'Sonar Large Online', description: 'Large with search', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
      { id: 'llama-3.1-sonar-small-128k-online', name: 'Sonar Small Online', description: 'Small with search', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
      { id: 'llama-3.1-sonar-huge-128k-online', name: 'Sonar Huge Online', description: 'Huge with search', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
    ],
    selectedModel: 'llama-3.1-sonar-large-128k-online',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 8,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
  {
    id: 'together',
    name: 'Together AI',
    description: 'Open source models hub',
    icon: 'Users',
    enabled: false,
    apiKey: '',
    baseUrl: 'https://api.together.xyz/v1',
    models: [
      { id: 'meta-llama/Llama-3.1-70B-Instruct-Turbo', name: 'Llama 3.1 70B', description: 'Meta Llama', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
      { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', description: 'Mixture of experts', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
      { id: 'Qwen/Qwen2-72B-Instruct', name: 'Qwen2 72B', description: 'Alibaba Qwen', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
    ],
    selectedModel: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 9,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
  {
    id: 'ai21',
    name: 'AI21 Labs',
    description: 'Jamba, Jurassic models',
    icon: 'BrainCircuit',
    enabled: false,
    apiKey: '',
    baseUrl: 'https://api.ai21.com/studio/v1',
    models: [
      { id: 'jamba-1.5-large', name: 'Jamba 1.5 Large', description: 'Large model', maxTokens: 256000, supportsVision: false, supportsStreaming: true },
      { id: 'jamba-1.5-mini', name: 'Jamba 1.5 Mini', description: 'Mini model', maxTokens: 256000, supportsVision: false, supportsStreaming: true },
    ],
    selectedModel: 'jamba-1.5-large',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 10,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Inference API for open models',
    icon: 'Smile',
    enabled: false,
    apiKey: '',
    baseUrl: 'https://api-inference.huggingface.co/models',
    models: [
      { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B', description: 'Meta Llama', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
      { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', description: 'Mixture of experts', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
      { id: 'microsoft/Phi-3-medium-128k-instruct', name: 'Phi-3 Medium', description: 'Microsoft Phi', maxTokens: 128000, supportsVision: false, supportsStreaming: true },
    ],
    selectedModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 11,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    description: 'Microsoft Azure OpenAI Service',
    icon: 'Cloud',
    enabled: false,
    apiKey: '',
    baseUrl: '',
    customEndpoint: '',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Multimodal', maxTokens: 128000, supportsVision: true, supportsStreaming: true },
      { id: 'gpt-4', name: 'GPT-4', description: 'High capability', maxTokens: 8192, supportsVision: false, supportsStreaming: true },
      { id: 'gpt-35-turbo', name: 'GPT-3.5 Turbo', description: 'Fast', maxTokens: 16385, supportsVision: false, supportsStreaming: true },
    ],
    selectedModel: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 12,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    description: 'Your own API endpoint',
    icon: 'Settings',
    enabled: false,
    apiKey: '',
    baseUrl: '',
    customEndpoint: '',
    models: [
      { id: 'custom-model', name: 'Custom Model', description: 'Your model', maxTokens: 32768, supportsVision: false, supportsStreaming: true },
    ],
    selectedModel: 'custom-model',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    streaming: true,
    timeout: 30000,
    retryCount: 3,
    priority: 13,
    healthStatus: 'unknown',
    usageStats: { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0, successRate: 100 },
    errorLogs: [],
  },
];

export const useProviderStore = create<ProviderState>()(
  persist(
    (set, get) => ({
      providers: defaultProviders,
      activeProvider: null,
      routingMode: 'manual',
      isLoading: false,
      error: null,

      addProvider: (provider) => {
        set((state) => ({ providers: [...state.providers, provider] }));
      },

      updateProvider: (id, updates) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      removeProvider: (id) => {
        set((state) => ({
          providers: state.providers.filter((p) => p.id !== id),
          activeProvider: state.activeProvider === id ? null : state.activeProvider,
        }));
      },

      setActiveProvider: (id) => {
        set({ activeProvider: id });
      },

      setRoutingMode: (mode) => {
        set({ routingMode: mode });
      },

      testProvider: async (id) => {
        const provider = get().providers.find((p) => p.id === id);
        if (!provider || !provider.apiKey) return false;

        try {
          const response = await fetch(`${provider.baseUrl}/models`, {
            headers: { 'Authorization': `Bearer ${provider.apiKey}` },
          });
          const success = response.ok;

          set((state) => ({
            providers: state.providers.map((p) =>
              p.id === id ? { ...p, healthStatus: success ? 'healthy' : 'unhealthy', lastHealthCheck: new Date() } : p
            ),
          }));

          return success;
        } catch {
          set((state) => ({
            providers: state.providers.map((p) =>
              p.id === id ? { ...p, healthStatus: 'unhealthy', lastHealthCheck: new Date() } : p
            ),
          }));
          return false;
        }
      },

      healthCheckAll: async () => {
        const { providers, testProvider } = get();
        for (const provider of providers) {
          if (provider.enabled && provider.apiKey) {
            await testProvider(provider.id);
          }
        }
      },

      getEnabledProviders: () => get().providers.filter((p) => p.enabled),

      getHealthyProviders: () => get().providers.filter((p) => p.enabled && p.healthStatus === 'healthy'),

      getBestProvider: () => {
        const { routingMode, providers, activeProvider } = get();

        if (routingMode === 'manual' && activeProvider) {
          return providers.find((p) => p.id === activeProvider) || null;
        }

        const healthy = providers
          .filter((p) => p.enabled && p.healthStatus === 'healthy')
          .sort((a, b) => {
            if (routingMode === 'smart') {
              const scoreA = a.priority * 0.3 + (a.usageStats.successRate / 100) * 0.4 + (1 / (a.usageStats.averageLatency + 1)) * 0.3;
              const scoreB = b.priority * 0.3 + (b.usageStats.successRate / 100) * 0.4 + (1 / (b.usageStats.averageLatency + 1)) * 0.3;
              return scoreB - scoreA;
            }
            return a.priority - b.priority;
          });

        return healthy[0] || null;
      },

      addErrorLog: (providerId, error) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === providerId
              ? { ...p, errorLogs: [error, ...p.errorLogs].slice(0, 100) }
              : p
          ),
        }));
      },

      updateUsageStats: (providerId, tokens, latency) => {
        set((state) => ({
          providers: state.providers.map((p) => {
            if (p.id !== providerId) return p;
            const newRequests = p.usageStats.totalRequests + 1;
            const newTokens = p.usageStats.totalTokens + tokens;
            const newLatency = (p.usageStats.averageLatency * p.usageStats.totalRequests + latency) / newRequests;
            return {
              ...p,
              usageStats: {
                ...p.usageStats,
                totalRequests: newRequests,
                totalTokens: newTokens,
                averageLatency: Math.round(newLatency),
                lastUsed: new Date(),
              },
            };
          }),
        }));
      },

      reorderProviders: (providers) => {
        set({ providers });
      },
    }),
    {
      name: 'nexus-provider-store',
      partialize: (state) => ({ 
        providers: state.providers, 
        activeProvider: state.activeProvider,
        routingMode: state.routingMode 
      }),
    }
  )
);
