import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RefreshCw, TestTube, Trash2, Edit3, Plus, ChevronDown, ChevronUp, Zap, AlertCircle } from 'lucide-react';
import { useProviderStore } from '@/stores/providerStore';
import toast from 'react-hot-toast';

export default function ProvidersPage() {
  const { providers, updateProvider, removeProvider, testProvider, healthCheckAll, routingMode, setRoutingMode } = useProviderStore();
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  const handleToggle = (id: string, enabled: boolean) => {
    updateProvider(id, { enabled });
    toast.success(`${enabled ? 'Enabled' : 'Disabled'} provider`);
  };

  const handleTest = async (id: string) => {
    setTestingProvider(id);
    try {
      const success = await testProvider(id);
      toast[success ? 'success' : 'error'](success ? 'Provider is healthy!' : 'Provider test failed');
    } catch (error) {
      toast.error('Test failed');
    }
    setTestingProvider(null);
  };

  const handleHealthCheckAll = async () => {
    toast.promise(healthCheckAll(), {
      loading: 'Checking all providers...',
      success: 'Health check complete!',
      error: 'Some providers failed',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Providers</h1>
          <p className="text-dark-400">Manage your AI provider configurations ({providers.length} providers available)</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={routingMode}
            onChange={(e) => setRoutingMode(e.target.value as any)}
            className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
          >
            <option value="manual">Manual Selection</option>
            <option value="auto">Auto Failover</option>
            <option value="smart">Smart Routing</option>
          </select>
          <button
            onClick={handleHealthCheckAll}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Health Check All
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-dark-900 border rounded-xl overflow-hidden transition-all ${
              provider.enabled 
                ? provider.healthStatus === 'healthy'
                  ? 'border-green-500/30'
                  : provider.healthStatus === 'unhealthy'
                  ? 'border-red-500/30'
                  : 'border-yellow-500/30'
                : 'border-dark-800'
            }`}
          >
            <div 
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-dark-800/50 transition-colors"
              onClick={() => setExpandedProvider(expandedProvider === provider.id ? null : provider.id)}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                provider.enabled ? 'bg-primary-500/20' : 'bg-dark-800'
              }`}>
                <Zap className={`w-5 h-5 ${provider.enabled ? 'text-primary-400' : 'text-dark-500'}`} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{provider.name}</h3>
                  {provider.enabled && provider.healthStatus === 'healthy' && (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> Healthy
                    </span>
                  )}
                  {provider.enabled && provider.healthStatus === 'unhealthy' && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Unhealthy
                    </span>
                  )}
                  {provider.enabled && provider.healthStatus === 'unknown' && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs">Not Tested</span>
                  )}
                </div>
                <p className="text-sm text-dark-400">{provider.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-dark-500 hidden md:block">{provider.selectedModel}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(provider.id, !provider.enabled);
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    provider.enabled ? 'bg-primary-600' : 'bg-dark-700'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    provider.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>

                {expandedProvider === provider.id ? (
                  <ChevronUp className="w-5 h-5 text-dark-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-dark-500" />
                )}
              </div>
            </div>

            {expandedProvider === provider.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-dark-800 p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">API Key</label>
                    <input
                      type="password"
                      value={provider.apiKey}
                      onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value })}
                      placeholder="Enter your API key"
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Base URL</label>
                    <input
                      type="text"
                      value={provider.baseUrl}
                      onChange={(e) => updateProvider(provider.id, { baseUrl: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Model</label>
                    <select
                      value={provider.selectedModel}
                      onChange={(e) => updateProvider(provider.id, { selectedModel: e.target.value })}
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                    >
                      {provider.models.map((model) => (
                        <option key={model.id} value={model.id}>{model.name} - {model.description}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Temperature: {provider.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={provider.temperature}
                      onChange={(e) => updateProvider(provider.id, { temperature: parseFloat(e.target.value) })}
                      className="w-full accent-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Max Tokens</label>
                    <input
                      type="number"
                      value={provider.maxTokens}
                      onChange={(e) => updateProvider(provider.id, { maxTokens: parseInt(e.target.value) })}
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Timeout (ms)</label>
                    <input
                      type="number"
                      value={provider.timeout}
                      onChange={(e) => updateProvider(provider.id, { timeout: parseInt(e.target.value) })}
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Retry Count</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={provider.retryCount}
                      onChange={(e) => updateProvider(provider.id, { retryCount: parseInt(e.target.value) })}
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Priority Level</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={provider.priority}
                      onChange={(e) => updateProvider(provider.id, { priority: parseInt(e.target.value) })}
                      className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateProvider(provider.id, { streaming: !provider.streaming })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        provider.streaming ? 'bg-primary-600' : 'bg-dark-700'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        provider.streaming ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                    <span className="text-sm text-dark-300">Enable Streaming</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-dark-800">
                  <button
                    onClick={() => handleTest(provider.id)}
                    disabled={testingProvider === provider.id || !provider.apiKey}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-lg text-sm transition-colors"
                  >
                    <TestTube className="w-4 h-4" />
                    {testingProvider === provider.id ? 'Testing...' : 'Test Connection'}
                  </button>

                  {provider.lastHealthCheck && (
                    <span className="text-xs text-dark-500">
                      Last checked: {new Date(provider.lastHealthCheck).toLocaleString()}
                    </span>
                  )}

                  <div className="ml-auto flex items-center gap-4 text-sm text-dark-400">
                    <span>{provider.usageStats.totalRequests} requests</span>
                    <span>{provider.usageStats.totalTokens} tokens</span>
                    <span>{provider.usageStats.averageLatency}ms avg</span>
                    <span>{provider.usageStats.successRate}% success</span>
                  </div>
                </div>

                {provider.errorLogs.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-xs text-red-400 font-medium mb-2">Recent Errors ({provider.errorLogs.length})</p>
                    {provider.errorLogs.slice(0, 3).map((log) => (
                      <p key={log.id} className="text-xs text-dark-500">
                        {new Date(log.timestamp).toLocaleString()}: {log.error}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
