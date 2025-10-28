import { useState, useEffect } from 'react';
import { useProjectFiles } from '../hooks/useProjectFiles';
import { Project } from '../types';
import { FileTree } from './FileTree';
import { CodeEditor } from './CodeEditor';
import { Preview } from './Preview';
import {
  ArrowLeft,
  Save,
  Play,
  Sun,
  Moon,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Eye,
  Code2,
} from 'lucide-react';

interface IDEProps {
  project: Project;
  onBack: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export function IDE({ project, onBack, theme, onThemeToggle }: IDEProps) {
  const {
    files,
    loading,
    createFile,
    updateFile,
    renameFile,
    deleteFile,
    getFileTree,
  } = useProjectFiles(project.id);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (selectedFile) {
      const file = files.find((f) => f.path === selectedFile);
      if (file) {
        setFileContent(file.content);
        setHasUnsavedChanges(false);
      }
    }
  }, [selectedFile, files]);

  useEffect(() => {
    if (autoSave && hasUnsavedChanges && selectedFile) {
      const timer = setTimeout(() => {
        handleSave();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [fileContent, autoSave, hasUnsavedChanges]);

  const handleSelectFile = (path: string) => {
    if (hasUnsavedChanges && selectedFile) {
      if (!confirm('You have unsaved changes. Do you want to discard them?')) {
        return;
      }
    }
    setSelectedFile(path);
  };

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (selectedFile) {
      await updateFile(selectedFile, fileContent);
      setHasUnsavedChanges(false);
    }
  };

  const handleCreateFile = async (path: string, isFolder: boolean) => {
    await createFile(path, '', isFolder);
    if (!isFolder) {
      setSelectedFile(path);
    }
  };

  const bgClass = theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50';
  const panelClass = theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textClass = theme === 'dark' ? 'text-slate-200' : 'text-slate-800';

  const fileTree = getFileTree();

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${bgClass}`}>
        <div className={textClass}>Loading project...</div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${bgClass}`}>
      <div className={`${panelClass} border-b px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-500" />
            <h1 className={`text-lg font-semibold ${textClass}`}>{project.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
            title="Toggle Sidebar"
          >
            {showSidebar ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
            title="Toggle Preview"
          >
            <Eye className="w-5 h-5" />
          </button>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasUnsavedChanges
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : theme === 'dark'
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            {hasUnsavedChanges ? 'Save' : 'Saved'}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={onThemeToggle}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <div className={`w-64 ${panelClass} border-r overflow-hidden flex flex-col`}>
            <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
              <h2 className={`font-semibold ${textClass}`}>Files</h2>
            </div>
            <FileTree
              tree={fileTree}
              selectedFile={selectedFile}
              onSelectFile={handleSelectFile}
              onCreateFile={handleCreateFile}
              onDeleteFile={deleteFile}
              onRenameFile={renameFile}
              theme={theme}
            />
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          <div className={showPreview ? 'w-1/2' : 'w-full'}>
            {selectedFile ? (
              <CodeEditor
                value={fileContent}
                onChange={handleContentChange}
                language={selectedFile}
                theme={theme}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Code2 className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`} />
                  <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                    Select a file to start editing
                  </p>
                </div>
              </div>
            )}
          </div>

          {showPreview && (
            <div className={`w-1/2 ${panelClass} border-l`}>
              <Preview files={files} theme={theme} />
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${panelClass} rounded-2xl shadow-2xl border max-w-md w-full p-6`}>
            <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${textClass}`}>Auto Save</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Automatically save changes after 1 second
                  </p>
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSave ? 'bg-blue-500' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      autoSave ? 'transform translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${textClass}`}>Theme</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Current: {theme === 'dark' ? 'Dark' : 'Light'}
                  </p>
                </div>
                <button
                  onClick={onThemeToggle}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Toggle
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className={`mt-6 w-full py-2 px-4 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
