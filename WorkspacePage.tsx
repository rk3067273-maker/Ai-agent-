import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderTree, FileCode, Play, Download, Plus, Trash2, Save, RotateCcw, Terminal, Eye, X, Code2 } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function WorkspacePage() {
  const { 
    projects, activeProject, openFiles, activeFile, 
    createProject, setActiveProject, addFile, updateFile, 
    openFile, closeFile, setActiveFile, terminalOutput, 
    clearTerminal, isBuilding 
  } = useWorkspaceStore();

  const [newFileName, setNewFileName] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);

  const project = projects.find(p => p.id === activeProject);
  const currentFile = project?.files.find(f => f.id === activeFile);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName, 'typescript', 'react');
      setNewProjectName('');
      setShowNewProject(false);
    }
  };

  const handleCreateFile = () => {
    if (newFileName.trim() && activeProject) {
      addFile(activeProject, {
        name: newFileName,
        path: newFileName,
        content: '',
        language: 'typescript',
        isOpen: true,
        isModified: false,
        isActive: true,
      });
      setNewFileName('');
      setShowNewFile(false);
    }
  };

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop();
    const map: Record<string, string> = {
      js: 'javascript', ts: 'typescript', tsx: 'tsx', jsx: 'jsx',
      py: 'python', java: 'java', cpp: 'cpp', c: 'c',
      html: 'html', css: 'css', scss: 'scss', json: 'json',
      md: 'markdown', sql: 'sql', sh: 'bash', yaml: 'yaml', yml: 'yaml',
    };
    return map[ext || ''] || 'text';
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6">
      {/* File Explorer */}
      <div className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col">
        <div className="p-4 border-b border-dark-800 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FolderTree className="w-4 h-4" />
            Explorer
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setShowNewFile(true)}
              className="p-1 rounded hover:bg-dark-800 text-dark-400 hover:text-white"
              title="New File"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Projects */}
        <div className="p-2 space-y-1">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProject(p.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeProject === p.id ? 'bg-primary-500/10 text-primary-400' : 'text-dark-400 hover:bg-dark-800'
              }`}
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={() => setShowNewProject(true)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-dark-500 hover:bg-dark-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-3 h-3" /> New Project
          </button>
        </div>

        {/* Files */}
        {project && (
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-xs text-dark-600 uppercase tracking-wider px-3 mb-2">{project.name}</div>
            {project.files.map(file => (
              <button
                key={file.id}
                onClick={() => { openFile(file.id); setActiveFile(file.id); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  activeFile === file.id ? 'bg-dark-800 text-white' : 'text-dark-400 hover:bg-dark-800/50'
                }`}
              >
                <FileCode className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
                {file.isModified && <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        {openFiles.length > 0 && (
          <div className="flex items-center bg-dark-900 border-b border-dark-800 overflow-x-auto">
            {openFiles.map(fileId => {
              const file = project?.files.find(f => f.id === fileId);
              if (!file) return null;
              return (
                <button
                  key={fileId}
                  onClick={() => setActiveFile(fileId)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-dark-800 transition-colors min-w-0 ${
                    activeFile === fileId ? 'bg-dark-800 text-white' : 'text-dark-400 hover:bg-dark-800/50'
                  }`}
                >
                  <span className="truncate">{file.name}</span>
                  {file.isModified && <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); closeFile(fileId); }}
                    className="hover:text-red-400 flex-shrink-0 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </button>
              );
            })}
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative overflow-auto">
            {currentFile ? (
              <textarea
                value={currentFile.content}
                onChange={(e) => activeProject && updateFile(activeProject, currentFile.id, e.target.value)}
                className="w-full h-full bg-dark-950 text-white p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                spellCheck={false}
                style={{ tabSize: 2 }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-dark-500">
                <div className="text-center">
                  <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a file to start editing</p>
                  <p className="text-sm mt-2">Create a new project or open an existing file</p>
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 border-l border-dark-800 hidden lg:flex flex-col">
            <div className="h-8 bg-dark-900 border-b border-dark-800 flex items-center px-4">
              <Eye className="w-4 h-4 text-dark-500 mr-2" />
              <span className="text-sm text-dark-400">Live Preview</span>
            </div>
            <div className="flex-1 bg-white overflow-auto">
              {currentFile && currentFile.name.endsWith('.html') ? (
                <iframe
                  srcDoc={currentFile.content}
                  className="w-full h-full border-none"
                  title="Preview"
                />
              ) : (
                <div className="p-4 text-gray-800">
                  <p className="text-sm text-gray-500">Preview available for HTML files</p>
                  {currentFile && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Syntax Highlight</p>
                      <SyntaxHighlighter
                        language={getLanguage(currentFile.name)}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, borderRadius: 8, fontSize: 12 }}
                      >
                        {currentFile.content || '// Start typing...'}
                      </SyntaxHighlighter>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Terminal */}
        <div className="h-40 bg-dark-900 border-t border-dark-800 flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-dark-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-dark-500" />
              <span className="text-sm text-dark-400">Terminal</span>
              {isBuilding && (
                <span className="text-xs text-primary-400 animate-pulse">Building...</span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={clearTerminal} className="text-xs text-dark-500 hover:text-white transition-colors">
                Clear
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
            {terminalOutput.length === 0 ? (
              <p className="text-dark-600">$ Ready for commands...</p>
            ) : (
              terminalOutput.map((line, i) => (
                <div key={i} className={`${line.startsWith('Error') ? 'text-red-400' : line.startsWith('Success') ? 'text-green-400' : 'text-dark-300'}`}>
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-900 border border-dark-700 rounded-xl p-6 w-96"
          >
            <h3 className="text-lg font-semibold text-white mb-4">New Project</h3>
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white mb-4 focus:outline-none focus:border-primary-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewProject(false)}
                className="flex-1 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm transition-colors"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* New File Modal */}
      {showNewFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-900 border border-dark-700 rounded-xl p-6 w-96"
          >
            <h3 className="text-lg font-semibold text-white mb-4">New File</h3>
            <input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.ts"
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white mb-4 focus:outline-none focus:border-primary-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewFile(false)}
                className="flex-1 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm transition-colors"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
