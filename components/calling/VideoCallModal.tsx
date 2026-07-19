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
}: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
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
      <div className={styles.callWindow}>
        <div className={styles.header}>
          <div className={styles.callTitle}>
            <div className={styles.liveDot} />
            Live Call
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={styles.participantCount}>{totalParticipants} in call</span>
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
