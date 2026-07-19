'use client';
import { useEffect, useRef } from 'react';
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
  const totalParticipants = 1 + remoteUsers.length;

  return (
    <div className={styles.overlay}>
      <div className={styles.callWindow}>
        <div className={styles.header}>
          <div className={styles.callTitle}>
            <div className={styles.liveDot} />
            Live Call
          </div>
          <span className={styles.participantCount}>{totalParticipants} in call</span>
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
