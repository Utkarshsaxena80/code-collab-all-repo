'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Explorer from '@/components/Explorer';
import TopBar from '@/components/TopBar';
import CodeEditor from '@/components/CodeEditor';
import styles from './page.module.css';

// Component that uses useSearchParams must be wrapped in Suspense in Next.js App Router
function EditorContent() {
  const searchParams = useSearchParams();
  const userName = searchParams.get('name') || 'Anonymous';
  const room = searchParams.get('room') || 'default-room';
  const [activeFile, setActiveFile] = useState({ 
    id: '1', 
    name: 'main.py', 
    type: 'file', 
    content: null // null means we'll fall back to default code
  });

  return (
    <div className={styles.layout}>
      <Sidebar />
      <Explorer activeFileId={activeFile?.id} onSelectFile={setActiveFile} />
      <div className={styles.mainArea}>
        <TopBar userName={userName} fileName={activeFile?.name} room={room} />
        <div className={styles.editorContainer}>
          <CodeEditor userName={userName} file={activeFile} room={room} />
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
