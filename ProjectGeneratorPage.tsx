import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ArrowRight, Download, FileCode, Check, Copy, Folder, Code2, Globe, Server, Smartphone, Monitor, Puzzle, Layout, LayoutDashboard, MessageSquare, ShoppingCart, FileText, User, Sparkles } from 'lucide-react';
import { projectGenerator } from '@/services/projectGenerator';
import type { ProjectTemplate, ProjectFile } from '@/types';
import toast from 'react-hot-toast';

const iconMap: Record<string, any> = {
  AppWindow: Code2, Globe: Globe, Server: Server, Smartphone: Smartphone,
  Monitor: Monitor, Puzzle: Puzzle, Layout: Layout, LayoutDashboard: LayoutDashboard,
  MessageSquare: MessageSquare, ShoppingCart: ShoppingCart, FileText: FileText,
  User: User, Sparkles: Sparkles, Wind: Code2, Command: Code2, Code2: Code2,
  Search: Code2, Users: Code2, BrainCircuit: Code2, Smile: Code2, Cloud: Code2,
  Settings: Code2, Brain: Code2, MessageSquare: MessageSquare, Zap: Code2,
};

export default function ProjectGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState('');
  const [generated, setGenerated] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<ProjectFile[]>([]);
  const [generatedReadme, setGeneratedReadme] = useState('');
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const templates = projectGenerator.getTemplates();
  const categories = projectGenerator.getCategories();

  const handleGenerate = () => {
    if (!selectedTemplate || !projectName.trim()) {
      toast.error('Please select a template and enter a project name');
      return;
    }

    const project = projectGenerator.generateProject(selectedTemplate.id, projectName);
    setGeneratedFiles(project.files);
    setGeneratedReadme(project.readme);
    setGenerated(true);
    if (project.files.length > 0) setActiveFile(project.files[0].path);
    toast.success('Project generated successfully!');
  };

  const handleDownload = async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      generatedFiles.forEach(file => {
        zip.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Project downloaded!');
    } catch (error) {
      toast.error('Failed to create ZIP');
    }
  };

  const currentFile = generatedFiles.find(f => f.path === activeFile);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Project Generator</h1>
        <p className="text-dark-400">Generate complete, production-ready projects with one click</p>
      </div>

      <AnimatePresence mode="wait">
        {!generated ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Folder className="w-5 h-5 text-primary-400" />
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.filter(t => t.category === category).map(template => {
                    const IconComponent = iconMap[template.icon] || Code2;
                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-6 rounded-xl border text-left transition-all hover:scale-[1.02] group ${
                          selectedTemplate?.id === template.id
                            ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                            : 'border-dark-800 bg-dark-900 hover:border-dark-700'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-white mb-1">{template.name}</h4>
                        <p className="text-sm text-dark-400 mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.dependencies.slice(0, 4).map(dep => (
                            <span key={dep} className="text-xs bg-dark-800 px-2 py-1 rounded text-dark-400">
                              {dep}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {selectedTemplate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-900 border border-dark-800 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedTemplate.name}</h3>
                    <p className="text-sm text-dark-400">{selectedTemplate.description}</p>
                  </div>
                </div>

                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Project Name
                </label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="my-awesome-project"
                    className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                  <button
                    onClick={handleGenerate}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <Wand2 className="w-5 h-5" />
                    Generate
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="generated"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Success Banner */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Project Generated Successfully!</h3>
                <p className="text-sm text-dark-400">{projectName} - {generatedFiles.length} files created</p>
              </div>
              <button
                onClick={handleDownload}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Download ZIP
              </button>
            </div>

            {/* File Explorer + Editor */}
            <div className="flex h-[500px] bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
              {/* File List */}
              <div className="w-64 border-r border-dark-800 overflow-y-auto p-2">
                <div className="text-xs text-dark-600 uppercase tracking-wider px-3 py-2">Files</div>
                {generatedFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFile(file.path)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                      activeFile === file.path ? 'bg-primary-500/10 text-primary-400' : 'text-dark-400 hover:bg-dark-800'
                    }`}
                  >
                    <FileCode className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </button>
                ))}
              </div>

              {/* Code Preview */}
              <div className="flex-1 overflow-auto bg-dark-950 p-4">
                {currentFile ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-white">{currentFile.path}</h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentFile.content);
                          toast.success('Copied!');
                        }}
                        className="flex items-center gap-1 text-xs text-dark-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    <pre className="text-sm text-dark-300 font-mono leading-relaxed whitespace-pre-wrap">
                      {currentFile.content}
                    </pre>
                  </div>
                ) : (
                  <p className="text-dark-500 text-center mt-20">Select a file to view</p>
                )}
              </div>
            </div>

            {/* README Preview */}
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-400" />
                README Preview
              </h3>
              <div className="prose prose-invert max-w-none">
                <pre className="text-sm text-dark-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {generatedReadme}
                </pre>
              </div>
            </div>

            <button
              onClick={() => {
                setGenerated(false);
                setSelectedTemplate(null);
                setProjectName('');
                setGeneratedFiles([]);
                setActiveFile(null);
              }}
              className="text-primary-400 hover:text-primary-300 flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Generate Another Project
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
