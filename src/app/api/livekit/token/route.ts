import { NextRequest, NextResponse } from 'next/server';
import { createLiveKitToken } from '@/lib/livekit/token';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomName, participantName, identity, isTeacher } = body;

    if (!roomName || !identity) {
      return NextResponse.json(
        { error: 'roomName and identity are required' },
        { status: 400 }
      );
    }

    const token = await createLiveKitToken({
      roomName,
      participantName: participantName || 'Classly Participant',
      participantIdentity: identity,
      isTeacher: Boolean(isTeacher),
    });

    return NextResponse.json({
      token,
      wsUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://classly-cq8rvxev.livekit.cloud',
    });
  } catch (error: any) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate token' },
      { status: 500 }
    );
  }
}

