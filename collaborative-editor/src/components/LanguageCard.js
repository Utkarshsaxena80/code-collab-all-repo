'use client';

import React from 'react';
import styles from './LanguageCard.module.css';

export default function LanguageCard({ name, icon: Icon, onClick }) {
  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.iconWrapper}>
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <span className={styles.name}>{name}</span>
    </button>
  );
}
