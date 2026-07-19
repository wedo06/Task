import { db, collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query, where } from './firebase';
import { Task } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { getTodayDate } from './room-utils';

export async function createTask(
  roomId: string,
  data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = uuidv4();
  const now = Date.now();
  const task: Task = { ...data, id, createdAt: now, updatedAt: now };
  await setDoc(doc(db, 'rooms', roomId, 'tasks', id), task);
  return id;
}

export async function updateTask(
  roomId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId, 'tasks', taskId), {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteTask(roomId: string, taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'rooms', roomId, 'tasks', taskId));
}

// Carry over incomplete tasks from previous day to today
export async function carryOverTasks(roomId: string, memberName: string): Promise<void> {
  const today = getTodayDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const tasksRef = collection(db, 'rooms', roomId, 'tasks');
  const q = query(tasksRef, where('date', '==', yesterdayStr));
  const snap = await getDocs(q);

  const carries: Promise<void>[] = [];
  snap.forEach((d) => {
    const task = d.data() as Task;
    if (task.status !== 'done') {
      const newId = uuidv4();
      const carried: Task = {
        ...task,
        id: newId,
        date: today,
        status: 'todo',
        carriedOver: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      carries.push(setDoc(doc(db, 'rooms', roomId, 'tasks', newId), carried));
    }
  });

  await Promise.all(carries);
}

export function calcCompletion(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
}

export function getMemberStats(tasks: Task[]): Record<string, { total: number; completed: number }> {
  const stats: Record<string, { total: number; completed: number }> = {};
  tasks.forEach((t) => {
    if (!t.assignee) return;
    if (!stats[t.assignee]) stats[t.assignee] = { total: 0, completed: 0 };
    stats[t.assignee].total++;
    if (t.status === 'done') stats[t.assignee].completed++;
  });
  return stats;
}
