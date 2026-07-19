import OpenAI from 'openai';

// Always create fresh from env — avoids stale null if key was added after server start
export function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim() === '') return null;
  return new OpenAI({ apiKey: key.trim() });
}
