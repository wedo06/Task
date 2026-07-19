'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Member } from '@/types';
import { createTask } from '@/lib/task-utils';
import { getTodayDate } from '@/lib/room-utils';
import styles from './AddTaskModal.module.css';

interface Props {
  roomId: string;
  members: Member[];
  currentMember: { id: string; name: string } | null;
  onClose: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  low:  'rgba(208,244,167,0.8)',
  mid:  'rgba(254,253,198,0.9)',
  high: 'rgba(255,194,222,0.8)',
};

export default function AddTaskModal({ roomId, members, currentMember, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState(currentMember?.name || '');
  const [priority, setPriority] = useState<'low' | 'mid' | 'high'>('mid');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Task needs a title'); return; }
    setLoading(true);
    try {
      await createTask(roomId, {
        title: title.trim(),
        description: description.trim(),
        assignee: assignee.trim(),
        priority,
        status: 'todo',
        createdBy: currentMember?.name || 'Anonymous',
        date: getTodayDate(),
        carriedOver: false,
      });
      toast.success('Task added!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>New Task</h2>
          <button className={styles.closeBtn} onClick={onClose} id="close-add-task" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={16} height={16}>
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Title *</label>
            <input
              id="task-title"
              className="input-candy"
              placeholder="What needs to get done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              id="task-description"
              className={styles.textarea}
              placeholder="More details... (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Assign To</label>
            <div className={styles.chipGroup}>
              <button
                type="button"
                className={`${styles.chip} ${assignee === '' ? styles.chipActive : ''}`}
                style={assignee === '' ? { background: 'rgba(209,197,255,0.7)', borderColor: 'transparent' } : {}}
                onClick={() => setAssignee('')}
              >
                Unassigned
              </button>
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.chip} ${assignee === m.name ? styles.chipActive : ''}`}
                  style={assignee === m.name ? { background: 'rgba(146,209,223,0.7)', borderColor: 'transparent' } : {}}
                  onClick={() => setAssignee(m.name)}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Priority</label>
            <div className={styles.chipGroup}>
              {(['low', 'mid', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  id={`priority-${p}`}
                  className={`${styles.chip} ${priority === p ? styles.chipActive : ''}`}
                  style={priority === p ? { background: PRIORITY_COLORS[p], borderColor: 'transparent' } : {}}
                  onClick={() => setPriority(p)}
                >
                  {p === 'low' ? 'Low' : p === 'mid' ? 'Medium' : 'High'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="submit-task" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
