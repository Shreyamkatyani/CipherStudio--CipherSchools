/*
  # CipherStudio Database Schema

  ## Overview
  This migration sets up the complete database structure for CipherStudio, a browser-based React IDE.

  ## 1. New Tables
  
  ### `profiles`
  User profile information linked to auth.users
  - `id` (uuid, primary key) - References auth.users(id)
  - `email` (text) - User's email address
  - `full_name` (text) - User's display name
  - `avatar_url` (text, nullable) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### `projects`
  Stores user projects/workspaces
  - `id` (uuid, primary key) - Unique project identifier
  - `user_id` (uuid, foreign key) - References profiles(id)
  - `name` (text) - Project name
  - `description` (text, nullable) - Project description
  - `created_at` (timestamptz) - Project creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### `project_files`
  Stores individual files within projects
  - `id` (uuid, primary key) - Unique file identifier
  - `project_id` (uuid, foreign key) - References projects(id)
  - `path` (text) - File path (e.g., "/src/App.tsx")
  - `content` (text) - File content/code
  - `is_folder` (boolean) - Whether this is a folder or file
  - `created_at` (timestamptz) - File creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ## 2. Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:
  
  #### profiles
  - Users can view their own profile
  - Users can update their own profile
  - Profiles are created automatically on signup
  
  #### projects
  - Users can view only their own projects
  - Users can create new projects
  - Users can update their own projects
  - Users can delete their own projects
  
  #### project_files
  - Users can view files from their own projects
  - Users can create files in their own projects
  - Users can update files in their own projects
  - Users can delete files from their own projects

  ## 3. Indexes
  - Index on projects(user_id) for fast user project lookups
  - Index on project_files(project_id) for fast file lookups
  - Index on project_files(project_id, path) for unique path validation

  ## 4. Important Notes
  - All timestamps use timestamptz for timezone awareness
  - Cascade deletes ensure data integrity (deleting project removes all files)
  - Default values provide sensible fallbacks
  - RLS policies ensure users can only access their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_files table
CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  path text NOT NULL,
  content text DEFAULT '',
  is_folder boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, path)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project_path ON project_files(project_id, path);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Project files policies
CREATE POLICY "Users can view files from own projects"
  ON project_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create files in own projects"
  ON project_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update files in own projects"
  ON project_files FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files from own projects"
  ON project_files FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_files_updated_at ON project_files;
CREATE TRIGGER update_project_files_updated_at
    BEFORE UPDATE ON project_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();