'use client';
import styles from './CallControls.module.css';

interface Props {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onLeave: () => void;
}

export default function CallControls({ isMuted, isCameraOff, onToggleMute, onToggleCamera, onLeave }: Props) {
  return (
    <div className={styles.controls}>
      <button
        id="call-toggle-mute"
        className={`${styles.btn} ${isMuted ? styles.btnOff : ''}`}
        onClick={onToggleMute}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <MutedMicIcon /> : <MicIcon />}
        <span>{isMuted ? 'Unmute' : 'Mute'}</span>
      </button>

      <button
        id="call-toggle-camera"
        className={`${styles.btn} ${isCameraOff ? styles.btnOff : ''}`}
        onClick={onToggleCamera}
        title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {isCameraOff ? <CameraOffIcon /> : <CameraIcon />}
        <span>{isCameraOff ? 'Show' : 'Hide'}</span>
      </button>

      <button
        id="call-leave"
        className={`${styles.btn} ${styles.btnLeave}`}
        onClick={onLeave}
        title="Leave call"
      >
        <PhoneIcon />
        <span>Leave</span>
      </button>
    </div>
  );
}

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
    <path d="M19 10v2a7 7 0 01-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const MutedMicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/>
    <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
    <path d="M15 10l4.553-2.276A1 1 0 0121 8.68v6.64a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
  </svg>
);
const CameraOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
    <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
    <path d="M22.54 16.88l-3-3a2 2 0 00-2.83 0l-1.41 1.41a14.18 14.18 0 01-6.59-6.59l1.41-1.41a2 2 0 000-2.83l-3-3A2 2 0 004.29 3L2.88 4.41A4 4 0 002 7c0 8.28 6.72 15 15 15a4 4 0 002.59-.88L21 19.71a2 2 0 001.54-2.83z"/>
  </svg>
);
