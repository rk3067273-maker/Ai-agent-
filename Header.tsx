import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Sun, Moon, Bell, Search, X, Command, Mic, Volume2
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useProviderStore } from '@/stores/providerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { voiceService } from '@/services/voiceService';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { getBestProvider } = useProviderStore();
  const { voice, updateVoiceSettings } = useSettingsStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bestProvider = getBestProvider();

  const handleVoiceToggle = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      try {
        voiceService.startListening(
          voice,
          (text) => {
            console.log('Voice input:', text);
            // Handle voice input
          },
          () => setIsListening(false)
        );
        setIsListening(true);
      } catch (error) {
        console.error('Voice error:', error);
      }
    }
  };

  return (
    <header className="h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-dark-800 transition-colors text-dark-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Active Provider Badge */}
        {bestProvider && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800/50 border border-dark-700/50"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-dark-300">{bestProvider.name}</span>
            <span className="text-xs text-dark-500">{bestProvider.selectedModel}</span>
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="relative overflow-hidden"
            >
              <input
                type="text"
                placeholder="Search conversations, files..."
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="p-2 rounded-lg hover:bg-dark-800 transition-colors text-dark-400 hover:text-white"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Voice Toggle */}
        <button
          onClick={handleVoiceToggle}
          className={`p-2 rounded-lg transition-colors ${
            isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-dark-400 hover:text-white hover:bg-dark-800'
          }`}
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* TTS Toggle */}
        <button
          onClick={() => updateVoiceSettings({ enabled: !voice.enabled })}
          className={`p-2 rounded-lg transition-colors ${
            voice.enabled ? 'bg-primary-500/20 text-primary-400' : 'text-dark-400 hover:text-white hover:bg-dark-800'
          }`}
        >
          <Volume2 className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-dark-800 transition-colors text-dark-400 hover:text-white"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-dark-800 transition-colors text-dark-400 hover:text-white relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        {/* Keyboard Shortcut */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-dark-800 text-dark-500 text-xs">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>
    </header>
  );
}
