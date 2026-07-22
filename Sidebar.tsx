import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, Code2, Cpu, Wand2, Settings, Shield, Sparkles,
  ChevronRight, Zap
} from 'lucide-react';
import { useProviderStore } from '@/stores/providerStore';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { path: '/workspace', icon: Code2, label: 'Code Workspace' },
  { path: '/providers', icon: Cpu, label: 'AI Providers' },
  { path: '/generator', icon: Wand2, label: 'Project Generator' },
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/admin', icon: Shield, label: 'Admin' },
];

export default function Sidebar() {
  const location = useLocation();
  const { providers, getEnabledProviders } = useProviderStore();
  const enabledCount = getEnabledProviders().length;

  return (
    <div className="w-[280px] h-full bg-dark-900 border-r border-dark-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Nexus AI</h1>
            <p className="text-xs text-dark-400">Studio v1.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Provider Status */}
      <div className="p-4 border-t border-dark-800">
        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-white">Providers</span>
            </div>
            <span className="text-xs bg-primary-500/10 text-primary-400 px-2 py-1 rounded-full">
              {enabledCount}/{providers.length}
            </span>
          </div>
          <div className="space-y-2">
            {providers.slice(0, 4).map((provider) => (
              <div key={provider.id} className="flex items-center justify-between">
                <span className="text-xs text-dark-400">{provider.name}</span>
                <div className={`w-2 h-2 rounded-full ${
                  provider.enabled && provider.healthStatus === 'healthy'
                    ? 'bg-green-500'
                    : provider.enabled
                    ? 'bg-yellow-500'
                    : 'bg-dark-600'
                }`} />
              </div>
            ))}
          </div>
          <NavLink
            to="/providers"
            className="flex items-center gap-1 mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            Manage Providers <ChevronRight className="w-3 h-3" />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
