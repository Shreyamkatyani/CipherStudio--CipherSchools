import { Sandpack } from '@codesandbox/sandpack-react';
import { ProjectFile } from '../types';

interface PreviewProps {
  files: ProjectFile[];
  theme: 'light' | 'dark';
}

export function Preview({ files, theme }: PreviewProps) {
  const sandpackFiles = files
    .filter((f) => !f.is_folder)
    .reduce((acc, file) => {
      acc[file.path] = {
        code: file.content,
      };
      return acc;
    }, {} as Record<string, { code: string }>);

  if (Object.keys(sandpackFiles).length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
          No files to preview
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Sandpack
        template="react-ts"
        files={sandpackFiles}
        theme={theme === 'dark' ? 'dark' : 'light'}
        options={{
          showNavigator: true,
          showTabs: false,
          showLineNumbers: false,
          editorHeight: '100%',
          editorWidthPercentage: 0,
          classes: {
            'sp-wrapper': 'h-full',
            'sp-layout': 'h-full',
            'sp-preview-container': 'h-full',
          },
        }}
      />
    </div>
  );
}
