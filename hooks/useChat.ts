'use client';
import { useState, useEffect } from 'react';
import { db, collection, addDoc, onSnapshot, query, orderBy, limit, doc, setDoc, updateDoc } from '@/lib/firebase';
import { ChatMessage, ChatChannel } from '@/types';

export function useChat(roomId: string, channelId: string, currentMemberId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load Channels
  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(collection(db, 'rooms', roomId, 'channels'), (snap) => {
      const items: ChatChannel[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as ChatChannel));
      
      // If no channels exist, create #general
      if (items.length === 0) {
        setDoc(doc(db, 'rooms', roomId, 'channels', 'general'), {
          name: 'general',
          createdAt: Date.now()
        });
      } else {
        // Filter channels to only public ones OR ones where user is allowed
        const visibleChannels = items.filter(c => 
          !c.allowedMembers || c.allowedMembers.length === 0 || (currentMemberId && c.allowedMembers.includes(currentMemberId)) || c.adminId === currentMemberId
        );
        setChannels(visibleChannels.sort((a, b) => a.createdAt - b.createdAt));
      }
    });
    return () => unsub();
  }, [roomId, currentMemberId]);

  // Load Messages for current channel
  useEffect(() => {
    if (!roomId || !channelId) return;
    
    setLoading(true);
    const q = query(
      collection(db, 'rooms', roomId, 'channels', channelId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = [];
      snap.forEach((d) => msgs.push({ id: d.id, ...d.data() } as ChatMessage));
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsub();
  }, [roomId, channelId]);

  // Track unread overall in room (simple approach: count messages in last 5 mins not from me)
  useEffect(() => {
    if (!roomId || !currentMemberId || messages.length === 0) return;
    // For now, if the last message in current channel is not from me and within last 10 seconds:
  }, [messages, currentMemberId]);

  const sendMessage = async (memberId: string, memberName: string, text: string) => {
    if (!text.trim() || !channelId) return;
    try {
      await addDoc(collection(db, 'rooms', roomId, 'channels', channelId, 'messages'), {
        memberId,
        memberName,
        text: text.trim(),
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const createChannel = async (name: string, allowedMembers?: string[]) => {
    try {
      const newRef = doc(collection(db, 'rooms', roomId, 'channels'));
      await setDoc(newRef, { 
        name: name.toLowerCase().replace(/\s+/g, '-'), 
        createdAt: Date.now(),
        adminId: currentMemberId,
        ...(allowedMembers && allowedMembers.length > 0 ? { allowedMembers: [...allowedMembers, currentMemberId] } : {})
      });
      return newRef.id;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const renameChannel = async (id: string, newName: string) => {
    try {
      await updateDoc(doc(db, 'rooms', roomId, 'channels', id), {
        name: newName.toLowerCase().replace(/\s+/g, '-')
      });
    } catch (err) {
      console.error(err);
    }
  };

  return { messages, channels, loading, sendMessage, createChannel, renameChannel };
}
