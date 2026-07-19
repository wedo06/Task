import styles from './loading.module.css';

export default function RoomLoading() {
  return (
    <div className={styles.loading}>
      <div className={styles.pulse} />
      <p>Getting your room ready...</p>
    </div>
  );
}
