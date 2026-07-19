'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Room, Member } from '@/types';
import { calcCompletion } from '@/lib/task-utils';
import { Task } from '@/types';
import styles from './RoomHeader.module.css';

interface Props {
  room: Room;
  members: Member[];
  activeView: 'board' | 'stats' | 'history';
  onViewChange: (v: 'board' | 'stats' | 'history') => void;
  onToggleSidebar: () => void;
  onCallJoin: () => void;
  inCall: boolean;
  isConnecting: boolean;
  currentMember: { id: string; name: string } | null;
}

export default function RoomHeader({
  room,
  members,
  activeView,
  onViewChange,
  onToggleSidebar,
  onCallJoin,
  inCall,
  isConnecting,
  currentMember,
}: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const onlineCount = members.filter((m) => m.isOnline).length;

  const copyRoomId = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    toast.success('Room ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveRoom = () => {
    sessionStorage.removeItem(`room_${room.id}_member`);
    router.replace('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.backBtn} onClick={leaveRoom} id="leave-room-btn" title="Leave room">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className={styles.roomInfo}>
          <h1 className={styles.roomName}>{room.name}</h1>
          <button className={styles.roomId} onClick={copyRoomId} id="copy-room-id">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {copied ? 'Copied!' : room.id}
          </button>
        </div>
      </div>

      <nav className={styles.nav}>
        {(['board', 'stats', 'history'] as const).map((view) => (
          <button
            key={view}
            id={`view-${view}`}
            className={`${styles.navBtn} ${activeView === view ? styles.navActive : ''}`}
            onClick={() => onViewChange(view)}
          >
            {view === 'board' && <BoardIcon />}
            {view === 'stats' && <StatsIcon />}
            {view === 'history' && <HistoryIcon />}
            <span>{view.charAt(0).toUpperCase() + view.slice(1)}</span>
          </button>
        ))}
      </nav>

      <div className={styles.right}>
        <div className={styles.members}>
          {members.slice(0, 4).map((m) => (
            <div
              key={m.id}
              className={`${styles.avatar} ${m.isOnline ? styles.avatarOnline : ''}`}
              title={m.name}
              style={{ background: stringToColor(m.name) }}
            >
              {m.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {members.length > 4 && (
            <div className={`${styles.avatar} ${styles.avatarMore}`}>+{members.length - 4}</div>
          )}
          <span className={styles.onlineCount}>{onlineCount} online</span>
        </div>

        <button
          id="call-btn"
          className={`btn ${inCall ? 'btn-danger' : 'btn-ghost'} btn-sm ${styles.callBtn}`}
          onClick={onCallJoin}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <span className="spinner" style={{ width: 14, height: 14 }} />
          ) : (
            <VideoIcon />
          )}
          {inCall ? 'In Call' : 'Call'}
        </button>

        <button
          id="sidebar-toggle"
          className={`btn btn-ghost btn-icon ${styles.sidebarBtn}`}
          onClick={onToggleSidebar}
          title="Toggle sidebar"
        >
          <SidebarIcon />
        </button>
      </div>
    </header>
  );
}

function stringToColor(str: string): string {
  const colors = ['#ff2d78', '#00e5ff', '#00b4ff', '#00e5a0', '#f5e642', '#ff6b35'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const BoardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const StatsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.68v6.64a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
  </svg>
);
const SidebarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/>
  </svg>
);
