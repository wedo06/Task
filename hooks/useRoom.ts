'use client';
import { useState, useEffect } from 'react';
import { db, doc, getDoc, setDoc, onSnapshot } from '@/lib/firebase';
import { Room } from '@/types';

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
      if (snap.exists()) {
        setRoom(snap.data() as Room);
      } else {
        setError('Room not found');
      }
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });
    return () => unsub();
  }, [roomId]);

  return { room, loading, error };
}
