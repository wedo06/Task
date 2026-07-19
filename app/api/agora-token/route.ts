import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export async function POST(req: NextRequest) {
  try {
    const { channelName, uid } = await req.json();

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return NextResponse.json(
        { error: 'Agora credentials not configured' },
        { status: 500 }
      );
    }

    if (!channelName || uid === undefined) {
      return NextResponse.json(
        { error: 'channelName and uid are required' },
        { status: 400 }
      );
    }

    // Token valid for 24 hours
    const expirationTimeInSeconds = 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      expirationTimeInSeconds,
      privilegeExpiredTs
    );

    return NextResponse.json({ token });
  } catch (err: any) {
    console.error('Token generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate token' },
      { status: 500 }
    );
  }
}
