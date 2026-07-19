'use client';
import { useState, useCallback } from 'react';
import { Task, AIInsight } from '@/types';
import toast from 'react-hot-toast';

export function useAIInsights() {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (tasks: Task[], roomName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, roomName }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error || `API error ${res.status}`;
        setError(msg);
        toast.error(`AI: ${msg}`);
        return;
      }

      setInsight(data);
    } catch (err: any) {
      const msg = err?.message || 'Network error — check your connection';
      setError(msg);
      toast.error(`AI failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setInsight(null);
    setError(null);
  }, []);

  return { insight, loading, error, fetchInsights, reset };
}
