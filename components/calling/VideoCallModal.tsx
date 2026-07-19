'use client';
import { useEffect, useRef, useState } from 'react';
import { RemoteUser } from '@/hooks/useVideoCall';
import VideoTile from './VideoTile';
import CallControls from './CallControls';
import styles from './VideoCallModal.module.css';

interface Props {
  localVideoTrack: any;
  remoteUsers: RemoteUser[];
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onLeave: () => void;
  currentMemberName: string;
  members: any[];
  roomId: string;
  currentMemberId: string;
}

export default function VideoCallModal({
  localVideoTrack,
  remoteUsers,
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onLeave,
  currentMemberName,
  members,
  roomId,
  currentMemberId,
}: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalParticipants = 1 + remoteUsers.length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className={styles.overlay} ref={containerRef}>
      <div className={`${styles.callWindow} ${isFullscreen ? styles.fullscreenWindow : ''}`}>
        <div className={styles.header}>
          <div className={styles.callTitle}>
            <div className={styles.liveDot} />
            Live Call
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={styles.participantCount}>{totalParticipants} in call</span>
            
            <div style={{ position: 'relative' }}>
              <button 
                className={styles.fullscreenBtn} 
                onClick={() => setShowInvite(!showInvite)} 
                title="Ring Members"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </button>
              {showInvite && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', borderRadius: '12px', padding: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', padding: '0 4px' }}>Ring someone:</div>
                  {members.filter(m => m.id !== currentMemberId).length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px' }}>No one else here.</div>
                  ) : (
                    members.filter(m => m.id !== currentMemberId).map(m => (
                      <button 
                        key={m.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px' }}
                        onClick={async () => {
                          const { ringMember } = await import('@/hooks/useMembers');
                          ringMember(roomId, m.id, currentMemberName);
                          setShowInvite(false);
                        }}
                      >
                        {m.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button className={styles.fullscreenBtn} onClick={toggleFullscreen} title="Toggle Fullscreen">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
                {isFullscreen ? (
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                ) : (
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className={`${styles.grid} ${styles[`grid_${Math.min(totalParticipants, 4)}`]}`}>
          {/* Local tile */}
          <VideoTile
            videoTrack={localVideoTrack}
            name={currentMemberName + ' (You)'}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isLocal
          />
          {/* Remote tiles */}
          {remoteUsers.map((user) => (
            <VideoTile
              key={user.uid}
              videoTrack={user.videoTrack}
              audioTrack={user.audioTrack}
              name={`User ${user.uid}`}
              isMuted={false}
              isCameraOff={!user.videoTrack}
            />
          ))}
        </div>

        <CallControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMute={onToggleMute}
          onToggleCamera={onToggleCamera}
          onLeave={onLeave}
        />
      </div>
    </div>
  );
}
