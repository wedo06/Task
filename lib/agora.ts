// Agora RTC helper — client-side only (lazy loaded)
export const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';

export async function createAgoraClient() {
  const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
  AgoraRTC.setLogLevel(4); // silent in prod
  const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  return { AgoraRTC, client };
}
