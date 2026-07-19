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
      const seenNames = new Set<string>();

      // Sort by joinedAt first so the oldest profile takes precedence
      const docs = snap.docs.map(d => d.data() as Member).sort((a, b) => a.joinedAt - b.joinedAt);

      for (const d of docs) {
        const lowerName = d.name.toLowerCase().trim();
        if (!seenNames.has(lowerName)) {
          seenNames.add(lowerName);
          items.push(d);
        } else if (d.isOnline) {
          // If a newer duplicate is online but the older isn't, we should update the older one's online status
          const existing = items.find(i => i.name.toLowerCase().trim() === lowerName);
          if (existing) existing.isOnline = true;
        }
      }
      
      setMembers(items);
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

export async function setCallPresence(roomId: string, memberId: string, inCall: boolean) {
  try {
    await updateDoc(doc(db, 'rooms', roomId, 'members', memberId), {
      inCall,
    });
  } catch {
    // ignore
  }
}

export async function ringMember(roomId: string, memberId: string, fromName: string) {
  try {
    await updateDoc(doc(db, 'rooms', roomId, 'members', memberId), {
      incomingCall: { fromName, timestamp: Date.now() },
    });
  } catch {
    // ignore
  }
}
