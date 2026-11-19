import { NextRequest, NextResponse } from 'next/server';
import { createLiveKitToken } from '@/lib/livekit/token';

export const dynamic = 'force-dynamic';

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

    let normalizedRoomName = roomName.trim();

    // If roomName is a booking ID (e.g. room-book-151299 or book-151299), resolve the teacher ID to ensure teacher & student join the exact same room
    if (normalizedRoomName.includes('book-')) {
      try {
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isooxdepfamnufwglosa.supabase.co';
        const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (SERVICE_KEY) {
          const rawBookingId = normalizedRoomName.replace('room-', '');
          const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            headers: {
              'Authorization': `Bearer ${SERVICE_KEY}`,
              'apikey': SERVICE_KEY,
            },
            cache: 'no-store',
          });
          if (res.ok) {
            const data = await res.json();
            for (const u of data.users || []) {
              const bookings: any[] = u.user_metadata?.bookings || [];
              const match = bookings.find((b: any) => b.id === rawBookingId || b.bookingId === rawBookingId);
              if (match && match.teacher_id) {
                normalizedRoomName = `room-tutor-${match.teacher_id}`;
                break;
              }
            }
          }
        }
      } catch (e) {
        console.warn('Room name normalization notice:', e);
      }
    }

    const token = await createLiveKitToken({
      roomName: normalizedRoomName,
      participantName: participantName || 'Classly Participant',
      participantIdentity: identity,
      isTeacher: Boolean(isTeacher),
    });

    return NextResponse.json({
      token,
      roomName: normalizedRoomName,
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
