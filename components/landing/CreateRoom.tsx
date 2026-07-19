'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { db, doc, setDoc } from '@/lib/firebase';
import { generateRoomId, generateMemberId, hashPassword } from '@/lib/room-utils';
import styles from './landing-forms.module.css';

interface Props {
  onSwitch: () => void;
}

export default function CreateRoom({ onSwitch }: Props) {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [yourName, setYourName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !password.trim() || !yourName.trim()) {
      toast.error('Fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const roomId = generateRoomId();
      const passwordHash = await hashPassword(password.trim());

      // Reuse existing persistent member ID for this name, or create a new one
      const storageKey = `taskhive_member_${yourName.trim().toLowerCase()}`;
      const existing = localStorage.getItem(storageKey);
      const memberId = existing ? JSON.parse(existing).id : generateMemberId();

      // Create room in Firestore
      await setDoc(doc(db, 'rooms', roomId), {
        id: roomId,
        name: roomName.trim(),
        passwordHash,
        createdAt: Date.now(),
        createdBy: yourName.trim(),
        adminId: memberId,
      });

      // Persist identity in localStorage so returning users keep the same ID
      const memberData = { id: memberId, name: yourName.trim() };
      localStorage.setItem(storageKey, JSON.stringify(memberData));
      localStorage.setItem(`room_${roomId}_member`, JSON.stringify(memberData));

      toast.success(`Room "${roomId}" created!`);
      router.push(`/room/${roomId}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleCreate}>
      <div className={styles.field}>
        <label className={styles.label}>Room Name</label>
        <input
          id="create-room-name"
          className="input-candy"
          placeholder="The Dream Team"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          maxLength={40}
          required
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Room Password</label>
        <input
          id="create-room-password"
          type="password"
          className="input-candy"
          placeholder="Set a secret password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span className={styles.hint}>Share this with your squad to let them in</span>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Your Name</label>
        <input
          id="create-your-name"
          className="input-candy"
          placeholder="What should we call you?"
          value={yourName}
          onChange={(e) => setYourName(e.target.value)}
          maxLength={30}
          required
        />
      </div>
      <button
        id="create-room-submit"
        type="submit"
        className="btn btn-primary btn-lg"
        style={{ width: '100%', marginTop: 8 }}
        disabled={loading}
      >
        {loading ? <span className="spinner" /> : 'Create Room'}
      </button>
      <p className={styles.switch}>
        Already have a Room ID?{' '}
        <button type="button" className={styles.switchLink} onClick={onSwitch}>
          Join instead
        </button>
      </p>
    </form>
  );
}
