'use client';
import { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, where } from '@/lib/firebase';
import { Task } from '@/types';
import { getTodayDate } from '@/lib/room-utils';

export function useTasks(roomId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const today = getTodayDate();

  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, 'rooms', roomId, 'tasks'),
      where('date', '==', today)
    );
    const unsub = onSnapshot(q, (snap) => {
      const items: Task[] = [];
      snap.forEach((d) => items.push(d.data() as Task));
      // Sort client-side to avoid needing a composite Firestore index
      items.sort((a, b) => a.createdAt - b.createdAt);
      setTasks(items);
      setLoading(false);
    }, (err) => {
      console.error('useTasks error:', err);
      setLoading(false);
    });
    return () => unsub();
  }, [roomId, today]);

  return { tasks, loading };
}

export function useHistoryTasks(roomId: string, date: string) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!roomId || !date) return;
    const q = query(
      collection(db, 'rooms', roomId, 'tasks'),
      where('date', '==', date)
    );
    const unsub = onSnapshot(q, (snap) => {
      const items: Task[] = [];
      snap.forEach((d) => items.push(d.data() as Task));
      items.sort((a, b) => a.createdAt - b.createdAt);
      setTasks(items);
    });
    return () => unsub();
  }, [roomId, date]);

  return tasks;
}
