export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'low' | 'mid' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  date: string; // YYYY-MM-DD
  carriedOver?: boolean; // true if this task was moved from a previous day
}

export interface Room {
  id: string;
  name: string;
  passwordHash: string;
  createdAt: number;
  createdBy: string;
}

export interface Member {
  id: string;
  name: string;
  joinedAt: number;
  lastSeen: number;
  isOnline: boolean;
}

export interface DayHistory {
  date: string;
  totalTasks: number;
  completedTasks: number;
  memberStats: Record<string, { total: number; completed: number }>;
  aiInsight?: string;
}

export interface AIInsight {
  summary: string;
  topPerformer?: string;
  bottleneck?: string;
  motivation: string;
  completionTrend: 'up' | 'down' | 'stable';
}
