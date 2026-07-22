import type { AIProvider, ChatMessage, AIResponse, StreamChunk } from '@/types';
import { useProviderStore } from '@/stores/providerStore';
import { useAdminStore } from '@/stores/adminStore';

export class AIService {
  private abortController: AbortController | null = null;

  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async sendMessage(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    this.abortController = new AbortController();
    const startTime = Date.now();

    try {
      let response: AIResponse;

      switch (provider.id) {
        case 'openai':
          response = await this.callOpenAI(messages, provider, onStream);
          break;
        case 'gemini':
          response = await this.callGemini(messages, provider, onStream);
          break;
        case 'anthropic':
          response = await this.callAnthropic(messages, provider, onStream);
          break;
        case 'groq':
          response = await this.callGroq(messages, provider, onStream);
          break;
        case 'mistral':
          response = await this.callMistral(messages, provider, onStream);
          break;
        case 'cohere':
          response = await this.callCohere(messages, provider, onStream);
          break;
        case 'deepseek':
          response = await this.callDeepSeek(messages, provider, onStream);
          break;
        case 'perplexity':
          response = await this.callPerplexity(messages, provider, onStream);
          break;
        case 'together':
          response = await this.callTogether(messages, provider, onStream);
          break;
        case 'ai21':
          response = await this.callAI21(messages, provider, onStream);
          break;
        case 'huggingface':
          response = await this.callHuggingFace(messages, provider, onStream);
          break;
        case 'azure':
          response = await this.callAzure(messages, provider, onStream);
          break;
        case 'custom':
          response = await this.callCustom(messages, provider, onStream);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider.id}`);
      }

      const latency = Date.now() - startTime;

      // Update usage stats
      useProviderStore.getState().updateUsageStats(provider.id, response.tokens.total, latency);

      // Update admin stats
      useAdminStore.getState().updateStats({
        totalMessages: useAdminStore.getState().stats.totalMessages + 1,
        totalTokens: useAdminStore.getState().stats.totalTokens + response.tokens.total,
      });

      return { ...response, latency };
    } catch (error) {
      const latency = Date.now() - startTime;

      useProviderStore.getState().addErrorLog(provider.id, {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: undefined,
      });

      throw error;
    }
  }

  private formatMessages(messages: ChatMessage[]) {
    return messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }

  // OpenAI API
  private async callOpenAI(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    const body = {
      model: provider.selectedModel,
      messages: this.formatMessages(messages),
      temperature: provider.temperature,
      max_tokens: provider.maxTokens,
      top_p: provider.topP,
      presence_penalty: provider.presencePenalty,
      frequency_penalty: provider.frequencyPenalty,
      stream: provider.streaming && !!onStream,
    };

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    if (provider.streaming && onStream) {
      return this.handleStream(response, onStream, provider);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      provider: provider.name,
      tokens: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      },
      latency: 0,
      finishReason: data.choices[0]?.finish_reason || 'stop',
    };
  }

  // Gemini API
  private async callGemini(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    const lastMessage = messages[messages.length - 1];
    const body = {
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        temperature: provider.temperature,
        maxOutputTokens: provider.maxTokens,
        topP: provider.topP,
      },
    };

    const response = await fetch(
      `${provider.baseUrl}/models/${provider.selectedModel}:generateContent?key=${provider.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: this.abortController?.signal,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      content,
      model: provider.selectedModel,
      provider: provider.name,
      tokens: {
        prompt: 0,
        completion: 0,
        total: 0,
      },
      latency: 0,
      finishReason: data.candidates?.[0]?.finishReason || 'stop',
    };
  }

  // Anthropic API
  private async callAnthropic(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    const systemMessage = messages.find((m) => m.role === 'system');
    const chatMessages = messages.filter((m) => m.role !== 'system');

    const body = {
      model: provider.selectedModel,
      messages: chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      system: systemMessage?.content,
      temperature: provider.temperature,
      max_tokens: provider.maxTokens,
      top_p: provider.topP,
      stream: provider.streaming && !!onStream,
    };

    const response = await fetch(`${provider.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Anthropic API error: ${response.status}`);
    }

    if (provider.streaming && onStream) {
      return this.handleAnthropicStream(response, onStream, provider);
    }

    const data = await response.json();
    return {
      content: data.content?.[0]?.text || '',
      model: data.model,
      provider: provider.name,
      tokens: {
        prompt: data.usage?.input_tokens || 0,
        completion: data.usage?.output_tokens || 0,
        total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      latency: 0,
      finishReason: data.stop_reason || 'stop',
    };
  }

  // Groq API (OpenAI compatible)
  private async callGroq(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    return this.callOpenAI(messages, provider, onStream);
  }

  // Mistral API
  private async callMistral(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    const body = {
      model: provider.selectedModel,
      messages: this.formatMessages(messages),
      temperature: provider.temperature,
      max_tokens: provider.maxTokens,
      top_p: provider.topP,
      stream: provider.streaming && !!onStream,
    };

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Mistral API error: ${response.status}`);
    }

    if (provider.streaming && onStream) {
      return this.handleStream(response, onStream, provider);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      provider: provider.name,
      tokens: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      },
      latency: 0,
      finishReason: data.choices[0]?.finish_reason || 'stop',
    };
  }

  // Cohere API
  private async callCohere(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    const body = {
      model: provider.selectedModel,
      message: messages[messages.length - 1]?.content || '',
      chat_history: messages.slice(0, -1).map((m) => ({
        role: m.role,
        message: m.content,
      })),
      temperature: provider.temperature,
      max_tokens: provider.maxTokens,
      p: provider.topP,
      stream: provider.streaming && !!onStream,
    };

    const response = await fetch(`${provider.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.text || '',
      model: provider.selectedModel,
      provider: provider.name,
      tokens: {
        prompt: 0,
        completion: 0,
        total: 0,
      },
      latency: 0,
      finishReason: 'stop',
    };
  }

  // DeepSeek API (OpenAI compatible)
  private async callDeepSeek(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    return this.callOpenAI(messages, provider, onStream);
  }

  // Perplexity API (OpenAI compatible)
  private async callPerplexity(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    return this.callOpenAI(messages, provider, onStream);
  }

  // Together AI API (OpenAI compatible)
  private async callTogether(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    return this.callOpenAI(messages, provider, onStream);
  }

  // AI21 API
  private async callAI21(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    const body = {
      model: provider.selectedModel,
      messages: this.formatMessages(messages),
      temperature: provider.temperature,
      max_tokens: provider.maxTokens,
      top_p: provider.topP,
    };

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `AI21 API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      provider: provider.name,
      tokens: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      },
      latency: 0,
      finishReason: data.choices[0]?.finish_reason || 'stop',
    };
  }

  // Hugging Face API
  private async callHuggingFace(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    const body = {
      inputs: messages[messages.length - 1]?.content || '',
      parameters: {
        temperature: provider.temperature,
        max_new_tokens: provider.maxTokens,
        top_p: provider.topP,
      },
    };

    const response = await fetch(`${provider.baseUrl}/${provider.selectedModel}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    const content = Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || '';

    return {
      content,
      model: provider.selectedModel,
      provider: provider.name,
      tokens: { prompt: 0, completion: 0, total: 0 },
      latency: 0,
      finishReason: 'stop',
    };
  }

  // Azure OpenAI API
  private async callAzure(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    const body = {
      model: provider.selectedModel,
      messages: this.formatMessages(messages),
      temperature: provider.temperature,
      max_tokens: provider.maxTokens,
      top_p: provider.topP,
      stream: provider.streaming && !!onStream,
    };

    const response = await fetch(
      `${provider.customEndpoint || provider.baseUrl}/openai/deployments/${provider.selectedModel}/chat/completions?api-version=2024-02-01`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': provider.apiKey,
        },
        body: JSON.stringify(body),
        signal: this.abortController?.signal,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Azure API error: ${response.status}`);
    }

    if (provider.streaming && onStream) {
      return this.handleStream(response, onStream, provider);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      provider: provider.name,
      tokens: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      },
      latency: 0,
      finishReason: data.choices[0]?.finish_reason || 'stop',
    };
  }

  // Custom Provider (OpenAI compatible)
  private async callCustom(
    messages: ChatMessage[],
    provider: AIProvider,
    onStream?: (chunk: StreamChunk) => void
  ): Promise<AIResponse> {
    return this.callOpenAI(messages, provider, onStream);
  }

  // Stream handling for OpenAI-compatible APIs
  private async handleStream(
    response: Response,
    onStream: (chunk: StreamChunk) => void,
    provider: AIProvider
  ): Promise<AIResponse> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let fullContent = '';
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                onStream({ content: fullContent, done: false, model: provider.selectedModel, provider: provider.name });
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    onStream({ content: fullContent, done: true, model: provider.selectedModel, provider: provider.name });

    return {
      content: fullContent,
      model: provider.selectedModel,
      provider: provider.name,
      tokens: { prompt: 0, completion: 0, total: 0 },
      latency: 0,
      finishReason: 'stop',
    };
  }

  // Stream handling for Anthropic
  private async handleAnthropicStream(
    response: Response,
    onStream: (chunk: StreamChunk) => void,
    provider: AIProvider
  ): Promise<AIResponse> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let fullContent = '';
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              const content = parsed.delta?.text || '';
              if (content) {
                fullContent += content;
                onStream({ content: fullContent, done: false, model: provider.selectedModel, provider: provider.name });
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    onStream({ content: fullContent, done: true, model: provider.selectedModel, provider: provider.name });

    return {
      content: fullContent,
      model: provider.selectedModel,
      provider: provider.name,
      tokens: { prompt: 0, completion: 0, total: 0 },
      latency: 0,
      finishReason: 'stop',
    };
  }
}

export const aiService = new AIService();
