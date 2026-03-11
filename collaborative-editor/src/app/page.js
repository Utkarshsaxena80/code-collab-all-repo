'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TerminalSquare,
  Users,
  Plus,
  User
} from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState('name'); // 'name' | 'initial' | 'join'
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [generatedRoomCode, setGeneratedRoomCode] = useState('');

  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    router.push(`/editor?room=${code}&lang=python&name=${encodeURIComponent(userName)}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      router.push(`/editor?room=${roomCode.trim()}&lang=python&name=${encodeURIComponent(userName)}`);
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
            Code together in real-time with instant Python environments.
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
            <div className={styles.actionCards}>
              <div className={styles.actionCard} onClick={handleCreateRoom}>
                <Plus size={32} className={styles.actionIcon} />
                <h3>Create a Room</h3>
                <p>Start a new Python coding session</p>
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
