import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme: 'light' | 'dark';
}

export function CodeEditor({ value, onChange, language, theme }: CodeEditorProps) {
  const getLanguage = (lang: string): string => {
    const ext = lang.toLowerCase();
    if (ext.includes('tsx') || ext.includes('jsx')) return 'typescript';
    if (ext.includes('ts')) return 'typescript';
    if (ext.includes('js')) return 'javascript';
    if (ext.includes('css')) return 'css';
    if (ext.includes('html')) return 'html';
    if (ext.includes('json')) return 'json';
    return 'plaintext';
  };

  return (
    <Editor
      height="100%"
      language={getLanguage(language)}
      value={value}
      onChange={(value) => onChange(value || '')}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        padding: { top: 16 },
      }}
    />
  );
}
