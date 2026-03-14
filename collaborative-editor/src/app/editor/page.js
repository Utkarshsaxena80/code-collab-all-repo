'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Explorer from '@/components/Explorer';
import TopBar from '@/components/TopBar';
import CodeEditor from '@/components/CodeEditor';
import styles from './page.module.css';

const RUN_API_URL = process.env.NEXT_PUBLIC_RUN_API_URL || 'http://localhost:3001/run';

// Component that uses useSearchParams must be wrapped in Suspense in Next.js App Router
function EditorContent() {
  const searchParams = useSearchParams();
  const userName = searchParams.get('name') || 'Anonymous';
  const room = searchParams.get('room') || 'default-room';
  const [editorOutput, setEditorOutput] = useState('');
  const [stdinValue, setStdinValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeFile, setActiveFile] = useState({ 
    id: '1', 
    name: 'main.py', 
    type: 'file', 
    content: null // null means we'll fall back to default code
  });

  const handleSelectFile = (file) => {
    setActiveFile(file);
    setEditorOutput('');
  };

  const handleCodeChange = (content) => {
    setActiveFile((currentFile) => {
      if (!currentFile) {
        return currentFile;
      }

      return {
        ...currentFile,
        content,
      };
    });
  };

  const handleRunCode = async () => {
    if (!activeFile) {
      return;
    }

    setIsRunning(true);
    setEditorOutput('Running code on remote container...');

    try {
      const response = await fetch(RUN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: activeFile.name,
          code: activeFile.content ?? '',
          stdin: stdinValue,
        }),
      });

      const responseText = await response.text();
      let result = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          `Run API returned non-JSON data. Make sure the backend is running at ${RUN_API_URL}.`
        );
      }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to run code.');
      }

      setEditorOutput(result.output || 'Execution finished with no output.');
    } catch (error) {
      setEditorOutput(error.message || 'Unable to run code.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <Explorer activeFileId={activeFile?.id} onSelectFile={handleSelectFile} />
      <div className={styles.mainArea}>
        <TopBar
          userName={userName}
          fileName={activeFile?.name}
          room={room}
          isRunning={isRunning}
          onRun={handleRunCode}
        />
        <div className={styles.editorContainer}>
          <CodeEditor
            userName={userName}
            file={{ ...activeFile, onContentChange: handleCodeChange }}
            room={room}
          />
        </div>
        <div className={styles.ioPanel}>
          <div className={styles.inputPanel}>
            <div className={styles.outputHeader}>Program Input</div>
            <textarea
              className={styles.inputArea}
              value={stdinValue}
              onChange={(event) => setStdinValue(event.target.value)}
              placeholder={'Enter input values here.\nEach line will be sent to stdin.'}
              spellCheck={false}
            />
          </div>
        <div className={styles.outputPanel}>
          <div className={styles.outputHeader}>Run Output</div>
          <pre className={styles.outputBody}>{editorOutput || 'Click Run to execute the current file.'}</pre>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading environment...</div>}>
      <EditorContent />
    </Suspense>
  );
}
