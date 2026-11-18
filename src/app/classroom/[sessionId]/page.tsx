'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  LiveKitRoom, 
  VideoConference, 
  RoomAudioRenderer,
} from '@livekit/components-react';
import { 
  ShieldCheck, 
  Clock, 
  PenTool, 
  Eraser, 
  Download, 
  Video, 
  PhoneOff, 
  ExternalLink, 
  Layout, 
  AlertCircle,
  RefreshCw,
  Share2,
  Trash2,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.sessionId as string) || 'room-session-active';
  const supabase = createClient();

  const [isMounted, setIsMounted] = useState(false);
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [liveKitUrl, setLiveKitUrl] = useState<string>(
    process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://classly-cq8rvxev.livekit.cloud'
  );
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'teacher' | 'student'>('student');
  const [userName, setUserName] = useState<string>('Learner');
  
  // Meeting Mode: 'livekit' (default WebRTC) | 'jitsi' (backup iframe)
  const [meetingMode, setMeetingMode] = useState<'livekit' | 'jitsi'>('livekit');
  
  // Workspace view: 'split' | 'video_only' | 'whiteboard_only'
  const [viewMode, setViewMode] = useState<'split' | 'video_only' | 'whiteboard_only'>('video_only');

  // Interactive Whiteboard State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState<string>('#183153');

  // Elapsed timer
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setIsMounted(true);
    let isCancelled = false;

    async function initRoom() {
      try {
        setConnecting(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;
        const role = currentUser?.user_metadata?.role === 'teacher' ? 'teacher' : 'student';
        const participantName = 
          currentUser?.user_metadata?.full_name || 
          currentUser?.user_metadata?.name || 
          currentUser?.email?.split('@')[0] || 
          (role === 'teacher' ? 'Verified Educator' : 'Student');

        const identity = `${currentUser?.id || 'guest'}-${Date.now().toString(36)}`;

        const res = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: sessionId,
            participantName,
            identity,
            isTeacher: role === 'teacher',
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to authenticate LiveKit room session.');
        }

        const data = await res.json();
        if (!isCancelled) {
          setLiveKitToken(data.token);
          if (data.wsUrl) setLiveKitUrl(data.wsUrl);
          setUserRole(role);
          setUserName(participantName);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Classroom initialization error:', err);
          setError(err.message || 'Unable to connect to live video server.');
        }
      } finally {
        if (!isCancelled) {
          setConnecting(false);
        }
      }
    }

    initRoom();
    return () => {
      isCancelled = true;
    };
  }, [sessionId]);

  // Canvas drawing handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [viewMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 20;
    } else {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 3;
    }
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Classly-Whiteboard-${sessionId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleLeaveClassroom = () => {
    if (confirm('Are you sure you want to exit the live classroom?')) {
      router.push(userRole === 'teacher' ? '/dashboard/teacher' : '/dashboard/student');
    }
  };

  if (!isMounted) {
    return (
      <div className="bg-navy-950 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400">Loading secure classroom interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-950 text-white min-h-screen flex flex-col h-screen overflow-hidden select-none">
      
      {/* Top Classroom Bar */}
      <header className="h-14 bg-navy-900 border-b border-navy-800 px-4 sm:px-6 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link 
            href={userRole === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'} 
            className="font-bold text-sm text-white flex items-center gap-2 hover:opacity-90"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Classly Live Studio</span>
          </Link>
          <span className="text-navy-700 hidden sm:inline">|</span>
          <span className="text-xs text-gray-300 hidden sm:inline">
            Room #{sessionId.replace('room-', '')} • {userName} ({userRole === 'teacher' ? 'Educator' : 'Student'})
          </span>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Mode Switcher */}
          <div className="bg-navy-950 p-0.5 rounded-lg border border-navy-800 flex items-center text-xs">
            <button
              onClick={() => setViewMode('video_only')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                viewMode === 'video_only' ? 'bg-navy-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Video Only
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                viewMode === 'split' ? 'bg-navy-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Split + Whiteboard
            </button>
            <button
              onClick={() => setViewMode('whiteboard_only')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                viewMode === 'whiteboard_only' ? 'bg-navy-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Whiteboard
            </button>
          </div>

          {/* Backup Meeting Switcher */}
          <div className="hidden md:flex items-center gap-1.5 bg-navy-950 px-2 py-1 rounded-lg border border-navy-800 text-xs">
            <button
              onClick={() => setMeetingMode(meetingMode === 'livekit' ? 'jitsi' : 'livekit')}
              className="text-gray-300 hover:text-white text-[11px] font-semibold flex items-center gap-1"
              title="Toggle WebRTC video provider"
            >
              <RefreshCw className="w-3 h-3 text-accent-400" />
              <span>{meetingMode === 'livekit' ? 'LiveKit Cloud' : 'Jitsi WebRTC'}</span>
            </button>
          </div>

          {/* Elapsed Timer */}
          <div className="bg-navy-950 px-3 py-1 rounded-md text-xs font-mono font-semibold text-emerald-400 border border-navy-800">
            {formatTimer(seconds)}
          </div>

          {/* Leave Button */}
          <button
            onClick={handleLeaveClassroom}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Room</span>
          </button>
        </div>
      </header>

      {/* Main Classroom Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* VIDEO MEETING PANE */}
        <div className={`flex-1 flex flex-col bg-navy-950 relative overflow-hidden ${
          viewMode === 'whiteboard_only' ? 'hidden' : 'flex'
        }`}>
          
          {connecting ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-10 h-10 border-3 border-accent-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-base font-bold text-white mb-1">Connecting to Live Video Room...</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Authenticating hardware video & audio streams with encrypted WebRTC media server.
              </p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-900/30 text-red-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Connection Issue</h3>
              <p className="text-xs text-gray-400 max-w-sm mb-4">{error}</p>
              <button
                onClick={() => setMeetingMode('jitsi')}
                className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white rounded-lg text-xs font-semibold"
              >
                Switch to Standby WebRTC Room
              </button>
            </div>
          ) : meetingMode === 'jitsi' ? (
            /* Instant Standby WebRTC Room (Jitsi Meet) */
            <div className="flex-1 w-full h-full relative">
              <iframe
                src={`https://meet.jit.si/Classly-${sessionId}#config.prejoinPageEnabled=false&userInfo.displayName="${encodeURIComponent(userName)}"`}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-0"
              />
            </div>
          ) : liveKitToken ? (
            /* LiveKit Official Next.js Video Conference */
            <div className="flex-1 w-full h-full relative livekit-classroom-wrapper">
              <LiveKitRoom
                video={true}
                audio={true}
                token={liveKitToken}
                serverUrl={liveKitUrl}
                data-lk-theme="default"
                style={{ height: '100%', width: '100%' }}
                onDisconnected={() => {
                  alert('Disconnected from video room.');
                  router.push(userRole === 'teacher' ? '/dashboard/teacher' : '/dashboard/student');
                }}
                onError={(err) => {
                  console.error('LiveKit Room error:', err);
                }}
              >
                <VideoConference />
                <RoomAudioRenderer />
              </LiveKitRoom>
            </div>
          ) : null}

        </div>

        {/* INTERACTIVE WHITEBOARD PANE (Rendered in Split View or Whiteboard Only) */}
        {(viewMode === 'split' || viewMode === 'whiteboard_only') && (
          <div className={`${
            viewMode === 'split' ? 'w-full lg:w-1/2 border-l border-navy-800' : 'flex-1'
          } bg-white flex flex-col text-charcoal-800 relative shadow-2xl`}>
            
            {/* Whiteboard Toolbar */}
            <div className="h-12 bg-gray-100 border-b border-gray-200 px-4 flex items-center justify-between text-xs flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy-800 flex items-center gap-1.5 mr-2">
                  <PenTool className="w-4 h-4 text-navy-800" />
                  <span>Whiteboard</span>
                </span>

                <button
                  onClick={() => setTool('pen')}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    tool === 'pen' ? 'bg-navy-800 text-white' : 'bg-white border border-gray-200 text-charcoal-700'
                  }`}
                >
                  Pen
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    tool === 'eraser' ? 'bg-navy-800 text-white' : 'bg-white border border-gray-200 text-charcoal-700'
                  }`}
                >
                  Eraser
                </button>

                <div className="flex items-center gap-1.5 ml-2">
                  {['#183153', '#059669', '#DC2626', '#2563EB', '#7C3AED'].map((color) => (
                    <button
                      key={color}
                      onClick={() => { setPenColor(color); setTool('pen'); }}
                      className="w-5 h-5 rounded-full border border-gray-300 transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearCanvas}
                  className="px-2.5 py-1 bg-white border border-gray-200 rounded text-charcoal-600 hover:bg-gray-50 font-medium flex items-center gap-1"
                  title="Clear Whiteboard"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
                <button
                  onClick={downloadCanvas}
                  className="px-2.5 py-1 bg-navy-800 hover:bg-navy-900 text-white rounded font-medium flex items-center gap-1 shadow-sm"
                  title="Save Whiteboard PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>

            {/* Drawing Canvas */}
            <div className="flex-1 relative cursor-crosshair overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={1600}
                height={1000}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-full block bg-white"
              />
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
