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
import styles from './room.module.css';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [currentMember, setCurrentMember] = useState<{ id: string; name: string } | null>(null);
  const [activeView, setActiveView] = useState<'board' | 'stats' | 'history'>('board');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [carryDone, setCarryDone] = useState(false);

  const { room, loading: roomLoading, error: roomError } = useRoom(roomId);
  const { tasks, loading: tasksLoading } = useTasks(roomId);
  const members = useMembers(roomId);
  const videoCall = useVideoCall(roomId, currentMember?.id || '', currentMember?.name || '');

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

    // Heartbeat every 30s
    const interval = setInterval(() => {
      updateMemberPresence(roomId, member.id, true);
    }, 30000);

    // Set offline on close
    const handleUnload = () => updateMemberPresence(roomId, member.id, false);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      updateMemberPresence(roomId, member.id, false);
    };
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
            <MembersSidebar members={members} tasks={tasks} currentMemberId={currentMember?.id} />
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
