'use client';
import { useState } from 'react';
import CreateRoom from '@/components/landing/CreateRoom';
import JoinRoom from '@/components/landing/JoinRoom';
import styles from './landing.module.css';

export default function HomePage() {
  const [tab, setTab] = useState<'join' | 'create'>('join');

  return (
    <main className={styles.landing}>
      <div className={styles.hero}>
        <div className={styles.logoMark}>
          <div className={styles.logoHex} />
          <span className={styles.logoText}>TH</span>
        </div>
        <h1 className={styles.title}>
          Task<span className="grad-text">Hive</span>
        </h1>
        <p className={styles.sub}>
          Real-time collab for your squad. Track tasks, smash goals, build together.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'join' ? styles.tabActive : ''}`}
            onClick={() => setTab('join')}
            id="tab-join"
          >
            Join Room
          </button>
          <button
            className={`${styles.tab} ${tab === 'create' ? styles.tabActive : ''}`}
            onClick={() => setTab('create')}
            id="tab-create"
          >
            Create Room
          </button>
          <div
            className={styles.tabIndicator}
            style={{ left: tab === 'join' ? '4px' : '50%' }}
          />
        </div>

        <div className={styles.tabContent}>
          {tab === 'join' ? <JoinRoom /> : <CreateRoom onSwitch={() => setTab('join')} />}
        </div>
      </div>
    </main>
  );
}

