'use client';
import { useState, useEffect } from 'react';
import { db, collection, doc, setDoc, updateDoc, onSnapshot } from '@/lib/firebase';
import { Member } from '@/types';

export function useMembers(roomId: string) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(collection(db, 'rooms', roomId, 'members'), (snap) => {
      const items: Member[] = [];
      snap.forEach((d) => items.push(d.data() as Member));
      setMembers(items.sort((a, b) => a.joinedAt - b.joinedAt));
    });
    return () => unsub();
  }, [roomId]);

  return members;
}

export async function joinRoom(roomId: string, member: Member) {
  // Use merge: true so returning members don't lose their original joinedAt timestamp
  await setDoc(
    doc(db, 'rooms', roomId, 'members', member.id),
    {
      ...member,
      isOnline: true,
      lastSeen: Date.now(),
    },
    { merge: true }
  );
}

export async function updateMemberPresence(roomId: string, memberId: string, isOnline: boolean) {
  try {
    await updateDoc(doc(db, 'rooms', roomId, 'members', memberId), {
      isOnline,
      lastSeen: Date.now(),
    });
  } catch {
    // member may not exist yet — ignore
  }
}
