import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, VoiceSettings } from '@/types';

interface SettingsState extends AppSettings {
  voice: VoiceSettings;

  updateSettings: (settings: Partial<AppSettings>) => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (data: string) => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'en',
  fontSize: 14,
  codeFontSize: 13,
  sidebarCollapsed: false,
  showLineNumbers: true,
  wordWrap: true,
  autoSave: true,
  autoSaveInterval: 30000,
  defaultProvider: 'openai',
  defaultModel: 'gpt-4o',
  defaultTemperature: 0.7,
  defaultMaxTokens: 4096,
  responseStyle: 'balanced',
  memoryEnabled: true,
  memoryLimit: 50,
  exportFormat: 'json',
  highContrast: false,
  reduceMotion: false,
};

const defaultVoiceSettings: VoiceSettings = {
  enabled: false,
  voice: 'default',
  speed: 1,
  volume: 1,
  pitch: 1,
  language: 'en-US',
  pushToTalk: false,
  continuousListening: false,
  noiseReduction: true,
  wakeWord: 'Hey Nexus',
  wakeWordEnabled: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      voice: defaultVoiceSettings,

      updateSettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      updateVoiceSettings: (settings) => {
        set((state) => ({ voice: { ...state.voice, ...settings } }));
      },

      resetSettings: () => {
        set({ ...defaultSettings, voice: defaultVoiceSettings });
      },

      exportSettings: () => {
        return JSON.stringify({
          app: {
            theme: get().theme,
            language: get().language,
            fontSize: get().fontSize,
            codeFontSize: get().codeFontSize,
            sidebarCollapsed: get().sidebarCollapsed,
            showLineNumbers: get().showLineNumbers,
            wordWrap: get().wordWrap,
            autoSave: get().autoSave,
            autoSaveInterval: get().autoSaveInterval,
            defaultProvider: get().defaultProvider,
            defaultModel: get().defaultModel,
            defaultTemperature: get().defaultTemperature,
            defaultMaxTokens: get().defaultMaxTokens,
            responseStyle: get().responseStyle,
            memoryEnabled: get().memoryEnabled,
            memoryLimit: get().memoryLimit,
            exportFormat: get().exportFormat,
            highContrast: get().highContrast,
            reduceMotion: get().reduceMotion,
          },
          voice: get().voice,
        }, null, 2);
      },

      importSettings: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.app) set((state) => ({ ...state, ...parsed.app }));
          if (parsed.voice) set((state) => ({ voice: { ...state.voice, ...parsed.voice } }));
        } catch (e) {
          console.error('Failed to import settings:', e);
        }
      },
    }),
    {
      name: 'nexus-settings-store',
    }
  )
);
