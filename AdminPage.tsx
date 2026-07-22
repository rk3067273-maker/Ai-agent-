import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Activity, AlertTriangle, CheckCircle, Clock, Users, MessageSquare, 
  Cpu, TrendingUp, Zap, Shield, Database, Globe, Server, AlertCircle, Trash2
} from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { useProviderStore } from '@/stores/providerStore';
import { useChatStore } from '@/stores/chatStore';
import { useSettingsStore } from '@/stores/settingsStore';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { stats, activityLogs, clearActivityLogs, addActivityLog } = useAdminStore();
  const { providers, getEnabledProviders } = useProviderStore();
  const { conversations } = useChatStore();
  const { resetSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('overview');

  const enabledProviders = getEnabledProviders();
  const totalTokens = providers.reduce((sum, p) => sum + p.usageStats.totalTokens, 0);
  const totalRequests = providers.reduce((sum, p) => sum + p.usageStats.totalRequests, 0);
  const avgLatency = providers.length > 0 
    ? Math.round(providers.reduce((sum, p) => sum + p.usageStats.averageLatency, 0) / providers.length)
    : 0;

  const systemStats = [
    { label: 'Total Conversations', value: conversations.length, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Providers', value: enabledProviders.length, icon: Cpu, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Providers', value: providers.length, icon: Server, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Requests', value: totalRequests, icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Total Tokens', value: totalTokens.toLocaleString(), icon: Database, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Clock, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'providers', label: 'Provider Health', icon: Activity },
    { id: 'logs', label: 'Activity Logs', icon: Clock },
    { id: 'system', label: 'System', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-dark-400">System monitoring and analytics</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-green-400">System Online</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-800 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500/10 text-primary-400'
                : 'text-dark-400 hover:bg-dark-800 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {systemStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${stat.bg} border border-dark-800 rounded-xl p-5`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-dark-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Usage Chart Placeholder */}
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-400" />
                Usage Overview
              </h3>
              <div className="h-48 flex items-end gap-2">
                {providers.filter(p => p.enabled).map((provider, i) => (
                  <div key={provider.id} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary-500/20 rounded-t-lg transition-all hover:bg-primary-500/30"
                      style={{ 
                        height: `${Math.max((provider.usageStats.totalRequests / Math.max(...providers.map(p => p.usageStats.totalRequests))) * 100, 5)}%` 
                      }}
                    />
                    <span className="text-xs text-dark-500 truncate w-full text-center">{provider.name}</span>
                  </div>
                ))}
                {enabledProviders.length === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-dark-500">
                    No data available - enable providers to see usage
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-400" />
              Provider Health Status
            </h3>
            <div className="space-y-3">
              {providers.map(provider => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      provider.enabled
                        ? provider.healthStatus === 'healthy'
                          ? 'bg-green-500'
                          : provider.healthStatus === 'unhealthy'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                        : 'bg-dark-600'
                    }`} />
                    <div>
                      <span className="text-white font-medium">{provider.name}</span>
                      <p className="text-xs text-dark-500">{provider.selectedModel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-white font-medium">{provider.usageStats.totalRequests}</p>
                      <p className="text-xs text-dark-500">Requests</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">{provider.usageStats.totalTokens.toLocaleString()}</p>
                      <p className="text-xs text-dark-500">Tokens</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">{provider.usageStats.averageLatency}ms</p>
                      <p className="text-xs text-dark-500">Avg Latency</p>
                    </div>
                    <div className="text-center">
                      <p className={`font-medium ${provider.usageStats.successRate >= 95 ? 'text-green-400' : provider.usageStats.successRate >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {provider.usageStats.successRate}%
                      </p>
                      <p className="text-xs text-dark-500">Success</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">{provider.priority}</p>
                      <p className="text-xs text-dark-500">Priority</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-400" />
                Activity Logs
                <span className="text-xs text-dark-500 ml-2">({activityLogs.length} entries)</span>
              </h3>
              <button
                onClick={() => {
                  if (confirm('Clear all activity logs?')) {
                    clearActivityLogs();
                    toast.success('Logs cleared');
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Logs
              </button>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {activityLogs.length === 0 ? (
                <div className="text-center py-12 text-dark-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No activity logs yet</p>
                </div>
              ) : (
                activityLogs.slice(0, 100).map(log => (
                  <div
                    key={log.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      log.severity === 'error'
                        ? 'bg-red-500/5 border border-red-500/10'
                        : log.severity === 'warning'
                        ? 'bg-yellow-500/5 border border-yellow-500/10'
                        : 'bg-dark-800/30'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      log.severity === 'error'
                        ? 'bg-red-400'
                        : log.severity === 'warning'
                        ? 'bg-yellow-400'
                        : 'bg-blue-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark-300">{log.action}</p>
                      <p className="text-xs text-dark-500 truncate">{log.details}</p>
                    </div>
                    <span className="text-xs text-dark-600 flex-shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-400" />
                System Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-dark-800/50">
                  <p className="text-xs text-dark-500 uppercase tracking-wider">App Version</p>
                  <p className="text-lg font-semibold text-white mt-1">1.0.0</p>
                </div>
                <div className="p-4 rounded-lg bg-dark-800/50">
                  <p className="text-xs text-dark-500 uppercase tracking-wider">Environment</p>
                  <p className="text-lg font-semibold text-white mt-1">Production</p>
                </div>
                <div className="p-4 rounded-lg bg-dark-800/50">
                  <p className="text-xs text-dark-500 uppercase tracking-wider">Build Date</p>
                  <p className="text-lg font-semibold text-white mt-1">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-dark-800/50">
                  <p className="text-xs text-dark-500 uppercase tracking-wider">User Agent</p>
                  <p className="text-sm font-medium text-white mt-1 truncate">{navigator.userAgent}</p>
                </div>
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Danger Zone
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                  <div>
                    <p className="font-medium text-white">Clear All Data</p>
                    <p className="text-sm text-dark-400">Delete all conversations, projects, and settings</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('WARNING: This will delete ALL data. Are you sure?')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
