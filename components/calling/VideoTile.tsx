'use client';
import { useEffect, useRef } from 'react';
import styles from './VideoTile.module.css';

interface Props {
  videoTrack?: any;
  audioTrack?: any;
  name: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isLocal?: boolean;
}

export default function VideoTile({ videoTrack, name, isMuted, isCameraOff, isLocal }: Props) {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoTrack && videoRef.current && !isCameraOff) {
      videoTrack.play(videoRef.current);
      return () => {
        videoTrack.stop();
      };
    }
  }, [videoTrack, isCameraOff]);

  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={`${styles.tile} ${isLocal ? styles.tileLocal : ''}`}>
      {isCameraOff || !videoTrack ? (
        <div className={styles.avatar}>
          <span className={styles.initials}>{initials}</span>
        </div>
      ) : (
        <div ref={videoRef} className={styles.video} />
      )}
      <div className={styles.nameTag}>
        {isMuted && (
          <span className={styles.muteIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={12} height={12}>
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/>
              <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8"/>
            </svg>
          </span>
        )}
        <span>{name}</span>
      </div>
    </div>
  );
}
