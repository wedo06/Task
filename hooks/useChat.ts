'use client';
import { useState, useEffect } from 'react';
import { db, collection, addDoc, onSnapshot, query, orderBy, limit } from '@/lib/firebase';
import { ChatMessage } from '@/types';

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    
    // We get the last 100 messages ordered by timestamp
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = [];
      snap.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsub();
  }, [roomId]);

  const sendMessage = async (memberId: string, memberName: string, text: string) => {
    if (!text.trim()) return;
    try {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        memberId,
        memberName,
        text: text.trim(),
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return { messages, loading, sendMessage };
}
