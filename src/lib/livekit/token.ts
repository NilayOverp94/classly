import { AccessToken } from 'livekit-server-sdk';

export async function createLiveKitToken({
  roomName,
  participantName,
  participantIdentity,
  isTeacher = false,
}: {
  roomName: string;
  participantName: string;
  participantIdentity: string;
  isTeacher?: boolean;
}) {
  const apiKey = process.env.LIVEKIT_API_KEY || 'dev_key';
  const apiSecret = process.env.LIVEKIT_API_SECRET || 'dev_secret_at_least_32_bytes_long_key_string';

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    name: participantName,
    metadata: JSON.stringify({ role: isTeacher ? 'teacher' : 'student' }),
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return await at.toJwt();
}

