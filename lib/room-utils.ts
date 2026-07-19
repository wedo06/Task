import { v4 as uuidv4 } from 'uuid';

const ADJECTIVES = ['NEON', 'CYBER', 'VIBE', 'HYPE', 'WILD', 'FLUX', 'NOVA', 'APEX', 'ZEST', 'DOPE'];
const NOUNS = ['SQUAD', 'CREW', 'GANG', 'PACK', 'ZONE', 'LAIR', 'BASE', 'HUB', 'WAVE', 'SYNC'];

export function generateRoomId(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}-${noun}-${num}`;
}

export function generateMemberId(): string {
  return uuidv4();
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // If the old hash is a bcrypt hash (starts with $2), fallback to bcrypt to avoid breaking existing rooms
  if (hash.startsWith('$2')) {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
  }
  const attemptHash = await hashPassword(password);
  return attemptHash === hash;
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function getLastNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}
