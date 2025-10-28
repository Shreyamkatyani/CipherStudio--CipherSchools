import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types';

export function useProjects(userId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadProjects();
  }, [userId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, description: string = '') => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({ user_id: userId, name, description })
        .select()
        .single();

      if (error) throw error;

      const defaultFiles = [
        { path: '/src', content: '', is_folder: true },
        { path: '/public', content: '', is_folder: true },
        { path: '/src/App.tsx', content: getDefaultAppCode(), is_folder: false },
        { path: '/src/index.tsx', content: getDefaultIndexCode(), is_folder: false },
        { path: '/src/App.css', content: getDefaultAppCss(), is_folder: false },
      ];

      await Promise.all(
        defaultFiles.map((file) =>
          supabase.from('project_files').insert({
            project_id: data.id,
            path: file.path,
            content: file.content,
            is_folder: file.is_folder,
          })
        )
      );

      await loadProjects();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: loadProjects,
  };
}

function getDefaultAppCode() {
  return `import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to CipherStudio</h1>
        <p>Start editing to see your changes live!</p>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;`;
}

function getDefaultIndexCode() {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
}

function getDefaultAppCss() {
  return `.App {
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.App-header {
  color: white;
}

.App-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.card {
  margin-top: 2rem;
}

button {
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  background-color: white;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover {
  transform: scale(1.05);
}`;
}
