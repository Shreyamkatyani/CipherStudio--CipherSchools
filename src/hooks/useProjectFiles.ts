import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProjectFile, FileNode } from '../types';

export function useProjectFiles(projectId: string | null) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    loadFiles();
  }, [projectId]);

  const loadFiles = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('path');

      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const createFile = async (path: string, content: string = '', isFolder: boolean = false) => {
    if (!projectId) return;

    try {
      const { error } = await supabase.from('project_files').insert({
        project_id: projectId,
        path,
        content,
        is_folder: isFolder,
      });

      if (error) throw error;
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create file');
    }
  };

  const updateFile = async (path: string, content: string) => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('project_files')
        .update({ content })
        .eq('project_id', projectId)
        .eq('path', path);

      if (error) throw error;
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update file');
    }
  };

  const renameFile = async (oldPath: string, newPath: string) => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('project_files')
        .update({ path: newPath })
        .eq('project_id', projectId)
        .eq('path', oldPath);

      if (error) throw error;
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename file');
    }
  };

  const deleteFile = async (path: string) => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('project_files')
        .delete()
        .eq('project_id', projectId)
        .eq('path', path);

      if (error) throw error;
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  const getFileTree = (): FileNode[] => {
    const root: FileNode[] = [];
    const nodeMap = new Map<string, FileNode>();

    files
      .filter((f) => !f.is_folder)
      .forEach((file) => {
        const parts = file.path.split('/').filter(Boolean);
        let currentLevel = root;

        parts.forEach((part, index) => {
          const currentPath = '/' + parts.slice(0, index + 1).join('/');
          const isLast = index === parts.length - 1;

          if (isLast) {
            const node: FileNode = {
              path: file.path,
              name: part,
              isFolder: false,
              content: file.content,
            };
            currentLevel.push(node);
          } else {
            let folderNode = nodeMap.get(currentPath);
            if (!folderNode) {
              folderNode = {
                path: currentPath,
                name: part,
                isFolder: true,
                children: [],
              };
              nodeMap.set(currentPath, folderNode);
              currentLevel.push(folderNode);
            }
            currentLevel = folderNode.children!;
          }
        });
      });

    return root;
  };

  return {
    files,
    loading,
    error,
    createFile,
    updateFile,
    renameFile,
    deleteFile,
    refreshFiles: loadFiles,
    getFileTree,
  };
}
