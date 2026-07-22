import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SystemStats, ActivityLog } from '@/types';

interface AdminState {
  stats: SystemStats;
  activityLogs: ActivityLog[];
  isAdminMode: boolean;

  updateStats: (stats: Partial<SystemStats>) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearActivityLogs: () => void;
  setAdminMode: (enabled: boolean) => void;
  getStats: () => SystemStats;
}

const defaultStats: SystemStats = {
  totalConversations: 0,
  totalMessages: 0,
  totalTokens: 0,
  activeProviders: 0,
  totalProviders: 0,
  averageLatency: 0,
  uptime: 0,
  errorsLast24h: 0,
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      stats: defaultStats,
      activityLogs: [],
      isAdminMode: false,

      updateStats: (stats) => {
        set((state) => ({ stats: { ...state.stats, ...stats } }));
      },

      addActivityLog: (log) => {
        const newLog: ActivityLog = {
          ...log,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };
        set((state) => ({
          activityLogs: [newLog, ...state.activityLogs].slice(0, 1000),
        }));
      },

      clearActivityLogs: () => {
        set({ activityLogs: [] });
      },

      setAdminMode: (enabled) => {
        set({ isAdminMode: enabled });
      },

      getStats: () => get().stats,
    }),
    {
      name: 'nexus-admin-store',
      partialize: (state) => ({ activityLogs: state.activityLogs, isAdminMode: state.isAdminMode }),
    }
  )
);
