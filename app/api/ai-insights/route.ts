import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';
import { Task, AIInsight } from '@/types';

export async function POST(req: NextRequest) {
  const client = getOpenAIClient();
  if (!client) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .env.local and restart the server.' },
      { status: 503 }
    );
  }

  let tasks: Task[];
  let roomName: string;
  try {
    const body = await req.json();
    tasks = body.tasks;
    roomName = body.roomName;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({
      summary: 'No tasks yet — add some and get cracking.',
      topPerformer: undefined,
      bottleneck: undefined,
      motivation: 'Every big thing started with one small task.',
      completionTrend: 'stable',
    } satisfies AIInsight);
  }

  const total      = tasks.length;
  const done       = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const todo       = tasks.filter((t) => t.status === 'todo').length;
  const pct        = total > 0 ? Math.round((done / total) * 100) : 0;

  // Member stats
  const memberStats: Record<string, { total: number; done: number }> = {};
  tasks.forEach((t) => {
    if (!t.assignee) return;
    if (!memberStats[t.assignee]) memberStats[t.assignee] = { total: 0, done: 0 };
    memberStats[t.assignee].total++;
    if (t.status === 'done') memberStats[t.assignee].done++;
  });

  const memberSummary = Object.entries(memberStats)
    .map(([name, s]) => `${name}: ${s.done}/${s.total} done`)
    .join(', ');

  const trend = pct >= 60 ? 'up' : pct < 30 ? 'down' : 'stable';

  const prompt = `You are a GenZ productivity coach. Respond ONLY with a valid JSON object — no markdown, no code block, just raw JSON.

Room: "${roomName}"
Today: ${total} tasks — ${done} done (${pct}%), ${inProgress} in progress, ${todo} queued.
Members: ${memberSummary || 'no assignees yet'}
Completion trend: ${trend}

Return this exact JSON shape:
{
  "summary": "1-2 sentence overview, direct and GenZ friendly, no emojis",
  "topPerformer": "member name with highest completion % or null",
  "bottleneck": "one-sentence biggest concern or null if all good",
  "motivation": "short punchy motivational line, GenZ tone, no emojis",
  "completionTrend": "${trend}"
}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 350,
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content?.trim() || '{}';
    let insight: AIInsight;
    try {
      insight = JSON.parse(raw);
    } catch {
      // If JSON parse fails, return a safe fallback
      insight = {
        summary: 'Analysis ready — keep pushing.',
        topPerformer: undefined,
        bottleneck: undefined,
        motivation: 'Stay locked in.',
        completionTrend: trend as AIInsight['completionTrend'],
      };
    }
    // Ensure trend is always set
    if (!insight.completionTrend) insight.completionTrend = trend as AIInsight['completionTrend'];

    return NextResponse.json(insight);
  } catch (err: any) {
    console.error('[AI Insights] OpenAI error:', err?.message || err);
    const status = err?.status || 500;
    return NextResponse.json(
      { error: err?.message || 'OpenAI request failed' },
      { status }
    );
  }
}
