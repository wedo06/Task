'use client';
import { CallError } from '@/hooks/useVideoCall';
import styles from './CallErrorModal.module.css';

interface Props {
  error: CallError;
  onDismiss: () => void;
}

export default function CallErrorModal({ error, onDismiss }: Props) {
  if (!error) return null;

  const isCertError = error === 'agora_certificate';
  const isNoAppId = error === 'no_app_id';

  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>{isNoAppId ? '🎥' : '🔑'}</div>
        <h3 className={styles.title}>
          {isNoAppId ? 'Video Calls Need Setup' : 'Agora Certificate Issue'}
        </h3>

        {isNoAppId && (
          <>
            <p className={styles.desc}>
              Video calling uses Agora. You need a free App ID to enable it.
            </p>
            <div className={styles.steps}>
              <div className={styles.step}>
                <span className={styles.stepNum}>1</span>
                <span>Go to <a href="https://console.agora.io" target="_blank" rel="noreferrer" className={styles.link}>console.agora.io</a> and sign up free</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>2</span>
                <span>Create a project — choose <strong>Testing</strong> mode (no certificate)</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>3</span>
                <span>Copy the <strong>App ID</strong> and add it to <code>.env.local</code>:</span>
              </div>
            </div>
            <div className={styles.codeBlock}>
              NEXT_PUBLIC_AGORA_APP_ID=your-app-id-here
            </div>
            <p className={styles.hint}>Then restart the dev server and calls will work!</p>
          </>
        )}

        {isCertError && (
          <>
            <p className={styles.desc}>
              Your Agora project has <strong>App Certificate enabled</strong>, which requires a token. Switch to Testing mode to use it without a token.
            </p>
            <div className={styles.steps}>
              <div className={styles.step}>
                <span className={styles.stepNum}>1</span>
                <span>Go to <a href="https://console.agora.io" target="_blank" rel="noreferrer" className={styles.link}>console.agora.io</a></span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>2</span>
                <span>Open your project settings</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>3</span>
                <span>Under <strong>Security</strong>, disable the App Certificate or set Authentication to <strong>Testing</strong></span>
              </div>
            </div>
            <p className={styles.hint}>Or create a new project in Testing mode — it will work instantly.</p>
          </>
        )}

        <button className={styles.dismissBtn} onClick={onDismiss} id="call-error-dismiss">
          Got it
        </button>
      </div>
    </div>
  );
}
