'use client';

import React from 'react';
import { Play, Share2, User } from 'lucide-react';
import styles from './TopBar.module.css';

export default function TopBar({ userName, fileName, room }) {
  return (
    <div className={styles.topBar}>
      <div className={styles.leftSection}>
        <div className={styles.projectName}>collaborative-editor</div>
        {fileName && (
          <div className={styles.fileNameIndicator}>
            {fileName}
          </div>
        )}
        {userName && (
          <div className={styles.langIndicator} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} />
            {userName}
          </div>
        )}
        {room && (
          <div className={styles.roomIndicator}>
            Room: <span>{room}</span>
          </div>
        )}
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
