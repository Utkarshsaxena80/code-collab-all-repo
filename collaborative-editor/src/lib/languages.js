export const DEFAULT_LANGUAGE_ID = 'python';

export const LANGUAGE_OPTIONS = [
  {
    id: 'python',
    label: 'Python',
    runtimeLabel: 'Python',
    monacoLanguage: 'python',
    extension: 'py',
    defaultFileName: 'main.py',
    newFilePlaceholder: 'New Python file...',
    defaultCode: 'def hello():\n    print("Hello world")\n\nhello()',
    files: [
      { id: '1', name: 'main.py', type: 'file', content: 'def hello():\n    print("Hello world")\n\nhello()' },
      { id: '2', name: 'helpers.py', type: 'file', content: 'def add(a, b):\n    return a + b' },
    ],
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    runtimeLabel: 'TypeScript',
    monacoLanguage: 'typescript',
    extension: 'ts',
    defaultFileName: 'main.ts',
    newFilePlaceholder: 'New TypeScript file...',
    defaultCode: 'const hello = (name: string): void => {\n  console.log(`Hello ${name}`);\n};\n\nhello("world");',
    files: [
      { id: '1', name: 'main.ts', type: 'file', content: 'const hello = (name: string): void => {\n  console.log(`Hello ${name}`);\n};\n\nhello("world");' },
      { id: '2', name: 'helpers.ts', type: 'file', content: 'export const add = (a: number, b: number): number => a + b;' },
    ],
  },
  {
    id: 'golang',
    label: 'Go',
    runtimeLabel: 'Go',
    monacoLanguage: 'go',
    extension: 'go',
    defaultFileName: 'main.go',
    newFilePlaceholder: 'New Go file...',
    defaultCode: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello world")\n}',
    files: [
      { id: '1', name: 'main.go', type: 'file', content: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello world")\n}' },
    ],
  },
  {
    id: 'nodejs',
    label: 'Node.js',
    runtimeLabel: 'Node.js',
    monacoLanguage: 'javascript',
    extension: 'js',
    defaultFileName: 'index.js',
    newFilePlaceholder: 'New JavaScript file...',
    defaultCode: 'function hello(name) {\n  console.log(`Hello ${name}`);\n}\n\nhello("world");',
    files: [
      { id: '1', name: 'index.js', type: 'file', content: 'function hello(name) {\n  console.log(`Hello ${name}`);\n}\n\nhello("world");' },
      { id: '2', name: 'utils.js', type: 'file', content: 'export function add(a, b) {\n  return a + b;\n}' },
    ],
  },
];

const languagesById = new Map(LANGUAGE_OPTIONS.map((language) => [language.id, language]));
const languagesByExtension = new Map(
  LANGUAGE_OPTIONS.map((language) => [language.extension, language])
);

export const getLanguageById = (languageId) => {
  return languagesById.get(languageId) || languagesById.get(DEFAULT_LANGUAGE_ID);
};

export const getLanguageForFileName = (fileName, fallbackLanguageId = DEFAULT_LANGUAGE_ID) => {
  const fallbackLanguage = getLanguageById(fallbackLanguageId);

  if (!fileName || !fileName.includes('.')) {
    return fallbackLanguage;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  return languagesByExtension.get(extension) || fallbackLanguage;
};

export const createInitialFileSystem = (languageId = DEFAULT_LANGUAGE_ID) => {
  const language = getLanguageById(languageId);

  return {
    id: 'root',
    name: 'workspace',
    type: 'folder',
    isOpen: true,
    children: language.files.map((file) => ({ ...file })),
  };
};

export const createDefaultActiveFile = (languageId = DEFAULT_LANGUAGE_ID) => {
  const language = getLanguageById(languageId);
  const defaultFile = language.files[0];

  return {
    ...defaultFile,
    content: defaultFile.content ?? language.defaultCode,
  };
};
