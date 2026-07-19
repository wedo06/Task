'use client';
import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AGORA_APP_ID } from '@/lib/agora';
import { setCallPresence } from '@/hooks/useMembers';

export interface RemoteUser {
  uid: string | number;
  videoTrack?: any;
  audioTrack?: any;
}

export type CallError = 'no_app_id' | 'agora_certificate' | 'agora_network' | 'agora_permissions' | null;

async function fetchAgoraToken(channelName: string, uid: number): Promise<string | null> {
  try {
    const res = await fetch('/api/agora-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName, uid }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.token ?? null;
  } catch {
    return null;
  }
}

export function useVideoCall(roomId: string, userId: string, userName: string) {
  const [inCall, setInCall] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callError, setCallError] = useState<CallError>(null);
  const clientRef = useRef<any>(null);

  // Stable numeric UID derived from userId string
  const numericUid = useRef<number>(
    Math.abs(userId.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0)) % 100000
  );

  const joinCall = useCallback(async () => {
    setCallError(null);

    if (!AGORA_APP_ID || AGORA_APP_ID === 'your-agora-app-id-here') {
      setCallError('no_app_id');
      return;
    }

    setIsConnecting(true);
    try {
      const { AgoraRTC, client } = await (await import('@/lib/agora')).createAgoraClient();
      clientRef.current = client;

      client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
        await client.subscribe(user, mediaType);
        setRemoteUsers((prev) => {
          const exists = prev.find((u) => u.uid === user.uid);
          if (exists) {
            return prev.map((u) =>
              u.uid === user.uid
                ? {
                    ...u,
                    videoTrack: mediaType === 'video' ? user.videoTrack : u.videoTrack,
                    audioTrack: mediaType === 'audio' ? user.audioTrack : u.audioTrack,
                  }
                : u
            );
          }
          return [
            ...prev,
            {
              uid: user.uid,
              videoTrack: mediaType === 'video' ? user.videoTrack : undefined,
              audioTrack: mediaType === 'audio' ? user.audioTrack : undefined,
            },
          ];
        });
        if (mediaType === 'audio') user.audioTrack?.play();
      });

      client.on('user-unpublished', (user: any) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      client.on('user-left', (user: any) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      const uid = numericUid.current;

      // Try to get a server-generated token (required when App Certificate is enabled)
      const token = await fetchAgoraToken(roomId, uid);

      // Join with token (or null for projects without a certificate)
      await client.join(AGORA_APP_ID, roomId, token, uid);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {},
        {
          encoderConfig: {
            width: 480,
            height: 360,
            frameRate: 15,
            bitrateMin: 200,
            bitrateMax: 400,
          },
        }
      );
      await client.publish([audioTrack, videoTrack]);

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);
      setIsConnecting(false);
      setInCall(true);
      setCallPresence(roomId, userId, true);
    } catch (err: any) {
      console.error('Failed to join call:', err);
      if (
        err?.code === 'CAN_NOT_GET_GATEWAY_SERVER' ||
        err?.message?.includes('dynamic use static key') ||
        err?.message?.includes('static key')
      ) {
        setCallError('agora_certificate');
      } else {
        setCallError('agora_network');
        toast.error(err?.message || 'Could not join call');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [roomId, userId]);

  const leaveCall = useCallback(async () => {
    if (localAudioTrack) { localAudioTrack.stop(); localAudioTrack.close(); }
    if (localVideoTrack) { localVideoTrack.stop(); localVideoTrack.close(); }
    if (clientRef.current) await clientRef.current.leave();

    setInCall(false);
    setLocalVideoTrack(null);
    setLocalAudioTrack(null);
    setRemoteUsers([]);
    setIsMuted(false);
    setIsCameraOff(false);
    setCallPresence(roomId, userId, false);
  }, [roomId, userId, localAudioTrack, localVideoTrack]);

  const toggleMute = useCallback(() => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  }, [localAudioTrack, isMuted]);

  const toggleCamera = useCallback(() => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(isCameraOff);
      setIsCameraOff(!isCameraOff);
    }
  }, [localVideoTrack, isCameraOff]);

  const dismissError = useCallback(() => setCallError(null), []);

  return {
    inCall,
    isConnecting,
    localVideoTrack,
    remoteUsers,
    isMuted,
    isCameraOff,
    callError,
    joinCall,
    leaveCall,
    toggleMute,
    toggleCamera,
    dismissError,
  };
}
