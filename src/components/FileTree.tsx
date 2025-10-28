import { useState } from 'react';
import { FileNode } from '../types';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';

interface FileTreeProps {
  tree: FileNode[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string, isFolder: boolean) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
  theme: 'light' | 'dark';
}

export function FileTree({
  tree,
  selectedFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  theme,
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/src', '/public']));
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleContextMenu = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, path });
  };

  const handleNewFile = () => {
    if (!contextMenu) return;
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const newPath = contextMenu.path + '/' + fileName;
      onCreateFile(newPath, false);
    }
    setContextMenu(null);
  };

  const handleNewFolder = () => {
    if (!contextMenu) return;
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const newPath = contextMenu.path + '/' + folderName;
      onCreateFile(newPath, true);
    }
    setContextMenu(null);
  };

  const handleRename = (path: string) => {
    const fileName = path.split('/').pop() || '';
    setNewName(fileName);
    setRenamingPath(path);
    setContextMenu(null);
  };

  const confirmRename = (oldPath: string) => {
    if (newName && newName !== oldPath.split('/').pop()) {
      const pathParts = oldPath.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join('/');
      onRenameFile(oldPath, newPath);
    }
    setRenamingPath(null);
    setNewName('');
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;
    const isRenaming = renamingPath === node.path;

    const baseClasses = theme === 'dark'
      ? 'hover:bg-slate-700/50 text-slate-200'
      : 'hover:bg-slate-200 text-slate-800';

    const selectedClasses = theme === 'dark'
      ? 'bg-blue-500/20 border-l-2 border-blue-500'
      : 'bg-blue-100 border-l-2 border-blue-500';

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer transition-colors ${baseClasses} ${
            isSelected ? selectedClasses : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.isFolder) {
              toggleFolder(node.path);
            } else {
              onSelectFile(node.path);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node.path)}
        >
          {node.isFolder && (
            <span className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          {node.isFolder ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
            )
          ) : (
            <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
          )}
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => confirmRename(node.path)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmRename(node.path);
                if (e.key === 'Escape') {
                  setRenamingPath(null);
                  setNewName('');
                }
              }}
              autoFocus
              className={`flex-1 px-1 py-0 text-sm rounded outline-none ${
                theme === 'dark'
                  ? 'bg-slate-700 text-slate-200 border border-blue-500'
                  : 'bg-white text-slate-800 border border-blue-500'
              }`}
            />
          ) : (
            <span className="text-sm truncate flex-1">{node.name}</span>
          )}
        </div>
        {node.isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto">
      {tree.map((node) => renderNode(node))}

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className={`fixed z-50 min-w-[180px] rounded-lg shadow-xl border ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={handleNewFile}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-slate-700 text-slate-200'
                  : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              New File
            </button>
            <button
              onClick={handleNewFolder}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-slate-700 text-slate-200'
                  : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              New Folder
            </button>
            <button
              onClick={() => handleRename(contextMenu.path)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-slate-700 text-slate-200'
                  : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Edit2 className="w-4 h-4" />
              Rename
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this?')) {
                  onDeleteFile(contextMenu.path);
                }
                setContextMenu(null);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors text-red-500 ${
                theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
