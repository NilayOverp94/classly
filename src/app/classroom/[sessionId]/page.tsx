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
  RefreshCw, 
  Trash2, 
  Lock, 
  Unlock, 
  Hand, 
  AlertCircle,
  CheckCircle2,
  Bell,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AlertModal } from '@/components/ui/AlertModal';

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const rawSessionId = (params?.sessionId as string) || 'room-session-active';
  const supabase = createClient();

  const [isMounted, setIsMounted] = useState(false);
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [canonicalRoomName, setCanonicalRoomName] = useState<string>(rawSessionId);
  const [liveKitUrl, setLiveKitUrl] = useState<string>(
    process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://classly-cq8rvxev.livekit.cloud'
  );
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'teacher' | 'student'>('student');
  const [userName, setUserName] = useState<string>('Learner');
  
  // Standby mode toggle: 'livekit' (default) | 'jitsi' (backup iframe)
  const [meetingMode, setMeetingMode] = useState<'livekit' | 'jitsi'>('livekit');
  
  // Workspace view: 'video_only' | 'split' | 'whiteboard_only'
  const [viewMode, setViewMode] = useState<'video_only' | 'split' | 'whiteboard_only'>('video_only');

  // Whiteboard Access Control State
  // Teachers ALWAYS have access; students start with access LOCKED until the teacher explicitly allows it
  const [studentWhiteboardAllowed, setStudentWhiteboardAllowed] = useState(false);
  const [accessRequestSent, setAccessRequestSent] = useState(false);
  const [pendingStudentRequest, setPendingStudentRequest] = useState<string | null>(null);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  // Modal Dialog States (replaces ugly browser alerts/confirms)
  const [showExitModal, setShowExitModal] = useState(false);
  const [disconnectNotice, setDisconnectNotice] = useState<string | null>(null);

  // Real-time channel ref
  const channelRef = useRef<any>(null);

  // Whiteboard Canvas State
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

  // Determine if the current active user can draw
  const canDraw = userRole === 'teacher' || (userRole === 'student' && studentWhiteboardAllowed);

  // Initialize room authentication & token
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
            roomName: rawSessionId,
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
          if (data.roomName) setCanonicalRoomName(data.roomName);
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
  }, [rawSessionId]);

  // Set up real-time broadcast channel for Whiteboard Permissions & Live Drawing Sync
  useEffect(() => {
    if (!canonicalRoomName) return;

    const channel = supabase.channel(`whiteboard-${canonicalRoomName}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'whiteboard_permission' }, ({ payload }) => {
        setStudentWhiteboardAllowed(payload.allowed);
        if (payload.allowed) {
          setPermissionNotice('The teacher has granted you whiteboard drawing access!');
          setAccessRequestSent(false);
          setTimeout(() => setPermissionNotice(null), 5000);
        } else {
          setPermissionNotice('The teacher has locked the whiteboard.');
          setTimeout(() => setPermissionNotice(null), 5000);
        }
      })
      .on('broadcast', { event: 'request_whiteboard' }, ({ payload }) => {
        if (userRole === 'teacher') {
          setPendingStudentRequest(payload.studentName || 'Student');
        }
      })
      .on('broadcast', { event: 'draw_stroke' }, ({ payload }) => {
        drawRemoteStroke(payload);
      })
      .on('broadcast', { event: 'clear_board' }, () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [canonicalRoomName, userRole]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [viewMode]);

  // Remote stroke renderer
  const drawRemoteStroke = (payload: { type: 'start' | 'draw' | 'stop'; x: number; y: number; color: string; tool: string }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (payload.type === 'start') {
      ctx.beginPath();
      ctx.moveTo(payload.x, payload.y);
    } else if (payload.type === 'draw') {
      if (payload.tool === 'eraser') {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 24;
      } else {
        ctx.strokeStyle = payload.color;
        ctx.lineWidth = 3;
      }
      ctx.lineCap = 'round';
      ctx.lineTo(payload.x, payload.y);
      ctx.stroke();
    }
  };

  // Local drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'draw_stroke',
        payload: { type: 'start', x, y, color: penColor, tool },
      });
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canDraw) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 24;
    } else {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 3;
    }
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'draw_stroke',
        payload: { type: 'draw', x, y, color: penColor, tool },
      });
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (channelRef.current && canDraw) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'draw_stroke',
        payload: { type: 'stop' },
      });
    }
  };

  const clearCanvas = () => {
    if (!canDraw) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'clear_board',
      });
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Classly-Whiteboard-${canonicalRoomName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Teacher Action: Toggle student whiteboard permission
  const handleToggleStudentWhiteboard = (allow: boolean) => {
    setStudentWhiteboardAllowed(allow);
    setPendingStudentRequest(null);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'whiteboard_permission',
        payload: { allowed: allow },
      });
    }
  };

  // Student Action: Request permission from teacher
  const handleRequestWhiteboardAccess = () => {
    setAccessRequestSent(true);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'request_whiteboard',
        payload: { studentName: userName },
      });
    }
  };

  const handleLeaveClassroom = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    router.push(userRole === 'teacher' ? '/dashboard/teacher' : '/dashboard/student');
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
            Room #{canonicalRoomName.replace('room-', '').replace('tutor-', '')} • {userName} ({userRole === 'teacher' ? 'Educator' : 'Student'})
          </span>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Teacher Whiteboard Permission Controller in Header */}
          {userRole === 'teacher' && (
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => handleToggleStudentWhiteboard(!studentWhiteboardAllowed)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  studentWhiteboardAllowed
                    ? 'bg-emerald-600/90 hover:bg-emerald-700 text-white'
                    : 'bg-amber-600/90 hover:bg-amber-700 text-white'
                }`}
                title={studentWhiteboardAllowed ? 'Click to lock student whiteboard' : 'Click to grant student whiteboard access'}
              >
                {studentWhiteboardAllowed ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Student Drawing: Allowed</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Student Drawing: Locked</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Student Whiteboard Permission Badge in Header */}
          {userRole === 'student' && (
            <div className="hidden md:flex items-center">
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border flex items-center gap-1 ${
                studentWhiteboardAllowed 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400' 
                  : 'bg-navy-950 border-navy-800 text-gray-400'
              }`}>
                {studentWhiteboardAllowed ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-gray-400" />}
                <span>{studentWhiteboardAllowed ? 'Whiteboard: Active' : 'Whiteboard: Locked by Teacher'}</span>
              </span>
            </div>
          )}

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
              Split + Board
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

      {/* Floating Alerts & Teacher Request Notifications */}
      {userRole === 'teacher' && pendingStudentRequest && (
        <div className="bg-amber-500 text-navy-950 px-4 py-2.5 text-xs font-semibold flex items-center justify-between z-30 shadow-lg border-b border-amber-600 animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Student <strong>{pendingStudentRequest}</strong> has requested permission to draw on the whiteboard.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleStudentWhiteboard(true)}
              className="px-3 py-1 bg-navy-950 text-white rounded font-bold text-xs hover:bg-navy-900 transition"
            >
              Grant Drawing Access
            </button>
            <button
              onClick={() => setPendingStudentRequest(null)}
              className="p-1 hover:bg-amber-600 rounded text-navy-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Student Toast Notice */}
      {permissionNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between z-30 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{permissionNotice}</span>
          </div>
          <button onClick={() => setPermissionNotice(null)} className="text-white hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
            /* Standby WebRTC Room (Jitsi Meet) using Canonical Unified Room */
            <div className="flex-1 w-full h-full relative">
              <iframe
                src={`https://meet.jit.si/Classly-${canonicalRoomName}#config.prejoinPageEnabled=false&userInfo.displayName="${encodeURIComponent(userName)}"`}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-0"
              />
            </div>
          ) : liveKitToken ? (
            /* Real LiveKit WebRTC Video Conference */
            <div className="flex-1 w-full h-full relative livekit-classroom-wrapper">
              <LiveKitRoom
                video={true}
                audio={true}
                token={liveKitToken}
                serverUrl={liveKitUrl}
                data-lk-theme="default"
                style={{ height: '100%', width: '100%' }}
                onDisconnected={() => {
                  setDisconnectNotice('Your live video session ended or was disconnected from the media server.');
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

                {/* If the user can draw, show tools */}
                {canDraw ? (
                  <>
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
                  </>
                ) : (
                  /* Student Locked Status */
                  <div className="flex items-center gap-1.5 text-xs text-charcoal-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-medium">Student Drawing Locked</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Teacher Whiteboard Permission Toggle inside Toolbar */}
                {userRole === 'teacher' && (
                  <button
                    onClick={() => handleToggleStudentWhiteboard(!studentWhiteboardAllowed)}
                    className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition ${
                      studentWhiteboardAllowed 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                    }`}
                  >
                    {studentWhiteboardAllowed ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span>{studentWhiteboardAllowed ? 'Student: Allowed' : 'Student: Locked'}</span>
                  </button>
                )}

                {/* Student Request Access Button */}
                {userRole === 'student' && !studentWhiteboardAllowed && (
                  <button
                    onClick={handleRequestWhiteboardAccess}
                    disabled={accessRequestSent}
                    className="px-2.5 py-1 bg-navy-800 hover:bg-navy-900 disabled:bg-gray-400 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Hand className="w-3 h-3" />
                    <span>{accessRequestSent ? 'Request Sent ✋' : 'Request Access'}</span>
                  </button>
                )}

                {canDraw && (
                  <button
                    onClick={clearCanvas}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded text-charcoal-600 hover:bg-gray-50 font-medium flex items-center gap-1"
                    title="Clear Whiteboard"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}

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

            {/* Drawing Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={1600}
                height={1000}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className={`w-full h-full block bg-white ${canDraw ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
              />

              {/* Locked Overlay for Student when not permitted */}
              {!canDraw && (
                <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10">
                  <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-3 shadow-subtle">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-navy-800 mb-1">
                    Whiteboard Access Locked
                  </h3>
                  <p className="text-xs text-charcoal-600 max-w-sm mb-4 leading-relaxed">
                    Drawing access is currently restricted by your instructor. You will be able to draw, solve formulas, and write once your teacher grants permission.
                  </p>
                  <button
                    onClick={handleRequestWhiteboardAccess}
                    disabled={accessRequestSent}
                    className="px-5 py-2.5 bg-navy-800 hover:bg-navy-900 disabled:bg-gray-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    <Hand className="w-4 h-4" />
                    <span>{accessRequestSent ? 'Access Requested — Waiting for Teacher...' : 'Request Whiteboard Access'}</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* Beautiful Animated Exit Classroom Modal */}
      <ConfirmModal
        isOpen={showExitModal}
        theme="dark"
        icon="exit"
        variant="danger"
        title="Exit Live Classroom?"
        description={
          userRole === 'teacher'
            ? 'Are you sure you want to exit? Your students can remain or re-connect whenever you re-open the class.'
            : 'Are you sure you want to leave this live lesson? You can re-join anytime from your student dashboard.'
        }
        confirmText="Leave Meeting"
        cancelText="Stay in Class"
        onConfirm={handleConfirmExit}
        onClose={() => setShowExitModal(false)}
        details={
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Session Duration:</span>
            <span className="font-mono font-bold text-emerald-400">{formatTimer(seconds)}</span>
          </div>
        }
      />

      {/* Disconnection Alert Modal */}
      <AlertModal
        isOpen={!!disconnectNotice}
        theme="dark"
        variant="warning"
        title="Session Disconnected"
        message={disconnectNotice || ''}
        buttonText="Return to Dashboard"
        onClose={() => {
          setDisconnectNotice(null);
          router.push(userRole === 'teacher' ? '/dashboard/teacher' : '/dashboard/student');
        }}
      />

    </div>
  );
}
