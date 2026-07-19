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

      <div className={styles.features}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.feature}>
            <div className={styles.featureIcon} style={{ background: f.bg }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ color: f.color }}>
                <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
              </svg>
            </div>
            <div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureSub}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const FEATURES = [
  {
    title: 'Live Sync',
    desc: 'Changes show up instantly for everyone',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: '#e09a38',
    bg: 'rgba(255,196,147,0.3)',
  },
  {
    title: 'Video Calls',
    desc: 'Jump on a call without leaving the room',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.68v6.64a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    color: '#3a9ab8',
    bg: 'rgba(146,209,223,0.3)',
  },
  {
    title: 'AI Insights',
    desc: 'Daily smart stats powered by GPT',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    color: '#7b5ea7',
    bg: 'rgba(209,197,255,0.35)',
  },
  {
    title: 'Carry-over',
    desc: 'Unfinished tasks auto-roll to tomorrow',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    color: '#4a8c48',
    bg: 'rgba(208,244,167,0.4)',
  },
];
