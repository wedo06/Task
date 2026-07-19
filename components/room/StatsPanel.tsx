'use client';
import { useState } from 'react';
import { Task, Member } from '@/types';
import { calcCompletion, getMemberStats } from '@/lib/task-utils';
import { useAIInsights } from '@/hooks/useAIInsights';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie, Legend,
} from 'recharts';
import styles from './StatsPanel.module.css';

interface Props {
  tasks: Task[];
  members: Member[];
  roomName: string;
}

const PIE_COLORS = ['#6cb86a', '#92D1DF', '#D0D0E0'];

export default function StatsPanel({ tasks, members, roomName }: Props) {
  const { insight, loading: aiLoading, fetchInsights } = useAIInsights();
  const [aiRequested, setAiRequested] = useState(false);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const pct = calcCompletion(tasks);

  const memberStats = getMemberStats(tasks);
  const memberChartData = Object.entries(memberStats).map(([name, s]) => ({
    name,
    done: s.completed,
    remaining: s.total - s.completed,
  }));

  const pieData = [
    { name: 'Done', value: done },
    { name: 'In Progress', value: inProgress },
    { name: 'To Do', value: todo },
  ].filter((d) => d.value > 0);

  const handleGetInsights = () => {
    setAiRequested(true);
    fetchInsights(tasks, roomName);
  };

  const trendIcon = insight?.completionTrend === 'up' ? '↑' :
                    insight?.completionTrend === 'down' ? '↓' : '→';
  const trendColor = insight?.completionTrend === 'up' ? '#4a8c48' :
                     insight?.completionTrend === 'down' ? '#c94070' : '#a06020';

  return (
    <div className={styles.panel}>
      <h2 className={styles.heading}>Today&apos;s Stats</h2>

      {/* Overall progress */}
      <div className={styles.mainProgress}>
        <div className={styles.pctCircle}>
          <svg viewBox="0 0 100 100" className={styles.ring}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="8"/>
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke="var(--candy-blue)" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className={styles.pctInner}>
            <span className={styles.pctNum}>{pct}%</span>
            <span className={styles.pctLabel}>done</span>
          </div>
        </div>

        <div className={styles.statBlocks}>
          <StatBlock label="Total" value={total} color="var(--text-primary)" bg="rgba(0,0,0,0.03)" />
          <StatBlock label="Done" value={done} color="#4a8c48" bg="rgba(208,244,167,0.3)" />
          <StatBlock label="Active" value={inProgress} color="#3a9ab8" bg="rgba(146,209,223,0.25)" />
          <StatBlock label="Queued" value={todo} color="var(--text-muted)" bg="rgba(0,0,0,0.03)" />
        </div>
      </div>

      {/* Distribution pie */}
      {pieData.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Distribution</h3>
          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 10, color: '#1a1a2e', fontSize: 12 }}
                />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-member bar chart */}
      {memberChartData.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Squad Breakdown</h3>
          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={memberChartData} layout="vertical" barSize={14} barGap={2}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={80} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 10, color: '#1a1a2e', fontSize: 12 }}
                />
                <Bar dataKey="done" name="Done" fill="#D0F4A7" radius={[0, 6, 6, 0]} stackId="a" />
                <Bar dataKey="remaining" name="Remaining" fill="rgba(0,0,0,0.07)" radius={[0, 6, 6, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className={styles.section}>
        <div className={styles.aiHeader}>
          <h3 className={styles.sectionTitle}>AI Insights</h3>
          {!aiRequested && (
            <button className="btn btn-ghost btn-sm" onClick={handleGetInsights} id="get-ai-insights">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              Get Insights
            </button>
          )}
        </div>

        {aiLoading && (
          <div className={styles.aiLoading}>
            <div className="spinner" />
            <span>Analyzing your squad's vibe...</span>
          </div>
        )}

        {insight && !aiLoading && (
          <div className={styles.aiCard}>
            <div className={styles.aiTrend} style={{ color: trendColor }}>
              {trendIcon} Trend
            </div>
            <p className={styles.aiSummary}>{insight.summary}</p>
            {insight.topPerformer && (
              <div className={styles.aiStat}>
                <span className={styles.aiStatLabel}>Top Performer</span>
                <span className={styles.aiStatVal} style={{ color: '#4a8c48' }}>{insight.topPerformer}</span>
              </div>
            )}
            {insight.bottleneck && (
              <div className={styles.aiStat}>
                <span className={styles.aiStatLabel}>Watch Out</span>
                <span className={styles.aiStatVal} style={{ color: '#c94070' }}>{insight.bottleneck}</span>
              </div>
            )}
            <div className={styles.aiMotivation}>{insight.motivation}</div>
            <button className="btn btn-ghost btn-sm" onClick={handleGetInsights} style={{ marginTop: 8 }} id="refresh-insights">
              Refresh
            </button>
          </div>
        )}

        {aiRequested && !aiLoading && !insight && (
          <p className={styles.noAI}>
            AI insights unavailable. Add OPENAI_API_KEY to .env.local to enable.
          </p>
        )}
      </div>
    </div>
  );
}

function StatBlock({ label, value, color, bg }: { label: string; value: number; color: string; bg?: string }) {
  return (
    <div className={styles.statBlock} style={bg ? { background: bg, border: '1.5px solid transparent' } : {}}>
      <span className={styles.statVal} style={{ color }}>{value}</span>
      <span className={styles.statLbl}>{label}</span>
    </div>
  );
}
