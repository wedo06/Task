'use client';
import { useState } from 'react';
import { Task, Member } from '@/types';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import { updateTask, deleteTask } from '@/lib/task-utils';
import styles from './TaskBoard.module.css';

interface Props {
  roomId: string;
  tasks: Task[];
  members: Member[];
  currentMember: { id: string; name: string } | null;
  loading: boolean;
}

const COLUMNS: {
  key: Task['status'];
  label: string;
  vibe: string;   // funky sub-label
  dot: string;
  accent: string; // column header bg tint
  emptyMsg: string;
}[] = [
  {
    key: 'todo',
    label: 'Queued',
    vibe: 'ready to go',
    dot: '#9090aa',
    accent: 'rgba(144,144,170,0.08)',
    emptyMsg: 'All clear — drop a task here',
  },
  {
    key: 'in-progress',
    label: 'Cookin',
    vibe: 'in the zone',
    dot: '#e0b800',
    accent: 'rgba(254,253,198,0.5)',
    emptyMsg: 'Nothing cooking yet',
  },
  {
    key: 'done',
    label: 'Shipped',
    vibe: 'absolutely crushed it',
    dot: '#6cb86a',
    accent: 'rgba(208,244,167,0.25)',
    emptyMsg: 'Start shipping tasks',
  },
];

export default function TaskBoard({ roomId, tasks, members, currentMember, loading }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | string>('all');

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.assignee === filter);
  const tasksByStatus = (status: Task['status']) => filteredTasks.filter((t) => t.status === status);

  const handleStatusChange = async (task: Task, status: Task['status']) => {
    await updateTask(roomId, task.id, { status });
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(roomId, taskId);
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonCol}>
            <div className={styles.skeletonHeader} />
            {[1, 2].map((j) => <div key={j} className={styles.skeletonCard} />)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.boardWrap}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filterWrap}>
          <button
            className={`${styles.filterChip} ${filter === 'all' ? styles.filterActive : ''}`}
            onClick={() => setFilter('all')}
            id="filter-all"
          >
            Everyone
          </button>
          {members.map((m) => (
            <button
              key={m.id}
              className={`${styles.filterChip} ${filter === m.name ? styles.filterActive : ''}`}
              onClick={() => setFilter(filter === m.name ? 'all' : m.name)}
              id={`filter-${m.id}`}
            >
              {m.name}
            </button>
          ))}
        </div>
        <button
          id="add-task-btn"
          className={styles.addBtn}
          onClick={() => setShowAdd(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={14} height={14}>
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Task
        </button>
      </div>

      {/* Kanban board */}
      <div className={styles.board}>
        {COLUMNS.map((col) => {
          const colTasks = tasksByStatus(col.key);
          return (
            <div key={col.key} className={styles.column}>
              {/* Column header */}
              <div className={styles.colHeader} style={{ background: col.accent }}>
                <div className={styles.colHeaderLeft}>
                  <span className={styles.colDot} style={{ background: col.dot }} />
                  <div>
                    <div className={styles.colLabel}>{col.label}</div>
                    <div className={styles.colVibe}>{col.vibe}</div>
                  </div>
                </div>
                <span className={styles.colCount} style={{ color: col.dot, borderColor: col.dot + '40' }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className={styles.colBody}>
                {colTasks.length === 0 ? (
                  <div className={styles.emptyCol}>{col.emptyMsg}</div>
                ) : (
                  colTasks.map((task, idx) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      currentMember={currentMember}
                      members={members}
                      onStatusChange={(status) => handleStatusChange(task, status)}
                      onAssigneeChange={(assignee) => updateTask(roomId, task.id, { assignee })}
                      onDelete={() => handleDelete(task.id)}
                      animDelay={idx * 60}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <AddTaskModal
          roomId={roomId}
          members={members}
          currentMember={currentMember}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
