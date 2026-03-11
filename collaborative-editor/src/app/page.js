'use client';

import { useRouter } from 'next/navigation';
import { 
  FileCode2, 
  TerminalSquare, 
  Braces, 
  Coffee, 
  Boxes 
} from 'lucide-react';
import LanguageCard from '@/components/LanguageCard';
import styles from './page.module.css';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: Braces },
  { id: 'python', name: 'Python', icon: TerminalSquare },
  { id: 'cpp', name: 'C++', icon: FileCode2 },
  { id: 'java', name: 'Java', icon: Coffee },
  { id: 'go', name: 'Go', icon: Boxes },
];

export default function Home() {
  const router = useRouter();

  const handleSelectLanguage = (langId) => {
    router.push(`/editor?lang=${langId}`);
  };

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create a Coding Session</h1>
          <p className={styles.subtitle}>
            Select a language below. Your environment will be prepared instantly.
          </p>
        </div>

        <div className={styles.grid}>
          {LANGUAGES.map((lang) => (
            <LanguageCard
              key={lang.id}
              name={lang.name}
              icon={lang.icon}
              onClick={() => handleSelectLanguage(lang.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
