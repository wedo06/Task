'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { db, doc, getDoc, collection, query, where, getDocs } from '@/lib/firebase';
import { generateMemberId, verifyPassword } from '@/lib/room-utils';
import styles from './landing-forms.module.css';

export default function JoinRoom() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [yourName, setYourName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = roomId.trim().toUpperCase();
    if (!trimmedId || !password.trim() || !yourName.trim()) {
      toast.error('Fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'rooms', trimmedId));
      if (!snap.exists()) {
        toast.error('Room not found. Check the Room ID');
        setLoading(false);
        return;
      }
      const room = snap.data();
      const valid = await verifyPassword(password.trim(), room.passwordHash);
      if (!valid) {
        toast.error('Wrong password. Try again');
        setLoading(false);
        return;
      }

      const nameKey = `taskhive_member_${yourName.trim().toLowerCase()}`;
      const existingNameEntry = localStorage.getItem(nameKey);
      
      let memberData: { id: string; name: string };
      if (existingNameEntry) {
        try {
          const parsed = JSON.parse(existingNameEntry);
          memberData = { id: parsed.id, name: yourName.trim() };
        } catch {
          memberData = { id: generateMemberId(), name: yourName.trim() };
        }
      } else {
        memberData = { id: generateMemberId(), name: yourName.trim() };
      }

      // We no longer query Firestore for the exact name and steal their ID.
      // `useMembers` handles visual deduplication for duplicate names!

      // Persist to localStorage so future rejoins are seamless
      const roomKey = `room_${trimmedId}_member`;
      localStorage.setItem(nameKey, JSON.stringify(memberData));
      localStorage.setItem(roomKey, JSON.stringify(memberData));

      toast.success(`Joining ${room.name}!`);
      router.push(`/room/${trimmedId}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleJoin}>
      <div className={styles.field}>
        <label className={styles.label}>Room ID</label>
        <input
          id="join-room-id"
          className="input-candy"
          placeholder="NEON-SQUAD-4829"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}
          required
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Password</label>
        <input
          id="join-password"
          type="password"
          className="input-candy"
          placeholder="Room password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Your Name</label>
        <input
          id="join-your-name"
          className="input-candy"
          placeholder="What should we call you?"
          value={yourName}
          onChange={(e) => setYourName(e.target.value)}
          maxLength={30}
          required
        />
      </div>
      <button
        id="join-room-submit"
        type="submit"
        className="btn btn-primary btn-lg"
        style={{ width: '100%', marginTop: 8 }}
        disabled={loading}
      >
        {loading ? <span className="spinner" /> : 'Join Room'}
      </button>
    </form>
  );
}
