'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  User
} from 'lucide-react';
import { DEFAULT_LANGUAGE_ID, LANGUAGE_OPTIONS } from '@/lib/languages';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState('name'); // 'name' | 'initial' | 'join'
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANGUAGE_ID);

  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    router.push(`/editor?room=${code}&lang=${selectedLanguage}&name=${encodeURIComponent(userName)}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      router.push(`/editor?room=${roomCode.trim()}&lang=${selectedLanguage}&name=${encodeURIComponent(userName)}`);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setView('initial');
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Code Sync</h1>
          <p className={styles.subtitle}>
            Code together in real-time with Python, TypeScript, Go, and Node.js workspaces.
          </p>
        </div>

        {view === 'name' && (
          <div className={styles.joinFormContainer}>
            <form onSubmit={handleNameSubmit} className={styles.joinForm}>
              <h2>Enter Your Name</h2>
              <div className={styles.inputWrapper}>
                <User size={20} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Your preferred name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={styles.roomInput}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className={styles.primaryButton}>Continue</button>
            </form>
          </div>
        )}

        {view === 'initial' && (
          <div className={styles.actionCardsWrapper}>
            <div className={styles.welcomeText}>
              <button className={styles.backButton} onClick={() => setView('name')}>&larr; Change Name</button>
              <h2>Welcome, {userName}!</h2>
              <p>Ready to code?</p>
            </div>
            <div className={styles.languagePicker}>
              <div>
                <h3>Choose a room language</h3>
                <p>This sets the starter files. The editor still detects syntax from each file extension.</p>
              </div>
              <div className={styles.languageGrid}>
                {LANGUAGE_OPTIONS.map((language) => (
                  <button
                    key={language.id}
                    type="button"
                    className={`${styles.languageOption} ${selectedLanguage === language.id ? styles.languageOptionActive : ''}`}
                    onClick={() => setSelectedLanguage(language.id)}
                  >
                    <span>{language.label}</span>
                    <small>.{language.extension}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.actionCards}>
              <div className={styles.actionCard} onClick={handleCreateRoom}>
                <Plus size={32} className={styles.actionIcon} />
                <h3>Create a Room</h3>
                <p>Start a new {LANGUAGE_OPTIONS.find((language) => language.id === selectedLanguage)?.label} coding session</p>
              </div>
              <div className={styles.actionCard} onClick={() => setView('join')}>
                <Users size={32} className={styles.actionIcon} />
                <h3>Join a Room</h3>
                <p>Enter an existing session with a code</p>
              </div>
            </div>
          </div>
        )}

        {view === 'join' && (
          <div className={styles.joinFormContainer}>
            <button className={styles.backButton} onClick={() => setView('initial')}>&larr; Back</button>
            <form onSubmit={handleJoinRoom} className={styles.joinForm}>
              <h2>Join Existing Room</h2>
              <div className={styles.compactLanguagePicker}>
                {LANGUAGE_OPTIONS.map((language) => (
                  <button
                    key={language.id}
                    type="button"
                    className={`${styles.compactLanguageOption} ${selectedLanguage === language.id ? styles.compactLanguageOptionActive : ''}`}
                    onClick={() => setSelectedLanguage(language.id)}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Enter Room Code (e.g. A1B2C3)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className={styles.roomInput}
                maxLength={6}
                required
                autoFocus
              />
              <button type="submit" className={styles.primaryButton}>Join Session</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
