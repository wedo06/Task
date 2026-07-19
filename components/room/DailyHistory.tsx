'use client';
import { useState } from 'react';
import { useHistoryTasks } from '@/hooks/useTasks';
import { calcCompletion, getMemberStats } from '@/lib/task-utils';
import { getLastNDates, formatDate, getTodayDate } from '@/lib/room-utils';
import styles from './DailyHistory.module.css';

interface Props {
  roomId: string;
}

export default function DailyHistory({ roomId }: Props) {
  const dates = getLastNDates(7);
  const today = getTodayDate();
  const [selected, setSelected] = useState(today);

  return (
    <div className={styles.history}>
      <h2 className={styles.heading}>Daily History</h2>
      <p className={styles.sub}>Last 7 days — click a day to see its tasks</p>

      <div className={styles.timeline}>
        {dates.map((date) => (
          <DayCard
            key={date}
            roomId={roomId}
            date={date}
            isToday={date === today}
            isSelected={date === selected}
            onClick={() => setSelected(date)}
          />
        ))}
      </div>

      <SelectedDayDetail roomId={roomId} date={selected} isToday={selected === today} />
    </div>
  );
}

function DayCard({
  roomId, date, isToday, isSelected, onClick,
}: {
  roomId: string; date: string; isToday: boolean; isSelected: boolean; onClick: () => void;
}) {
  const tasks = useHistoryTasks(roomId, date);
  const pct = calcCompletion(tasks);
  const done = tasks.filter((t) => t.status === 'done').length;

  return (
    <button
      className={`${styles.dayCard} ${isSelected ? styles.dayCardSelected : ''} ${isToday ? styles.dayCardToday : ''}`}
      onClick={onClick}
      id={`history-day-${date}`}
    >
      <div className={styles.dayDate}>{isToday ? 'Today' : formatDate(date)}</div>
      <div className={styles.dayRing}>
        <svg viewBox="0 0 60 60" width={56} height={56}>
          <circle cx="30" cy="30" r="22" fill="none" stroke="var(--bg-glass)" strokeWidth="5"/>
          <circle
            cx="30" cy="30" r="22" fill="none"
            stroke={pct === 100 ? 'var(--candy-mint)' : pct > 50 ? 'var(--candy-purple)' : 'var(--candy-pink)'}
            strokeWidth="5"
            strokeDasharray={`${2 * Math.PI * 22}`}
            strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 30 30)"
          />
        </svg>
        <div className={styles.dayPct}>{pct}%</div>
      </div>
      <div className={styles.dayStats}>
        {tasks.length === 0 ? (
          <span className={styles.noTasks}>No tasks</span>
        ) : (
          <span>{done}/{tasks.length}</span>
        )}
      </div>
    </button>
  );
}

function SelectedDayDetail({ roomId, date, isToday }: { roomId: string; date: string; isToday: boolean }) {
  const tasks = useHistoryTasks(roomId, date);
  const memberStats = getMemberStats(tasks);
  const pct = calcCompletion(tasks);

  if (tasks.length === 0) {
    return (
      <div className={styles.detail}>
        <p className={styles.noTasksDetail}>
          {isToday ? 'No tasks added today yet.' : 'No tasks were tracked on this day.'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <span className={styles.detailDate}>{isToday ? 'Today' : formatDate(date)}</span>
        <span className={styles.detailPct} style={{
          color: pct === 100 ? 'var(--candy-mint)' : pct > 50 ? 'var(--candy-purple)' : 'var(--candy-pink)'
        }}>
          {pct}% complete
        </span>
      </div>

      {Object.keys(memberStats).length > 0 && (
        <div className={styles.memberGrid}>
          {Object.entries(memberStats).map(([name, s]) => {
            const mpct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
            return (
              <div key={name} className={styles.memberStat}>
                <div className={styles.memberStatTop}>
                  <span className={styles.memberStatName}>{name}</span>
                  <span className={styles.memberStatPct}>{mpct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${mpct}%` }} />
                </div>
                <div className={styles.memberStatCount}>{s.completed}/{s.total} tasks</div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.taskList}>
        {tasks.map((t) => (
          <div key={t.id} className={`${styles.historyTask} ${styles[`historyTask_${t.status.replace('-','_')}`]}`}>
            <div className={styles.historyTaskDot} style={{
              background: t.status === 'done' ? 'var(--candy-mint)' : t.status === 'in-progress' ? 'var(--candy-blue)' : 'var(--text-muted)'
            }} />
            <span className={`${styles.historyTaskTitle} ${t.status === 'done' ? styles.historyTaskDone : ''}`}>
              {t.title}
            </span>
            {t.assignee && <span className={styles.historyTaskAssignee}>{t.assignee}</span>}
            {t.carriedOver && <span className={styles.carriedTag}>carried</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
