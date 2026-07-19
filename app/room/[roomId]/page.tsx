'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoom } from '@/hooks/useRoom';
import { useTasks } from '@/hooks/useTasks';
import { useMembers, joinRoom, updateMemberPresence } from '@/hooks/useMembers';
import { useVideoCall } from '@/hooks/useVideoCall';
import RoomHeader from '@/components/room/RoomHeader';
import TaskBoard from '@/components/room/TaskBoard';
import MembersSidebar from '@/components/room/MembersSidebar';
import StatsPanel from '@/components/room/StatsPanel';
import DailyHistory from '@/components/room/DailyHistory';
import VideoCallModal from '@/components/calling/VideoCallModal';
import CallErrorModal from '@/components/calling/CallErrorModal';
import { carryOverTasks } from '@/lib/task-utils';
import { getTodayDate } from '@/lib/room-utils';
import toast from 'react-hot-toast';
import styles from './room.module.css';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [currentMember, setCurrentMember] = useState<{ id: string; name: string } | null>(null);
  const [activeView, setActiveView] = useState<'board' | 'stats' | 'history'>('board');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [carryDone, setCarryDone] = useState(false);
  const [lastRingTime, setLastRingTime] = useState(0);

  const { room, loading: roomLoading, error: roomError } = useRoom(roomId);
  const { tasks, loading: tasksLoading } = useTasks(roomId);
  const members = useMembers(roomId);
  const videoCall = useVideoCall(roomId, currentMember?.id || '', currentMember?.name || '');

  useEffect(() => {
    if (!currentMember || !members) return;
    const me = members.find(m => m.id === currentMember.id);
    if (me?.incomingCall) {
      const ring = me.incomingCall;
      // Only ring if it's within the last 30 seconds and we haven't rung for this timestamp yet
      if (Date.now() - ring.timestamp < 30000 && ring.timestamp > lastRingTime) {
        toast((t) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-display)' }}>
            <span style={{ fontWeight: '800' }}>📞 {ring.fromName} is inviting you to a call!</span>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                 toast.dismiss(t.id);
                 videoCall.joinCall();
              }}
            >
              Join Call
            </button>
          </div>
        ), { duration: 15000, position: 'top-right' });
        setLastRingTime(ring.timestamp);
      }
    }
  }, [members, currentMember, lastRingTime, videoCall]);

  // Load member from storage (localStorage persists across sessions — same ID on rejoin)
  useEffect(() => {
    const stored = localStorage.getItem(`room_${roomId}_member`);
    if (!stored) {
      router.replace('/');
      return;
    }
    const member = JSON.parse(stored);
    setCurrentMember(member);

    // Register / update member presence in Firestore
    joinRoom(roomId, {
      id: member.id,
      name: member.name,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
      isOnline: true,
    });

    // Heartbeat every 20s
    const interval = setInterval(() => {
      updateMemberPresence(roomId, member.id, true);
    }, 20000);

    return () => clearInterval(interval);
  }, [roomId, router]);

  // Carry over incomplete tasks from yesterday
  useEffect(() => {
    if (!roomId || carryDone || tasksLoading) return;
    // Only carry over if we haven't done it yet today
    const key = `carryover_${roomId}_${getTodayDate()}`;
    if (sessionStorage.getItem(key)) { setCarryDone(true); return; }
    carryOverTasks(roomId, currentMember?.name || '').then(() => {
      sessionStorage.setItem(key, '1');
      setCarryDone(true);
    }).catch(console.error);
  }, [roomId, tasksLoading, carryDone, currentMember]);

  if (roomLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <p>Loading room...</p>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className={styles.errorScreen}>
        <h2>Room not found</h2>
        <button className="btn btn-primary" onClick={() => router.replace('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div className={styles.roomLayout}>
      <RoomHeader
        room={room}
        members={members}
        activeView={activeView}
        onViewChange={setActiveView}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onCallJoin={videoCall.joinCall}
        inCall={videoCall.inCall}
        isConnecting={videoCall.isConnecting}
        currentMember={currentMember}
      />

      <div className={styles.roomBody}>
        <main className={`${styles.mainContent} ${!sidebarOpen ? styles.mainFull : ''}`}>
          {activeView === 'board' && (
            <TaskBoard
              roomId={roomId}
              tasks={tasks}
              members={members}
              currentMember={currentMember}
              loading={tasksLoading}
            />
          )}
          {activeView === 'stats' && (
            <StatsPanel tasks={tasks} members={members} roomName={room.name} />
          )}
          {activeView === 'history' && (
            <DailyHistory roomId={roomId} />
          )}
        </main>

        {sidebarOpen && (
          <aside className={styles.sidebar}>
            <MembersSidebar 
              roomId={roomId}
              members={members} 
              tasks={tasks} 
              currentMemberId={currentMember?.id} 
              currentMemberName={currentMember?.name}
            />
          </aside>
        )}
      </div>

      {videoCall.inCall && (
        <VideoCallModal
          localVideoTrack={videoCall.localVideoTrack}
          remoteUsers={videoCall.remoteUsers}
          isMuted={videoCall.isMuted}
          isCameraOff={videoCall.isCameraOff}
          onToggleMute={videoCall.toggleMute}
          onToggleCamera={videoCall.toggleCamera}
          onLeave={videoCall.leaveCall}
          currentMemberName={currentMember?.name || ''}
        />
      )}

      {videoCall.callError && (
        <CallErrorModal
          error={videoCall.callError}
          onDismiss={videoCall.dismissError}
        />
      )}
    </div>
  );
}
