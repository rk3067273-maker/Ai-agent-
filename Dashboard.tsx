import { motion } from 'framer-motion';
import {
  MessageSquare, Code2, Cpu, Wand2, TrendingUp, Clock, Activity, Zap,
  ArrowRight, Sparkles, BarChart3, Users, FileCode, Globe
} from 'lucide-react';
import { useProviderStore } from '@/stores/providerStore';
import { useChatStore } from '@/stores/chatStore';
import { useAdminStore } from '@/stores/adminStore';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total Conversations', icon: MessageSquare, color: 'from-blue-500 to-cyan-500' },
  { label: 'Code Projects', icon: Code2, color: 'from-purple-500 to-pink-500' },
  { label: 'Active Providers', icon: Cpu, color: 'from-green-500 to-emerald-500' },
  { label: 'Projects Generated', icon: Wand2, color: 'from-orange-500 to-amber-500' },
];

const quickActions = [
  { label: 'New Chat', icon: MessageSquare, path: '/chat', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { label: 'Code Workspace', icon: Code2, path: '/workspace', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { label: 'Manage Providers', icon: Cpu, path: '/providers', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { label: 'Generate Project', icon: Wand2, path: '/generator', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
];

const recentActivity = [
  { action: 'New conversation started', time: '2 min ago', icon: MessageSquare, color: 'text-blue-400' },
  { action: 'Provider health check completed', time: '5 min ago', icon: Activity, color: 'text-green-400' },
  { action: 'Code project created', time: '15 min ago', icon: FileCode, color: 'text-purple-400' },
  { action: 'Settings updated', time: '1 hour ago', icon: Zap, color: 'text-orange-400' },
];

export default function Dashboard() {
  const { providers, getEnabledProviders } = useProviderStore();
  const { conversations } = useChatStore();
  const { stats: adminStats } = useAdminStore();
  const enabledProviders = getEnabledProviders();

  const statValues = [
    conversations.length,
    0, // Code projects count would come from workspace store
    enabledProviders.length,
    0, // Generated projects count
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700/50 p-8"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome to Nexus AI Studio</h1>
              <p className="text-dark-400 mt-1">Your professional AI coding agent platform</p>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Link
              to="/chat"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-medium transition-all flex items-center gap-2"
            >
              Start Chatting <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/workspace"
              className="px-6 py-3 bg-dark-700 hover:bg-dark-600 rounded-xl font-medium transition-all"
            >
              Open Workspace
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-900 border border-dark-800 rounded-xl p-6 hover:border-dark-700 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{statValues[index]}</p>
            <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02] ${action.color}`}
              >
                <action.icon className="w-6 h-6" />
                <span className="font-medium">{action.label}</span>
                <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark-900 border border-dark-800 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-400" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-1 ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-dark-300">{activity.action}</p>
                  <p className="text-xs text-dark-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Provider Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-dark-900 border border-dark-800 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-400" />
          Provider Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`p-4 rounded-xl border transition-all ${
                provider.enabled
                  ? provider.healthStatus === 'healthy'
                    ? 'border-green-500/20 bg-green-500/5'
                    : 'border-yellow-500/20 bg-yellow-500/5'
                  : 'border-dark-700/50 bg-dark-800/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{provider.name}</span>
                <div className={`w-2 h-2 rounded-full ${
                  provider.enabled
                    ? provider.healthStatus === 'healthy'
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                    : 'bg-dark-600'
                }`} />
              </div>
              <p className="text-xs text-dark-400">{provider.selectedModel}</p>
              {provider.enabled && (
                <div className="mt-2 flex items-center gap-4 text-xs text-dark-500">
                  <span>{provider.usageStats.totalRequests} requests</span>
                  <span>{provider.usageStats.totalTokens} tokens</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
