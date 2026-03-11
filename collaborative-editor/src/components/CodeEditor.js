'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

// Default code snippets matching the requirements
const DEFAULT_CODE = {
  javascript: 'function hello() {\n  console.log("Hello world");\n}',
  python: 'def hello():\n    print("Hello world")',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello world" << std::endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello world");\n    }\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello world")\n}'
};

export default function CodeEditor({ language, file }) {
  // Use file content if it exists, otherwise use default snippet for language
  const code = file?.content !== undefined && file?.content !== null 
    ? file.content 
    : (DEFAULT_CODE[language] || DEFAULT_CODE.javascript);

  const handleEditorDidMount = (editor, monaco) => {
    // Custom VS Code-like monaco theme to match our aesthetic, no blue/purple
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { background: '1e1e1e' },
        { token: 'keyword', foreground: '4d7a5a' },
        { token: 'string', foreground: 'd7ba7d' },
        { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'type', foreground: '4ec9b0' }
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editorLineNumber.foreground': '#858585',
        'editorIndentGuide.background': '#404040',
        'editorSuggestWidget.background': '#252526',
        'editorSuggestWidget.border': '#454545',
      }
    });
    
    monaco.editor.setTheme('custom-dark');
  };

  return (
    <div className="monaco-editor-wrapper">
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={code}
        theme="vs-dark" // Fallback, custom theme applied on mount
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
          lineHeight: 24,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: true,
          formatOnPaste: true,
          renderWhitespace: 'selection',
        }}
      />
    </div>
  );
}
