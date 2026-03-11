'use client';

import React from 'react';
import { Files, Search, GitBranch, Blocks, Settings } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.topIcons}>
        <button className={`${styles.iconButton} ${styles.active}`} aria-label="Explorer">
          <Files size={24} strokeWidth={1.5} />
        </button>
        <button className={styles.iconButton} aria-label="Search">
          <Search size={24} strokeWidth={1.5} />
        </button>
        <button className={styles.iconButton} aria-label="Source Control">
          <GitBranch size={24} strokeWidth={1.5} />
        </button>
        <button className={styles.iconButton} aria-label="Extensions">
          <Blocks size={24} strokeWidth={1.5} />
        </button>
      </div>
      <div className={styles.bottomIcons}>
        <button className={styles.iconButton} aria-label="Settings">
          <Settings size={24} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
