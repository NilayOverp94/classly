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
  X,
  RotateCcw
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

  // Whiteboard Canvas State & High-DPI / Smooth Stroke Enhancements
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState<string>('#183153');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);

  // Undo history & stroke smoothing refs
  const historyRef = useRef<ImageData[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const remoteLastPointRef = useRef<{ x: number; y: number } | null>(null);
  const strokeBufferRef = useRef<Array<{ nx: number; ny: number }>>([]);
  const flushTimeoutRef = useRef<any>(null);

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

  // Save current canvas state to history for undo
  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      if (historyRef.current.length >= 15) {
        historyRef.current.shift();
      }
      historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    } catch (e) {
      // Fallback if security restrictions block getImageData
    }
  };

  const handleUndo = () => {
    if (!canDraw) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (historyRef.current.length > 0) {
      const previousState = historyRef.current.pop();
      if (previousState) {
        ctx.putImageData(previousState, 0, 0);
      }
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Canvas setup & High-DPI Retina Display support (preserves content across layout changes)
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;

      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      const targetWidth = Math.round(rect.width * dpr);
      const targetHeight = Math.round(rect.height * dpr);

      if (canvas.width === targetWidth && canvas.height === targetHeight) return;

      // Preserve existing drawings on an offscreen buffer before resizing
      const offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const offCtx = offscreen.getContext('2d');
      if (offCtx && canvas.width > 0 && canvas.height > 0) {
        offCtx.drawImage(canvas, 0, 0);
      }

      // Update physical resolution for crystal-sharp Retina rendering
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Restore drawing buffer seamlessly
      if (offscreen.width > 0 && offscreen.height > 0) {
        ctx.drawImage(offscreen, 0, 0, offscreen.width, offscreen.height, 0, 0, canvas.width, canvas.height);
      }
    };

    const timer = setTimeout(handleResize, 80);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [viewMode]);

  // Coordinate resolution with High-DPI scaling and 0..1 normalization
  const getCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, nx: 0, ny: 0 };
    const rect = canvas.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const x = nx * canvas.width;
    const y = ny * canvas.height;
    return { x, y, nx, ny };
  };

  // Remote stroke renderer with smooth curve interpolation and batch handling
  const drawRemoteStroke = (payload: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    const width = (payload.tool === 'eraser' ? 30 : (payload.strokeWidth || 3)) * dpr;
    ctx.strokeStyle = payload.tool === 'eraser' ? '#FFFFFF' : (payload.color || '#183153');
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (payload.type === 'start') {
      const x = payload.nx !== undefined ? payload.nx * canvas.width : (payload.x / 1600) * canvas.width;
      const y = payload.ny !== undefined ? payload.ny * canvas.height : (payload.y / 1000) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      remoteLastPointRef.current = { x, y };
    } else if (payload.type === 'batch' && Array.isArray(payload.points)) {
      payload.points.forEach((pt: { nx: number; ny: number }) => {
        const x = pt.nx * canvas.width;
        const y = pt.ny * canvas.height;
        if (remoteLastPointRef.current) {
          const midX = (remoteLastPointRef.current.x + x) / 2;
          const midY = (remoteLastPointRef.current.y + y) / 2;
          ctx.quadraticCurveTo(remoteLastPointRef.current.x, remoteLastPointRef.current.y, midX, midY);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(x, y);
        }
        remoteLastPointRef.current = { x, y };
      });
    } else if (payload.type === 'draw') {
      const x = payload.nx !== undefined ? payload.nx * canvas.width : (payload.x / 1600) * canvas.width;
      const y = payload.ny !== undefined ? payload.ny * canvas.height : (payload.y / 1000) * canvas.height;
      if (remoteLastPointRef.current) {
        const midX = (remoteLastPointRef.current.x + x) / 2;
        const midY = (remoteLastPointRef.current.y + y) / 2;
        ctx.quadraticCurveTo(remoteLastPointRef.current.x, remoteLastPointRef.current.y, midX, midY);
        ctx.stroke();
      } else {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      remoteLastPointRef.current = { x, y };
    } else if (payload.type === 'stop') {
      remoteLastPointRef.current = null;
    }
  };

  // Local drawing helpers
  const startDrawingAt = (clientX: number, clientY: number) => {
    if (!canDraw) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveSnapshot();

    const pt = getCanvasPoint(clientX, clientY);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    lastPointRef.current = { x: pt.x, y: pt.y };
    setIsDrawing(true);

    strokeBufferRef.current = [{ nx: pt.nx, ny: pt.ny }];

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'draw_stroke',
        payload: {
          type: 'start',
          nx: pt.nx,
          ny: pt.ny,
          x: pt.nx * 1600,
          y: pt.ny * 1000,
          color: penColor,
          tool,
          strokeWidth,
        },
      });
    }
  };

  const drawAt = (clientX: number, clientY: number) => {
    if (!isDrawing || !canDraw) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPointRef.current) return;

    const pt = getCanvasPoint(clientX, clientY);
    const dpr = window.devicePixelRatio || 1;

    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : penColor;
    ctx.lineWidth = (tool === 'eraser' ? 30 : strokeWidth) * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Smooth quadratic curve to midpoint for natural handwriting feel
    const midX = (lastPointRef.current.x + pt.x) / 2;
    const midY = (lastPointRef.current.y + pt.y) / 2;
    ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midX, midY);
    ctx.stroke();

    lastPointRef.current = { x: pt.x, y: pt.y };
    strokeBufferRef.current.push({ nx: pt.nx, ny: pt.ny });

    // Throttle WebSocket broadcasting to ~35ms to eliminate message flooding and latency
    if (!flushTimeoutRef.current && channelRef.current) {
      flushTimeoutRef.current = setTimeout(() => {
        if (strokeBufferRef.current.length > 0 && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'draw_stroke',
            payload: {
              type: 'batch',
              points: strokeBufferRef.current,
              color: penColor,
              tool,
              strokeWidth,
            },
          });
          strokeBufferRef.current = [];
        }
        flushTimeoutRef.current = null;
      }, 35);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;

    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }

    if (channelRef.current && canDraw) {
      // Flush any trailing points
      if (strokeBufferRef.current.length > 0) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'draw_stroke',
          payload: {
            type: 'batch',
            points: strokeBufferRef.current,
            color: penColor,
            tool,
            strokeWidth,
          },
        });
        strokeBufferRef.current = [];
      }

      channelRef.current.send({
        type: 'broadcast',
        event: 'draw_stroke',
        payload: { type: 'stop' },
      });
    }
  };

  // Mouse handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    startDrawingAt(e.clientX, e.clientY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawAt(e.clientX, e.clientY);
  };

  // Touch handlers for iPad / Stylus / Mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    if (e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      startDrawingAt(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canDraw || !isDrawing) return;
    if (e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      drawAt(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) {
      e.preventDefault();
      stopDrawing();
    }
  };

  const clearCanvas = () => {
    if (!canDraw) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    saveSnapshot();
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
                          className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                            penColor === color && tool === 'pen' ? 'ring-2 ring-offset-1 ring-navy-800 scale-110 border-white' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={`Color: ${color}`}
                        />
                      ))}
                    </div>

                    {/* Stroke Width Selector */}
                    <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-200 rounded p-0.5 ml-1">
                      {[
                        { label: 'Fine', width: 2 },
                        { label: 'Medium', width: 4 },
                        { label: 'Bold', width: 7 },
                      ].map((sw) => (
                        <button
                          key={sw.width}
                          onClick={() => setStrokeWidth(sw.width)}
                          className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition ${
                            strokeWidth === sw.width ? 'bg-navy-800 text-white' : 'text-charcoal-600 hover:bg-gray-100'
                          }`}
                          title={`${sw.label} Stroke (${sw.width}px)`}
                        >
                          {sw.label}
                        </button>
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
                  <>
                    <button
                      onClick={handleUndo}
                      className="px-2 py-1 bg-white border border-gray-200 rounded text-charcoal-600 hover:bg-gray-50 font-medium flex items-center gap-1"
                      title="Undo Stroke"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Undo</span>
                    </button>
                    <button
                      onClick={clearCanvas}
                      className="px-2.5 py-1 bg-white border border-gray-200 rounded text-charcoal-600 hover:bg-gray-50 font-medium flex items-center gap-1"
                      title="Clear Whiteboard"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  </>
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
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className={`w-full h-full block bg-white touch-none ${canDraw ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
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
