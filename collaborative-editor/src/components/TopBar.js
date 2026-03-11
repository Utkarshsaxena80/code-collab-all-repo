'use client';

import React from 'react';
import { Play, Share2 } from 'lucide-react';
import styles from './TopBar.module.css';

export default function TopBar({ language, fileName }) {
  // Format language name for display (e.g. cpp -> C++)
  const displayLang = {
    javascript: 'JavaScript',
    python: 'Python',
    cpp: 'C++',
    java: 'Java',
    go: 'Go'
  }[language] || 'JavaScript';

  return (
    <div className={styles.topBar}>
      <div className={styles.leftSection}>
        <div className={styles.projectName}>collaborative-editor</div>
        {fileName && (
          <div className={styles.fileNameIndicator}>
            {fileName}
          </div>
        )}
        <div className={styles.langIndicator}>
          {displayLang} Environment
        </div>
      </div>
      
      <div className={styles.rightSection}>
        <button className={`${styles.actionButton} ${styles.runButton}`}>
          <Play size={14} fill="currentColor" />
          <span>Run</span>
        </button>
        <button className={`${styles.actionButton} ${styles.shareButton}`}>
          <Share2 size={14} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
