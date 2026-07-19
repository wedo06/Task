'use client';
import { useState } from 'react';
import { Task } from '@/types';
import styles from './TaskCard.module.css';

interface Props {
  task: Task;
  currentMember: { id: string; name: string } | null;
  onStatusChange: (status: Task['status']) => void;
  onDelete: () => void;
  animDelay?: number;
}

// Status → next status (no cycling back from done)
const STATUS_NEXT: Partial<Record<Task['status'], Task['status']>> = {
  'todo':        'in-progress',
  'in-progress': 'done',
  // 'done' has no next — task is complete
};

// GenZ funky labels for the action buttons
const ACTION_LABELS: Record<Task['status'], string> = {
  'todo':        'Start it',
  'in-progress': 'Ship it',
  'done':        'Crushed it',
};

// Card background tints per status
const CARD_BG: Record<Task['status'], string> = {
  'todo':        '#fff',
  'in-progress': 'rgba(254,253,198,0.45)',  // lemon tint
  'done':        'rgba(208,244,167,0.3)',    // mint tint
};

const CARD_BORDER: Record<Task['status'], string> = {
  'todo':        'rgba(0,0,0,0.08)',
  'in-progress': 'rgba(224,208,0,0.35)',
  'done':        'rgba(108,184,106,0.45)',
};

const PRIORITY_BG: Record<string, string> = {
  low:  'rgba(208,244,167,0.5)',
  mid:  'rgba(255,196,147,0.5)',
  high: 'rgba(255,194,222,0.5)',
};
const PRIORITY_TEXT: Record<string, string> = {
  low:  '#3a7a38',
  mid:  '#a06020',
  high: '#c94070',
};

const STATUS_DOT: Record<Task['status'], string> = {
  'todo':        '#aaaacc',
  'in-progress': '#e0b800',
  'done':        '#6cb86a',
};

export default function TaskCard({ task, currentMember, onStatusChange, onDelete, animDelay = 0 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const isDone = task.status === 'done';
  const nextStatus = STATUS_NEXT[task.status];

  const handleDelete = () => {
    if (confirming) {
      onDelete();
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 2500);
    }
  };

  const handleReopen = () => onStatusChange('todo');

  return (
    <div
      className={styles.card}
      style={{
        background: CARD_BG[task.status],
        borderColor: CARD_BORDER[task.status],
        animationDelay: `${animDelay}ms`,
      }}
    >
      {/* Top color bar — priority indicator */}
      <div className={styles.topBar} style={{ background: PRIORITY_BG[task.priority] }}>
        <div className={styles.topBarLeft}>
          <span className={styles.statusDot} style={{ background: STATUS_DOT[task.status] }} />
          <span className={styles.priorityChip} style={{
            background: PRIORITY_BG[task.priority],
            color: PRIORITY_TEXT[task.priority],
          }}>
            {task.priority === 'high' ? 'HIGH' : task.priority === 'mid' ? 'MED' : 'LOW'}
          </span>
          {task.carriedOver && (
            <span className={styles.carriedTag}>rolled over</span>
          )}
        </div>
        <div className={styles.topBarRight}>
          {task.description && (
            <button
              className={styles.expandBtn}
              onClick={() => setExpanded(!expanded)}
              id={`expand-task-${task.id}`}
              aria-label="Toggle details"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={13} height={13}>
                <polyline points={expanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <h3 className={`${styles.title} ${isDone ? styles.titleDone : ''}`}>
          {task.title}
        </h3>

        {expanded && task.description && (
          <p className={styles.desc}>{task.description}</p>
        )}

        {task.assignee && (
          <div className={styles.assigneeRow}>
            <div className={styles.avatarChip}>
              {task.assignee.charAt(0).toUpperCase()}
            </div>
            <span className={styles.assigneeName}>{task.assignee}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.footer}>
        {isDone ? (
          // Done — show completed state + reopen option
          <div className={styles.doneRow}>
            <span className={styles.doneLabel}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={14} height={14}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Done
            </span>
            <button
              className={styles.reopenBtn}
              onClick={handleReopen}
              id={`reopen-${task.id}`}
            >
              Reopen
            </button>
          </div>
        ) : (
          // Not done — show next status action
          <button
            className={styles.nextBtn}
            onClick={() => nextStatus && onStatusChange(nextStatus)}
            id={`status-${task.id}`}
          >
            {task.status === 'todo' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={13} height={13}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={13} height={13}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
            {ACTION_LABELS[task.status]}
          </button>
        )}

        <button
          className={`${styles.deleteBtn} ${confirming ? styles.deleteBtnConfirm : ''}`}
          onClick={handleDelete}
          id={`delete-task-${task.id}`}
          title={confirming ? 'Click again to confirm' : 'Delete'}
        >
          {confirming ? 'Sure?' : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={13} height={13}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
