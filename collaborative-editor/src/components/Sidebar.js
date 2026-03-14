'use client';

import React from 'react';
import { Files, Search, GitBranch, Blocks, Settings } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const tools = [
    { label: 'Explorer', icon: Files, active: true },
    { label: 'Search', icon: Search },
    { label: 'Branches', icon: GitBranch },
    { label: 'Packages', icon: Blocks },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.topIcons}>
        <div className={styles.brandMark}>CS</div>
        {tools.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            className={`${styles.iconButton} ${active ? styles.active : ''}`}
            aria-label={label}
            title={label}
          >
            <Icon size={20} strokeWidth={1.8} />
          </button>
        ))}
      </div>
      <div className={styles.bottomIcons}>
        <button className={styles.iconButton} aria-label="Settings" title="Settings">
          <Settings size={20} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
