'use client';

import React, { useState } from 'react';
import { Play, Share2, User, TerminalSquare, Cloud, Copy, Check, X } from 'lucide-react';
import styles from './TopBar.module.css';

export default function TopBar({
  userName,
  fileName,
  language,
  room,
  isRunning = false,
  onRun,
}) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleOpenShare = () => {
    setIsCopied(false);
    setIsShareOpen(true);
  };

  const handleCopyRoom = async () => {
    if (!room) {
      return;
    }

    try {
      await navigator.clipboard.writeText(room);
      setIsCopied(true);
      window.setTimeout(() => {
        setIsShareOpen(false);
        setIsCopied(false);
      }, 500);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.leftSection}>
          <div className={styles.projectBlock}>
            <div className={styles.projectName}>Code Sync</div>
            <div className={styles.projectMeta}>Collaborative {language?.label || 'code'} workspace</div>
          </div>
          {fileName && (
            <div className={styles.fileNameIndicator}>
              {fileName}
            </div>
          )}
          <div className={styles.runtimeIndicator}>
            <TerminalSquare size={13} />
            {language?.runtimeLabel || 'Code'}
          </div>
          {userName && (
            <div className={styles.langIndicator}>
              <User size={14} />
              {userName}
            </div>
          )}
          {room && (
            <div className={styles.roomIndicator}>
              <Cloud size={12} />
              Room <span>{room}</span>
            </div>
          )}
        </div>
        
        <div className={styles.rightSection}>
          <button
            className={`${styles.actionButton} ${styles.runButton}`}
            onClick={onRun}
            disabled={isRunning}
          >
            <Play size={14} fill="currentColor" />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>
          <button
            className={`${styles.actionButton} ${styles.shareButton}`}
            onClick={handleOpenShare}
            disabled={!room}
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {isShareOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsShareOpen(false)}>
          <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setIsShareOpen(false)}
              aria-label="Close share dialog"
            >
              <X size={16} />
            </button>
            <div className={styles.modalEyebrow}>Invite collaborator</div>
            <div className={styles.modalTitle}>Share this room code</div>
            <div className={styles.modalText}>
              Send this code to anyone you want to join the current {language?.label || 'code'} session.
            </div>
            <div className={styles.roomCodeBox}>{room}</div>
            <button className={styles.copyButton} onClick={handleCopyRoom}>
              {isCopied ? <Check size={15} /> : <Copy size={15} />}
              <span>{isCopied ? 'Copied' : 'Copy code'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
