import { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Sun, Moon, Type, Globe, Save, RotateCcw, Download, Upload, Volume2, Mic, Bell, Keyboard, Eye, Code } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const [activeTab, setActiveTab] = useState('general');
  const [importData, setImportData] = useState('');

  const tabs = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
    { id: 'ai', label: 'AI Preferences', icon: Code },
    { id: 'export', label: 'Backup & Export', icon: Download },
  ];

  const handleExport = () => {
    const data = settings.exportSettings();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported!');
  };

  const handleImport = () => {
    if (!importData.trim()) {
      toast.error('Please paste settings JSON');
      return;
    }
    try {
      settings.importSettings(importData);
      toast.success('Settings imported!');
      setImportData('');
    } catch (error) {
      toast.error('Invalid settings JSON');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-dark-400">Customize your Nexus AI Studio experience</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-800 pb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
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

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-900 border border-dark-800 rounded-xl p-6 space-y-6"
      >
        {activeTab === 'general' && (
          <>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => settings.updateSettings({ language: e.target.value })}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              >
                <option value="en">English</option>
                <option value="bn">Bangla (বাংলা)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">Japanese (日本語)</option>
                <option value="ko">Korean (한국어)</option>
                <option value="zh">Chinese (中文)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="20"
                value={settings.fontSize}
                onChange={(e) => settings.updateSettings({ fontSize: parseInt(e.target.value) })}
                className="w-full accent-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Code Font Size: {settings.codeFontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="18"
                value={settings.codeFontSize}
                onChange={(e) => settings.updateSettings({ codeFontSize: parseInt(e.target.value) })}
                className="w-full accent-primary-500"
              />
            </div>

            <ToggleSetting
              label="Auto Save"
              description="Automatically save your work"
              enabled={settings.autoSave}
              onChange={(v) => settings.updateSettings({ autoSave: v })}
            />

            <ToggleSetting
              label="Word Wrap"
              description="Wrap long lines in code editor"
              enabled={settings.wordWrap}
              onChange={(v) => settings.updateSettings({ wordWrap: v })}
            />

            <ToggleSetting
              label="Show Line Numbers"
              description="Display line numbers in code editor"
              enabled={settings.showLineNumbers}
              onChange={(v) => settings.updateSettings({ showLineNumbers: v })}
            />
          </>
        )}

        {activeTab === 'appearance' && (
          <>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'system', label: 'System', icon: Monitor },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => settings.updateSettings({ theme: option.value as any })}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      settings.theme === option.value
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    <option.icon className="w-6 h-6 mx-auto mb-2 text-dark-400" />
                    <span className="text-sm text-white">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <ToggleSetting
              label="High Contrast"
              description="Increase contrast for better visibility"
              enabled={settings.highContrast}
              onChange={(v) => settings.updateSettings({ highContrast: v })}
            />

            <ToggleSetting
              label="Reduce Motion"
              description="Minimize animations for accessibility"
              enabled={settings.reduceMotion}
              onChange={(v) => settings.updateSettings({ reduceMotion: v })}
            />

            <ToggleSetting
              label="Sidebar Collapsed"
              description="Start with collapsed sidebar"
              enabled={settings.sidebarCollapsed}
              onChange={(v) => settings.updateSettings({ sidebarCollapsed: v })}
            />
          </>
        )}

        {activeTab === 'voice' && (
          <>
            <ToggleSetting
              label="Text to Speech"
              description="Enable voice output for AI responses"
              enabled={settings.voice.enabled}
              onChange={(v) => settings.updateVoiceSettings({ enabled: v })}
            />

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Speech Speed: {settings.voice.speed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voice.speed}
                onChange={(e) => settings.updateVoiceSettings({ speed: parseFloat(e.target.value) })}
                className="w-full accent-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Volume: {Math.round(settings.voice.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.voice.volume}
                onChange={(e) => settings.updateVoiceSettings({ volume: parseFloat(e.target.value) })}
                className="w-full accent-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Pitch: {settings.voice.pitch}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voice.pitch}
                onChange={(e) => settings.updateVoiceSettings({ pitch: parseFloat(e.target.value) })}
                className="w-full accent-primary-500"
              />
            </div>

            <ToggleSetting
              label="Push to Talk"
              description="Hold button to speak"
              enabled={settings.voice.pushToTalk}
              onChange={(v) => settings.updateVoiceSettings({ pushToTalk: v })}
            />

            <ToggleSetting
              label="Continuous Listening"
              description="Keep listening after speech"
              enabled={settings.voice.continuousListening}
              onChange={(v) => settings.updateVoiceSettings({ continuousListening: v })}
            />

            <ToggleSetting
              label="Noise Reduction"
              description="Filter background noise"
              enabled={settings.voice.noiseReduction}
              onChange={(v) => settings.updateVoiceSettings({ noiseReduction: v })}
            />

            <ToggleSetting
              label="Wake Word"
              description={`Listen for "${settings.voice.wakeWord}"`}
              enabled={settings.voice.wakeWordEnabled}
              onChange={(v) => settings.updateVoiceSettings({ wakeWordEnabled: v })}
            />
          </>
        )}

        {activeTab === 'ai' && (
          <>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Default Provider</label>
              <select
                value={settings.defaultProvider}
                onChange={(e) => settings.updateSettings({ defaultProvider: e.target.value })}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="groq">Groq</option>
                <option value="mistral">Mistral AI</option>
                <option value="cohere">Cohere</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Response Style</label>
              <select
                value={settings.responseStyle}
                onChange={(e) => settings.updateSettings({ responseStyle: e.target.value as any })}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              >
                <option value="concise">Concise - Short and direct</option>
                <option value="balanced">Balanced - Moderate detail</option>
                <option value="detailed">Detailed - Comprehensive answers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Default Temperature: {settings.defaultTemperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.defaultTemperature}
                onChange={(e) => settings.updateSettings({ defaultTemperature: parseFloat(e.target.value) })}
                className="w-full accent-primary-500"
              />
              <p className="text-xs text-dark-500 mt-1">Lower = more focused, Higher = more creative</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Default Max Tokens: {settings.defaultMaxTokens}
              </label>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={settings.defaultMaxTokens}
                onChange={(e) => settings.updateSettings({ defaultMaxTokens: parseInt(e.target.value) })}
                className="w-full accent-primary-500"
              />
            </div>

            <ToggleSetting
              label="Memory"
              description="Remember conversation context across sessions"
              enabled={settings.memoryEnabled}
              onChange={(v) => settings.updateSettings({ memoryEnabled: v })}
            />

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Memory Limit: {settings.memoryLimit} conversations
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={settings.memoryLimit}
                onChange={(e) => settings.updateSettings({ memoryLimit: parseInt(e.target.value) })}
                className="w-full accent-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Export Format</label>
              <select
                value={settings.exportFormat}
                onChange={(e) => settings.updateSettings({ exportFormat: e.target.value as any })}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              >
                <option value="json">JSON</option>
                <option value="md">Markdown</option>
                <option value="txt">Plain Text</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'export' && (
          <>
            <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/50">
              <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                <Download className="w-4 h-4 text-primary-400" />
                Export Settings
              </h3>
              <p className="text-sm text-dark-400 mb-4">Download your settings as a JSON file to backup or transfer.</p>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm transition-colors"
              >
                Export to JSON
              </button>
            </div>

            <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/50">
              <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary-400" />
                Import Settings
              </h3>
              <p className="text-sm text-dark-400 mb-4">Paste your exported settings JSON to restore.</p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='Paste JSON here...'
                className="w-full h-32 bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 mb-3 font-mono"
              />
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm transition-colors"
              >
                Import Settings
              </button>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <h3 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset Settings
              </h3>
              <p className="text-sm text-dark-400 mb-4">Reset all settings to default values. This cannot be undone.</p>
              <button
                onClick={() => {
                  if (confirm('Are you sure? All settings will be reset to default.')) {
                    settings.resetSettings();
                    toast.success('Settings reset to default');
                  }
                }}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function ToggleSetting({ label, description, enabled, onChange }: { label: string; description: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="text-sm text-dark-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-primary-600' : 'bg-dark-700'
        }`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}
