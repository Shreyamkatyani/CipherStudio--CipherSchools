import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { Project } from '../types';
import { Plus, Folder, Calendar, Trash2, Edit2, Code2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProjectDashboardProps {
  onSelectProject: (project: Project) => void;
  theme: 'light' | 'dark';
}

export function ProjectDashboard({ onSelectProject, theme }: ProjectDashboardProps) {
  const { user, signOut } = useAuth();
  const { projects, loading, createProject, deleteProject } = useProjects(user?.id);
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const project = await createProject(projectName, projectDescription);
    if (project) {
      setShowNewProject(false);
      setProjectName('');
      setProjectDescription('');
      onSelectProject(project);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const bgClass = theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50';
  const cardClass = theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textClass = theme === 'dark' ? 'text-slate-200' : 'text-slate-800';
  const mutedClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${textClass}`}>CipherStudio</h1>
              <p className={mutedClass}>Your Projects</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <button
          onClick={() => setShowNewProject(true)}
          className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Create New Project
        </button>

        {loading ? (
          <div className="text-center py-12">
            <div className={`text-lg ${mutedClass}`}>Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className={`text-center py-12 ${cardClass} rounded-xl border`}>
            <Folder className={`w-16 h-16 mx-auto mb-4 ${mutedClass}`} />
            <h3 className={`text-xl font-semibold mb-2 ${textClass}`}>No projects yet</h3>
            <p className={mutedClass}>Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`${cardClass} rounded-xl border p-6 hover:shadow-lg transition-all cursor-pointer group`}
                onClick={() => onSelectProject(project)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                    }`}>
                      <Folder className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${textClass} group-hover:text-blue-500 transition-colors`}>
                        {project.name}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this project?')) {
                        deleteProject(project.id);
                      }
                    }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg ${
                      theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                    } text-red-500`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {project.description && (
                  <p className={`text-sm ${mutedClass} mb-4 line-clamp-2`}>
                    {project.description}
                  </p>
                )}
                <div className={`flex items-center gap-2 text-xs ${mutedClass}`}>
                  <Calendar className="w-3 h-3" />
                  {formatDate(project.updated_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${cardClass} rounded-2xl shadow-2xl border max-w-md w-full p-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${textClass}`}>Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  placeholder="My Awesome App"
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                  Description (optional)
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="A brief description of your project"
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewProject(false);
                    setProjectName('');
                    setProjectDescription('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
