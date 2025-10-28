export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  path: string;
  content: string;
  is_folder: boolean;
  created_at: string;
  updated_at: string;
}

export interface FileNode {
  path: string;
  name: string;
  isFolder: boolean;
  content?: string;
  children?: FileNode[];
}

export interface Theme {
  mode: 'light' | 'dark';
}
