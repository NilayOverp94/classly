'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  Code2,
  Terminal,
  Laptop,
  Circle,
  Square,
  Radio,
  Film
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AlertModal } from '@/components/ui/AlertModal';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { 
  LiveCodeEditor, 
  STARTER_CODE, 
  SupportedLanguage 
} from '@/components/classroom/LiveCodeEditor';
import { RecordingCompleteModal } from '@/components/classroom/RecordingCompleteModal';

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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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

  // Multi-Page Whiteboard & PDF Export State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pagesDataRef = useRef<Record<number, string>>({});
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;
  const totalPagesRef = useRef(totalPages);
  totalPagesRef.current = totalPages;

  // Computer Science & Subject Track State (Live Code Editor is exclusive to CS classes)
  const searchParams = useSearchParams();
  const urlSubject = searchParams?.get('subject') || '';
  const [classSubject, setClassSubject] = useState<string>(urlSubject || 'Mathematics');

  const isComputerScienceClass =
    classSubject.toLowerCase().includes('computer') ||
    classSubject.toLowerCase().includes('coding') ||
    classSubject.toLowerCase().includes('python') ||
    classSubject.toLowerCase().includes('java') ||
    urlSubject.toLowerCase().includes('computer') ||
    urlSubject.toLowerCase().includes('coding') ||
    rawSessionId.toLowerCase().includes('cs') ||
    rawSessionId.toLowerCase().includes('code');

  // CS Studio Workspace Tab: 'code' | 'split' | 'whiteboard'
  const [csWorkspaceTab, setCsWorkspaceTab] = useState<'code' | 'split' | 'whiteboard'>('code');

  // Live Code Editor State (Python / Java / JS / C++)
  const [code, setCode] = useState<string>(STARTER_CODE['python']);
  const [codeLanguage, setCodeLanguage] = useState<SupportedLanguage>('python');
  const [remoteConsoleOutput, setRemoteConsoleOutput] = useState<string>('');
  const codeFlushTimeoutRef = useRef<any>(null);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (!codeFlushTimeoutRef.current && channelRef.current && canDraw) {
      codeFlushTimeoutRef.current = setTimeout(() => {
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'code_change',
            payload: { code: newCode, language: codeLanguage },
          });
        }
        codeFlushTimeoutRef.current = null;
      }, 50);
    }
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setCodeLanguage(newLang);
    if (channelRef.current && canDraw) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'code_change',
        payload: { code, language: newLang },
      });
    }
  };

  const handleRunCode = (output: string) => {
    if (channelRef.current && canDraw) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'code_run',
        payload: { output },
      });
    }
  };

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

  // In-Classroom Session Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [remoteRecordingActive, setRemoteRecordingActive] = useState(false);
  const [remoteRecorderName, setRemoteRecorderName] = useState('Educator');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [showRecordingCompleteModal, setShowRecordingCompleteModal] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const handleStartRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('Session Recording is not supported in this browser. Please use Chrome, Edge, or Safari on desktop.');
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: true,
      });

      if (!stream) return;

      recordingStreamRef.current = stream;
      recordingChunksRef.current = [];

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
          }
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordingChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(recordingChunksRef.current, { type: mimeType });
        const finalUrl = URL.createObjectURL(finalBlob);
        setRecordedBlob(finalBlob);
        setRecordedUrl(finalUrl);
        setShowRecordingCompleteModal(true);
        setIsRecording(false);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'recording_status',
            payload: { isRecording: false },
          });
        }
      };

      // Handle user stopping screen share from browser banner
      stream.getVideoTracks()[0].onended = () => {
        handleStopRecording();
      };

      recorder.start(1000);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'recording_status',
          payload: { isRecording: true, recorderName: userName },
        });
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        console.error('Failed to start recording:', err);
        alert('Unable to initialize recording stream. Please ensure screen/tab permissions are granted.');
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      recordingStreamRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
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
          if (currentUser) setCurrentUserId(currentUser.id);

          // Resolve classroom subject for Computer Science vs Math
          if (urlSubject) {
            setClassSubject(urlSubject);
          } else {
            const userMeta = currentUser?.user_metadata || {};
            const bookings = Array.isArray(userMeta.bookings) ? userMeta.bookings : [];
            const matchedBooking = bookings.find((b: any) => 
              b.id === rawSessionId.replace('room-', '') || 
              b.meeting_room_id === rawSessionId || 
              (b.teacher_id && rawSessionId.includes(b.teacher_id))
            );
            if (matchedBooking?.subject) {
              setClassSubject(matchedBooking.subject);
            } else if (userMeta.teaching_subjects?.some((s: string) => s.toLowerCase().includes('computer') || s.toLowerCase().includes('coding'))) {
              setClassSubject('Computer Science');
            }
          }
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

  // Save current canvas state to memory for current page
  const saveCurrentPageToStore = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    try {
      pagesDataRef.current[currentPageRef.current] = canvas.toDataURL('image/png');
    } catch (e) {
      console.warn('Unable to store page image:', e);
    }
  };

  // Restore page state from memory onto canvas
  const loadPageFromStore = (targetPage: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyRef.current = [];

    // Clear canvas to pristine white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const savedData = pagesDataRef.current[targetPage];
    if (savedData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = savedData;
    }
  };

  const applySwitchPage = (targetPage: number, remoteTotalPages?: number) => {
    if (targetPage < 1) return;
    saveCurrentPageToStore();

    if (remoteTotalPages && remoteTotalPages > totalPagesRef.current) {
      setTotalPages(remoteTotalPages);
    } else if (targetPage > totalPagesRef.current) {
      setTotalPages(targetPage);
    }

    setCurrentPage(targetPage);
    loadPageFromStore(targetPage);
  };

  const applyAddPage = (newPageNum: number, remoteTotalPages?: number) => {
    saveCurrentPageToStore();
    const count = remoteTotalPages || Math.max(newPageNum, totalPagesRef.current + 1);
    setTotalPages(count);
    setCurrentPage(newPageNum);
    loadPageFromStore(newPageNum);
  };

  const handleSwitchPage = (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === currentPage) return;
    applySwitchPage(targetPage, totalPages);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'switch_page',
        payload: { page: targetPage, totalPages },
      });
    }
  };

  const handleAddPage = () => {
    if (totalPages >= 15) return;
    const newPageNum = totalPages + 1;
    applyAddPage(newPageNum, newPageNum);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'add_page',
        payload: { page: newPageNum, totalPages: newPageNum },
      });
    }
  };

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
        delete pagesDataRef.current[currentPageRef.current];
      })
      .on('broadcast', { event: 'switch_page' }, ({ payload }) => {
        if (typeof payload?.page === 'number') {
          applySwitchPage(payload.page, payload.totalPages);
        }
      })
      .on('broadcast', { event: 'add_page' }, ({ payload }) => {
        if (typeof payload?.page === 'number') {
          applyAddPage(payload.page, payload.totalPages);
        }
      })
      .on('broadcast', { event: 'code_change' }, ({ payload }) => {
        if (typeof payload?.code === 'string') {
          setCode(payload.code);
        }
        if (payload?.language) {
          setCodeLanguage(payload.language);
        }
      })
      .on('broadcast', { event: 'code_run' }, ({ payload }) => {
        if (payload?.output) {
          setRemoteConsoleOutput(payload.output);
        }
      })
      .on('broadcast', { event: 'subject_change' }, ({ payload }) => {
        if (payload?.subject) {
          setClassSubject(payload.subject);
        }
      })
      .on('broadcast', { event: 'recording_status' }, ({ payload }) => {
        if (payload) {
          setRemoteRecordingActive(!!payload.isRecording);
          if (payload.recorderName) {
            setRemoteRecorderName(payload.recorderName);
          }
        }
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
    if (payload.page && payload.page !== currentPageRef.current) {
      return;
    }

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
          page: currentPageRef.current,
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
              page: currentPageRef.current,
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
            page: currentPageRef.current,
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
        payload: { type: 'stop', page: currentPageRef.current },
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
    delete pagesDataRef.current[currentPageRef.current];

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
    link.download = `Classly-Whiteboard-${canonicalRoomName}-Page-${currentPage}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Export all whiteboard pages to high-resolution presentation PDF notes
  const exportAllPagesToPdf = async () => {
    try {
      setIsExportingPdf(true);
      // Ensure current canvas state is saved to memory first
      saveCurrentPageToStore();

      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      for (let p = 1; p <= totalPages; p++) {
        if (p > 1) {
          doc.addPage('a4', 'landscape');
        }

        // Header Background Bar (Navy)
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 42, 'F');

        // Brand Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('Classly Live Classroom Notes', 24, 26);

        // Room & Timestamp
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const sessionDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        doc.text(`Room #${canonicalRoomName.replace('room-', '')} • ${sessionDate}`, 230, 26);

        // Page Number Indicator in Header
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Page ${p} of ${totalPages}`, pageWidth - 90, 26);

        // Whiteboard Canvas Border & Background
        const marginX = 24;
        const marginY = 52;
        const contentWidth = pageWidth - (marginX * 2);
        const contentHeight = pageHeight - marginY - 28;

        // White background for content
        doc.setFillColor(255, 255, 255);
        doc.rect(marginX, marginY, contentWidth, contentHeight, 'F');

        // Add page image if available
        let pageImg = pagesDataRef.current[p];
        if (p === currentPage && canvasRef.current) {
          try {
            pageImg = canvasRef.current.toDataURL('image/png');
          } catch (e) {}
        }

        if (pageImg) {
          try {
            doc.addImage(pageImg, 'PNG', marginX, marginY, contentWidth, contentHeight, undefined, 'FAST');
          } catch (e) {
            console.error('Failed to embed page image in PDF:', e);
          }
        }

        // Clean border around canvas
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(1);
        doc.rect(marginX, marginY, contentWidth, contentHeight, 'S');

        // Footer note
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          'Generated from Classly Interactive Live Classroom • Learn Together, Grow Together',
          marginX,
          pageHeight - 12
        );
      }

      const cleanFileName = `Classly-Notes-${canonicalRoomName.replace(/[^a-zA-Z0-9_-]/g, '_')}-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(cleanFileName);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert('Unable to export PDF at this moment. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
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
    if (userRole === 'student') {
      setShowReviewModal(true);
    } else {
      router.push('/dashboard/teacher');
    }
  };

  const renderWhiteboard = () => (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0E1526] text-charcoal-800 dark:text-slate-200 relative overflow-hidden">
      {/* Whiteboard Toolbar */}
      <div className="h-12 bg-gray-100 dark:bg-[#111827] border-b border-gray-200 dark:border-[#1E293B] px-3 sm:px-4 flex items-center justify-between text-xs flex-shrink-0 transition-colors gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="font-bold text-navy-800 dark:text-white flex items-center gap-1.5 mr-1">
            <PenTool className="w-4 h-4 text-navy-800 dark:text-emerald-400" />
            <span className="hidden md:inline">Whiteboard</span>
          </span>

          {/* If the user can draw, show tools */}
          {canDraw ? (
            <>
              <button
                onClick={() => setTool('pen')}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  tool === 'pen' ? 'bg-navy-800 dark:bg-emerald-600 text-white' : 'bg-white dark:bg-[#162032] border border-gray-200 dark:border-[#1E293B] text-charcoal-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1E293B]'
                }`}
              >
                Pen
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  tool === 'eraser' ? 'bg-navy-800 dark:bg-emerald-600 text-white' : 'bg-white dark:bg-[#162032] border border-gray-200 dark:border-[#1E293B] text-charcoal-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1E293B]'
                }`}
              >
                Eraser
              </button>

              <div className="flex items-center gap-1 sm:gap-1.5 ml-1">
                {['#183153', '#059669', '#DC2626', '#2563EB', '#7C3AED'].map((color) => (
                  <button
                    key={color}
                    onClick={() => { setPenColor(color); setTool('pen'); }}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border transition-transform hover:scale-110 ${
                      penColor === color && tool === 'pen' ? 'ring-2 ring-offset-1 ring-navy-800 dark:ring-emerald-400 scale-110 border-white' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Color: ${color}`}
                  />
                ))}
              </div>

              {/* Stroke Width Selector */}
              <div className="hidden xl:flex items-center gap-1 bg-white dark:bg-[#162032] border border-gray-200 dark:border-[#1E293B] rounded p-0.5 ml-1">
                {[
                  { label: 'Fine', width: 2 },
                  { label: 'Medium', width: 4 },
                  { label: 'Bold', width: 7 },
                ].map((sw) => (
                  <button
                    key={sw.width}
                    onClick={() => setStrokeWidth(sw.width)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition ${
                      strokeWidth === sw.width ? 'bg-navy-800 dark:bg-emerald-600 text-white' : 'text-charcoal-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#1E293B]'
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
            <div className="flex items-center gap-1.5 text-xs text-charcoal-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-md">
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-medium">Student Drawing Locked</span>
            </div>
          )}
        </div>

        {/* Center / Right Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Whiteboard Page Navigation */}
          <div className="flex items-center bg-white dark:bg-[#162032] border border-gray-200 dark:border-[#1E293B] rounded-md px-1 py-0.5 shadow-xs">
            <button
              onClick={() => handleSwitchPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 rounded text-charcoal-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1E293B] disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-semibold text-charcoal-700 dark:text-slate-200 whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handleSwitchPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1 rounded text-charcoal-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1E293B] disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {canDraw && (
              <button
                onClick={handleAddPage}
                disabled={totalPages >= 15}
                className="ml-1 pl-1.5 border-l border-gray-200 dark:border-[#1E293B] py-0.5 text-navy-800 dark:text-emerald-400 hover:text-navy-950 dark:hover:text-emerald-300 disabled:opacity-30 flex items-center gap-0.5 text-[11px] font-bold transition"
                title="Add New Whiteboard Page"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            )}
          </div>

          {/* Teacher Whiteboard Permission Toggle inside Toolbar */}
          {userRole === 'teacher' && (
            <button
              onClick={() => handleToggleStudentWhiteboard(!studentWhiteboardAllowed)}
              className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition ${
                studentWhiteboardAllowed 
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200' 
                  : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-200'
              }`}
            >
              {studentWhiteboardAllowed ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span className="hidden lg:inline">{studentWhiteboardAllowed ? 'Student: Allowed' : 'Student: Locked'}</span>
            </button>
          )}

          {/* Student Request Access Button */}
          {userRole === 'student' && !studentWhiteboardAllowed && (
            <button
              onClick={handleRequestWhiteboardAccess}
              disabled={accessRequestSent}
              className="px-2.5 py-1 bg-navy-800 dark:bg-emerald-600 hover:bg-navy-900 dark:hover:bg-emerald-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
            >
              <Hand className="w-3 h-3" />
              <span>{accessRequestSent ? 'Requested' : 'Request Access'}</span>
            </button>
          )}

          {canDraw && (
            <>
              <button
                onClick={handleUndo}
                className="px-2 py-1 bg-white dark:bg-[#162032] border border-gray-200 dark:border-[#1E293B] rounded text-charcoal-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1E293B] font-medium flex items-center gap-1 transition"
                title="Undo Stroke"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Undo</span>
              </button>
              <button
                onClick={clearCanvas}
                className="px-2 py-1 bg-white dark:bg-[#162032] border border-gray-200 dark:border-[#1E293B] rounded text-charcoal-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1E293B] font-medium flex items-center gap-1 transition"
                title="Clear Whiteboard"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Clear</span>
              </button>
            </>
          )}

          {/* PNG Download */}
          <button
            onClick={downloadCanvas}
            className="px-2 py-1 bg-white dark:bg-[#162032] border border-gray-200 dark:border-[#1E293B] rounded text-charcoal-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1E293B] font-medium flex items-center gap-1 transition"
            title="Download Current Page as PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">PNG</span>
          </button>

          {/* Export All Pages as PDF Notes */}
          <button
            onClick={exportAllPagesToPdf}
            disabled={isExportingPdf}
            className="px-2.5 py-1 bg-navy-800 dark:bg-emerald-600 hover:bg-navy-900 dark:hover:bg-emerald-500 disabled:opacity-60 text-white rounded font-medium flex items-center gap-1 shadow-sm transition"
            title="Export All Whiteboard Pages as PDF Notes"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
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
          <div className="absolute inset-0 bg-white/85 dark:bg-[#0A0F1D]/90 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10 transition-colors">
            <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-3 shadow-subtle">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-navy-800 dark:text-white mb-1">
              Whiteboard Access Locked
            </h3>
            <p className="text-xs text-charcoal-600 dark:text-slate-300 max-w-sm mb-4 leading-relaxed">
              Drawing access is currently restricted by your instructor. You will be able to draw, solve formulas, and write once your teacher grants permission.
            </p>
            <button
              onClick={handleRequestWhiteboardAccess}
              disabled={accessRequestSent}
              className="px-5 py-2.5 bg-navy-800 dark:bg-emerald-600 hover:bg-navy-900 dark:hover:bg-emerald-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Hand className="w-4 h-4" />
              <span>{accessRequestSent ? 'Access Requested — Waiting for Teacher...' : 'Request Whiteboard Access'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

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
          
          {/* Subject Track Indicator & Switcher */}
          <div className="hidden lg:flex items-center gap-1.5">
            {isComputerScienceClass ? (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 flex items-center gap-1.5 shadow-xs">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>CS Class (Python/Java)</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-navy-950 border border-navy-800 text-gray-300 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-gray-400" />
                <span>Mathematics Class</span>
              </span>
            )}

            {userRole === 'teacher' && (
              <select
                value={isComputerScienceClass ? 'Computer Science' : 'Mathematics'}
                onChange={(e) => {
                  const newSubj = e.target.value;
                  setClassSubject(newSubj);
                  if (channelRef.current) {
                    channelRef.current.send({
                      type: 'broadcast',
                      event: 'subject_change',
                      payload: { subject: newSubj },
                    });
                  }
                }}
                className="bg-navy-950 text-gray-300 border border-navy-800 hover:border-navy-700 rounded-lg px-2 py-1 text-[11px] font-medium cursor-pointer focus:outline-none"
                title="Educator track toggle: Switch room between Computer Science and Mathematics"
              >
                <option value="Computer Science">Track: Computer Science</option>
                <option value="Mathematics">Track: Mathematics</option>
              </select>
            )}
          </div>

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

          {/* Live Session Recording Controls */}
          {userRole === 'teacher' ? (
            !isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-2.5 py-1 bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                title="Record lesson video and audio for student review and playback"
              >
                <Circle className="w-3 h-3 fill-red-500 text-red-500 animate-pulse" />
                <span className="hidden sm:inline">Record Lesson</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-500 rounded-lg px-2.5 py-1 text-xs">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="font-mono font-bold text-red-300">
                  REC {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                </span>
                <button
                  onClick={handleStopRecording}
                  className="ml-1 px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold transition flex items-center gap-1"
                  title="Stop recording and review video"
                >
                  <Square className="w-2.5 h-2.5 fill-white" />
                  <span>Stop</span>
                </button>
              </div>
            )
          ) : (
            remoteRecordingActive && (
              <div className="hidden sm:flex items-center gap-1.5 bg-red-950/80 border border-red-500/60 rounded-lg px-2.5 py-1 text-xs text-red-300 animate-pulse">
                <Radio className="w-3.5 h-3.5 text-red-400" />
                <span className="font-semibold text-[11px]">REC (Session being recorded)</span>
              </div>
            )
          )}

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

        {/* INTERACTIVE WORKSPACE PANE: CS Studio (Code / Split / Whiteboard) or Mathematics Whiteboard */}
        {(viewMode === 'split' || viewMode === 'whiteboard_only') && (
          <div className={`${
            viewMode === 'split' ? 'w-full lg:w-1/2 border-l border-navy-800 dark:border-[#1E293B]' : 'flex-1'
          } bg-white dark:bg-[#0E1526] flex flex-col text-charcoal-800 dark:text-slate-200 relative shadow-2xl overflow-hidden`}>
            
            {/* Exclusive CS Workspace Tab Bar (Only displayed for Computer Science / Coding lessons) */}
            {isComputerScienceClass && (
              <div className="h-10 bg-[#161B22] border-b border-[#30363D] px-3 sm:px-4 flex items-center justify-between text-xs flex-shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span>CS Workspace:</span>
                  </span>
                  <div className="bg-[#0D1117] p-0.5 rounded-lg border border-[#30363D] flex items-center">
                    <button
                      onClick={() => setCsWorkspaceTab('code')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                        csWorkspaceTab === 'code' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Live Code Editor
                    </button>
                    <button
                      onClick={() => setCsWorkspaceTab('split')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                        csWorkspaceTab === 'split' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Split (Code + Board)
                    </button>
                    <button
                      onClick={() => setCsWorkspaceTab('whiteboard')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                        csWorkspaceTab === 'whiteboard' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Whiteboard
                    </button>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Python & Java Studio</span>
                </div>
              </div>
            )}

            {/* Main Interactive Content: Exclusively Code / Split / Board in CS; Pure Whiteboard in Math */}
            {isComputerScienceClass ? (
              csWorkspaceTab === 'code' ? (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <LiveCodeEditor
                    code={code}
                    onChange={handleCodeChange}
                    language={codeLanguage}
                    onLanguageChange={handleLanguageChange}
                    canEdit={canDraw}
                    onRun={handleRunCode}
                    remoteOutput={remoteConsoleOutput}
                  />
                </div>
              ) : csWorkspaceTab === 'split' ? (
                <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden">
                  <div className="flex-1 h-1/2 xl:h-full overflow-hidden border-b xl:border-b-0 xl:border-r border-[#1E293B]">
                    <LiveCodeEditor
                      code={code}
                      onChange={handleCodeChange}
                      language={codeLanguage}
                      onLanguageChange={handleLanguageChange}
                      canEdit={canDraw}
                      onRun={handleRunCode}
                      remoteOutput={remoteConsoleOutput}
                    />
                  </div>
                  <div className="flex-1 h-1/2 xl:h-full flex flex-col overflow-hidden relative">
                    {renderWhiteboard()}
                  </div>
                </div>
              ) : (
                renderWhiteboard()
              )
            ) : (
              renderWhiteboard()
            )}

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

      {/* Post-Lesson Review Modal for Students on Session Exit */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            router.push('/dashboard/student');
          }}
          onSuccess={() => {
            setTimeout(() => {
              router.push('/dashboard/student');
            }, 1000);
          }}
          tutorId={
            canonicalRoomName.includes('room-tutor-')
              ? canonicalRoomName.replace('room-tutor-', '')
              : canonicalRoomName.replace('room-', '')
          }
          tutorName="Your Educator"
          subject="Classly Live Lesson"
          studentId={currentUserId || undefined}
          studentName={userName}
        />
      )}

      {/* In-Classroom Session Recording Complete Modal */}
      {showRecordingCompleteModal && (
        <RecordingCompleteModal
          isOpen={showRecordingCompleteModal}
          onClose={() => setShowRecordingCompleteModal(false)}
          recordedBlob={recordedBlob}
          recordedUrl={recordedUrl}
          durationSeconds={recordingSeconds}
          sessionId={canonicalRoomName}
          subject={classSubject}
          teacherId={userRole === 'teacher' ? (currentUserId || undefined) : undefined}
          teacherName={userRole === 'teacher' ? userName : 'Classly Educator'}
          studentId={userRole === 'student' ? (currentUserId || undefined) : undefined}
          studentName={userRole === 'student' ? userName : 'Student'}
          onSaved={() => {
            // Keep modal open with success badge
          }}
        />
      )}

    </div>
  );
}
