import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { ProjectDashboard } from './components/ProjectDashboard';
import { IDE } from './components/IDE';
import { Project } from './types';

function AppContent() {
  const { user, loading } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('cipherstudio-theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('cipherstudio-theme', newTheme);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-200">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (selectedProject) {
    return (
      <IDE
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />
    );
  }

  return (
    <ProjectDashboard
      onSelectProject={setSelectedProject}
      theme={theme}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
