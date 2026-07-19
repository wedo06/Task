'use client';
import { useState } from 'react';
import { Member, Task } from '@/types';
import { calcCompletion } from '@/lib/task-utils';
import { ChatPanel } from './ChatPanel';
import styles from './MembersSidebar.module.css';

interface Props {
  roomId: string;
  members: Member[];
  tasks: Task[];
  currentMemberId: string;
  currentMemberName: string;
  roomAdminId?: string;
}

// Pastel candy colors for avatars
const AVATAR_COLORS = [
  '#FFB7D5', // pink poppy
  '#92D1DF', // blue bloom
  '#D0F4A7', // cool mint
  '#FFC493', // orange cream
  '#D1C5FF', // purple pastel
  '#FEFEC3', // banana popsicle
];

const AVATAR_TEXT_COLORS = ['#c94070', '#3a9ab8', '#4a8c48', '#a06020', '#7b5ea7', '#8a8020'];

function stringToIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % AVATAR_COLORS.length;
}

export default function MembersSidebar({ roomId, members, tasks, currentMemberId, currentMemberName, roomAdminId }: Props) {
  const [activeTab, setActiveTab] = useState<'squad' | 'chat'>('squad');
  const [hasUnread, setHasUnread] = useState(false);
  const getMemberTasks = (name: string) => tasks.filter((t) => t.assignee === name);

  return (
    <div className={styles.sidebar}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'squad' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('squad')}
        >
          Squad
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'chat' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('chat')}
          style={{ position: 'relative' }}
        >
          Chat
          {hasUnread && activeTab !== 'chat' && (
            <div style={{ position: 'absolute', top: '6px', right: '12px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-red)' }} />
          )}
        </button>
      </div>

      <div style={{ display: activeTab === 'squad' ? 'block' : 'none' }}>
        <>
          <div className={styles.heading}>
            {members.filter(m => m.isOnline).length} online
          </div>

          {members.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, padding: '20px 0' }}>
              Nobody else here yet
            </p>
          )}

      <div className={styles.memberList}>
        {members.map((member) => {
          const memberTasks = getMemberTasks(member.name);
          const pct = calcCompletion(memberTasks);
          const isMe = member.id === currentMemberId;
          const idx = stringToIndex(member.name);

          return (
            <div
              key={member.id}
              className={`${styles.member} ${isMe ? styles.memberYou : ''}`}
            >
              <div className={styles.memberAvatar} style={{
                background: AVATAR_COLORS[idx],
                color: AVATAR_TEXT_COLORS[idx],
              }}>
                {member.name.charAt(0).toUpperCase()}
              </div>

              <div className={styles.memberInfo}>
                <div className={styles.memberName}>
                  {member.name}
                  {isMe && <span style={{
                    fontSize: 9,
                    fontWeight: 800,
                    background: 'rgba(209,197,255,0.5)',
                    color: '#7b5ea7',
                    padding: '1px 6px',
                    borderRadius: 999,
                    marginLeft: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}>you</span>}
                </div>
                <div className={styles.memberSubtext}>
                  {member.isOnline ? 'Active now' : 'Offline'}
                  {memberTasks.length > 0 && ` · ${memberTasks.filter(t => t.status === 'done').length}/${memberTasks.length} tasks`}
                </div>
                {memberTasks.length > 0 && (
                  <div className={`${styles.memberProgress} progress-track`} style={{ marginTop: 6 }}>
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>

              <div className={styles.onlineDot} style={{
                background: member.isOnline ? '#6cb86a' : 'rgba(0,0,0,0.12)',
                boxShadow: member.isOnline ? '0 0 0 3px rgba(108,184,106,0.2)' : 'none',
              }} />
            </div>
          );
        })}
      </div>

      {/* Daily summary */}
      {tasks.length > 0 && (
        <div style={{
          marginTop: 4,
          padding: '14px 12px',
          background: 'rgba(208,244,167,0.15)',
          border: '1.5px solid rgba(208,244,167,0.4)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#4a8c48', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            Today's Progress
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>
              {tasks.filter(t => t.status === 'done').length}/{tasks.length} complete
            </span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#4a8c48' }}>
              {calcCompletion(tasks)}%
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${calcCompletion(tasks)}%` }} />
          </div>
          </div>
        )}
      </>
      </div>

      <div style={{ display: activeTab === 'chat' ? 'flex' : 'none', flex: 1, flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <ChatPanel 
          roomId={roomId} 
          currentMemberId={currentMemberId || ''} 
          currentMemberName={currentMemberName || ''}
          members={members}
          onUnreadChange={(hasUnread) => setHasUnread(hasUnread)}
          isActive={activeTab === 'chat'}
          roomAdminId={roomAdminId}
        />
      </div>
    </div>
  );
}
