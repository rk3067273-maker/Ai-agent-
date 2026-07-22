import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { CodeFile, CodeProject } from '@/types';

interface WorkspaceState {
  projects: CodeProject[];
  activeProject: string | null;
  openFiles: string[];
  activeFile: string | null;
  terminalOutput: string[];
  isBuilding: boolean;
  previewUrl: string | null;

  createProject: (name: string, language: string, framework?: string) => string;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string) => void;
  addFile: (projectId: string, file: Omit<CodeFile, 'id'>) => void;
  updateFile: (projectId: string, fileId: string, content: string) => void;
  deleteFile: (projectId: string, fileId: string) => void;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string | null) => void;
  addTerminalOutput: (output: string) => void;
  clearTerminal: () => void;
  setIsBuilding: (building: boolean) => void;
  setPreviewUrl: (url: string | null) => void;
  downloadProject: (projectId: string) => void;
  getFileLanguage: (filename: string) => string;
}

const languageMap: Record<string, string> = {
  '.js': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.cpp': 'cpp',
  '.c': 'c',
  '.cs': 'csharp',
  '.go': 'go',
  '.rs': 'rust',
  '.rb': 'ruby',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.dart': 'dart',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.json': 'json',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown',
  '.sql': 'sql',
  '.sh': 'bash',
  '.dockerfile': 'dockerfile',
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProject: null,
      openFiles: [],
      activeFile: null,
      terminalOutput: [],
      isBuilding: false,
      previewUrl: null,

      createProject: (name, language, framework) => {
        const id = uuidv4();
        const newProject: CodeProject = {
          id,
          name,
          files: [],
          language,
          framework,
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          activeProject: id,
        }));
        return id;
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProject: state.activeProject === id ? null : state.activeProject,
        }));
      },

      setActiveProject: (id) => {
        set({ activeProject: id, openFiles: [], activeFile: null });
      },

      addFile: (projectId, file) => {
        const newFile: CodeFile = { ...file, id: uuidv4() };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, files: [...p.files, newFile] } : p
          ),
        }));
      },

      updateFile: (projectId, fileId, content) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  files: p.files.map((f) =>
                    f.id === fileId ? { ...f, content, isModified: true } : f
                  ),
                }
              : p
          ),
        }));
      },

      deleteFile: (projectId, fileId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, files: p.files.filter((f) => f.id !== fileId) }
              : p
          ),
          openFiles: state.openFiles.filter((id) => id !== fileId),
          activeFile: state.activeFile === fileId ? null : state.activeFile,
        }));
      },

      openFile: (fileId) => {
        set((state) => ({
          openFiles: state.openFiles.includes(fileId) ? state.openFiles : [...state.openFiles, fileId],
          activeFile: fileId,
        }));
      },

      closeFile: (fileId) => {
        set((state) => ({
          openFiles: state.openFiles.filter((id) => id !== fileId),
          activeFile: state.activeFile === fileId 
            ? (state.openFiles.filter((id) => id !== fileId)[0] || null)
            : state.activeFile,
        }));
      },

      setActiveFile: (fileId) => {
        set({ activeFile: fileId });
      },

      addTerminalOutput: (output) => {
        set((state) => ({
          terminalOutput: [...state.terminalOutput, output].slice(-500),
        }));
      },

      clearTerminal: () => {
        set({ terminalOutput: [] });
      },

      setIsBuilding: (building) => {
        set({ isBuilding: building });
      },

      setPreviewUrl: (url) => {
        set({ previewUrl: url });
      },

      downloadProject: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;
        console.log('Download project:', project.name);
      },

      getFileLanguage: (filename) => {
        const ext = filename.slice(filename.lastIndexOf('.'));
        return languageMap[ext] || 'plaintext';
      },
    }),
    {
      name: 'nexus-workspace-store',
      partialize: (state) => ({ projects: state.projects }),
    }
  )
);
