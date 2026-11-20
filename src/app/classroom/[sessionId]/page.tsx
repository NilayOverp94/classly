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
  Film,
  Calculator,
  TrendingUp,
  Layers,
  Layout
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
import { DesmosMathGrapher } from '@/components/classroom/DesmosMathGrapher';

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

  // Subject & Unified Workspace Mode ('whiteboard' | 'split' | 'grapher' | 'code')
  const searchParams = useSearchParams();
  const urlSubject = searchParams?.get('subject') || 'Mathematics';
  const [classSubject, setClassSubject] = useState<string>(urlSubject);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'whiteboard' | 'split' | 'grapher' | 'code'>('whiteboard');

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

  // Interactive Desmos Grapher & Workspace State
  const [desmosRemoteState, setDesmosRemoteState] = useState<any>(null);
  const desmosFlushTimeoutRef = useRef<any>(null);

  const handleDesmosStateChange = (newState: any) => {
    if (!desmosFlushTimeoutRef.current && channelRef.current && canDraw) {
      desmosFlushTimeoutRef.current = setTimeout(() => {
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'desmos_sync',
            payload: { state: newState },
          });
        }
        desmosFlushTimeoutRef.current = null;
      }, 120);
    }
  };

  const handleWorkspaceTabChange = (newTab: 'whiteboard' | 'split' | 'grapher' | 'code') => {
    setActiveWorkspaceTab(newTab);
    if (channelRef.current && userRole === 'teacher') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'workspace_tab_change',
        payload: { tab: newTab },
      });
    }
  };

  const handleStampGraphToCanvas = (dataUri: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveSnapshot();

    const img = new Image();
    img.onload = () => {
      const maxW = canvas.width * 0.88;
      const maxH = canvas.height * 0.88;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const dx = (canvas.width - drawWidth) / 2;
      const dy = (canvas.height - drawHeight) / 2;

      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
      saveCurrentPageToStore();

      // Automatically switch to split or whiteboard so participants see the stamped graph immediately!
      if (activeWorkspaceTab === 'grapher') {
        setActiveWorkspaceTab('split');
      }

      if (channelRef.current && canDraw) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'stamp_graph',
          payload: {
            dataUri,
            page: currentPageRef.current,
          },
        });
      }
    };
    img.src = dataUri;
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
      .on('broadcast', { event: 'desmos_sync' }, ({ payload }) => {
        if (payload?.state) {
          setDesmosRemoteState(payload.state);
        }
      })
      .on('broadcast', { event: 'workspace_tab_change' }, ({ payload }) => {
        if (payload?.tab) {
          setActiveWorkspaceTab(payload.tab);
        }
      })
      .on('broadcast', { event: 'stamp_graph' }, ({ payload }) => {
        if (payload?.dataUri) {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          const img = new Image();
          img.onload = () => {
            const maxW = canvas.width * 0.88;
            const maxH = canvas.height * 0.88;
            const scale = Math.min(maxW / img.width, maxH / img.height, 1);
            const drawWidth = img.width * scale;
            const drawHeight = img.height * scale;
            const dx = (canvas.width - drawWidth) / 2;
            const dy = (canvas.height - drawHeight) / 2;
            ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
            saveCurrentPageToStore();
          };
          img.src = payload.dataUri;
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
    <div className="flex-1 flex flex-col h-full bg-[#0A0F1D] text-slate-200 relative overflow-hidden">
      {/* Whiteboard Toolbar */}
      <div className="h-11 bg-[#0D1424] border-b border-[#1E293B] px-3 sm:px-4 flex items-center justify-between text-xs flex-shrink-0 gap-2 overflow-x-auto select-none">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="font-medium text-white flex items-center gap-1.5 mr-1">
            <PenTool className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Canvas</span>
          </span>

          {/* If the user can draw, show tools */}
          {canDraw ? (
            <>
              <div className="bg-[#080D1A] p-0.5 rounded-xl border border-[#1E293B] flex items-center shadow-inner">
                <button
                  onClick={() => setTool('pen')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    tool === 'pen' ? 'bg-[#1E293B] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PenTool className="w-3 h-3 text-emerald-400" />
                  <span>Pen</span>
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    tool === 'eraser' ? 'bg-[#1E293B] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eraser className="w-3 h-3 text-slate-400" />
                  <span>Eraser</span>
                </button>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-1.5 px-1">
                {['#183153', '#059669', '#DC2626', '#2563EB', '#7C3AED'].map((color) => (
                  <button
                    key={color}
                    onClick={() => { setPenColor(color); setTool('pen'); }}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border transition-transform hover:scale-110 ${
                      penColor === color && tool === 'pen' 
                        ? 'ring-2 ring-offset-2 ring-offset-[#0D1424] ring-emerald-400 scale-110 border-white' 
                        : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Color: ${color}`}
                  />
                ))}
              </div>

              {/* Stroke Width Selector */}
              <div className="hidden xl:flex items-center bg-[#080D1A] border border-[#1E293B] rounded-xl p-0.5">
                {[
                  { label: 'Fine', width: 2 },
                  { label: 'Medium', width: 4 },
                  { label: 'Bold', width: 7 },
                ].map((sw) => (
                  <button
                    key={sw.width}
                    onClick={() => setStrokeWidth(sw.width)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                      strokeWidth === sw.width ? 'bg-[#1E293B] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
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
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">Drawing Locked</span>
            </div>
          )}
        </div>

        {/* Center / Right Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Whiteboard Page Navigation */}
          <div className="flex items-center bg-[#080D1A] border border-[#1E293B] rounded-xl px-1.5 py-1 shadow-xs">
            <button
              onClick={() => handleSwitchPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-medium text-slate-300 whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handleSwitchPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {canDraw && (
              <button
                onClick={handleAddPage}
                disabled={totalPages >= 15}
                className="ml-1 pl-1.5 border-l border-[#1E293B] py-0.5 text-emerald-400 hover:text-emerald-300 disabled:opacity-30 flex items-center gap-0.5 text-[11px] font-medium transition"
                title="Add New Whiteboard Page"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            )}
          </div>

          {canDraw && (
            <>
              <button
                onClick={handleUndo}
                className="px-2.5 py-1 bg-[#111827] border border-[#1E293B] rounded-xl text-slate-300 hover:text-white hover:border-[#2D3B4F] font-medium flex items-center gap-1.5 transition text-xs shadow-xs"
                title="Undo Stroke"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Undo</span>
              </button>
              <button
                onClick={clearCanvas}
                className="px-2.5 py-1 bg-[#111827] border border-[#1E293B] rounded-xl text-slate-300 hover:text-rose-400 hover:border-rose-500/30 font-medium flex items-center gap-1.5 transition text-xs shadow-xs"
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
            className="px-2.5 py-1 bg-[#111827] border border-[#1E293B] rounded-xl text-slate-300 hover:text-white hover:border-[#2D3B4F] font-medium flex items-center gap-1.5 transition text-xs shadow-xs"
            title="Download Current Page as PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">PNG</span>
          </button>

          {/* Export All Pages as PDF Notes */}
          <button
            onClick={exportAllPagesToPdf}
            disabled={isExportingPdf}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-xs transition text-xs"
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
          <div className="absolute inset-0 bg-[#0A0F1D]/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10 transition-colors">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Whiteboard Drawing Locked
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
              Your instructor is currently presenting. You will be able to draw, solve formulas, and write once granted permission.
            </p>
            <button
              onClick={handleRequestWhiteboardAccess}
              disabled={accessRequestSent}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#1E293B] disabled:text-slate-500 text-white rounded-xl text-xs font-medium transition flex items-center gap-2 shadow-xs"
            >
              <Hand className="w-4 h-4" />
              <span>{accessRequestSent ? 'Access Requested — Waiting for Educator...' : 'Request Drawing Access'}</span>
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
      <header className="h-14 bg-[#0B0F19] border-b border-[#1E293B] px-4 sm:px-6 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link 
            href={userRole === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'} 
            className="font-bold text-sm text-white flex items-center gap-2 hover:opacity-90 transition group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="tracking-tight text-white group-hover:text-emerald-400 transition-colors">Classly Studio</span>
          </Link>
          <span className="text-slate-700 hidden sm:inline">/</span>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="font-medium text-slate-300">{userName}</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {userRole === 'teacher' ? 'Educator' : 'Student'}
            </span>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* View Mode Switcher */}
          <div className="bg-[#080D1A] p-0.5 rounded-xl border border-[#1E293B] flex items-center text-xs shadow-inner">
            <button
              onClick={() => setViewMode('video_only')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'video_only' ? 'bg-[#1E293B] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Video Only
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'split' ? 'bg-[#1E293B] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('whiteboard_only')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'whiteboard_only' ? 'bg-[#1E293B] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Workspace
            </button>
          </div>

          {/* Teacher Whiteboard Permission Controller in Header */}
          {userRole === 'teacher' && (
            <button
              onClick={() => handleToggleStudentWhiteboard(!studentWhiteboardAllowed)}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                studentWhiteboardAllowed
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title={studentWhiteboardAllowed ? 'Click to lock student drawing access' : 'Click to grant student drawing access'}
            >
              {studentWhiteboardAllowed ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Student Drawing: On</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Student Drawing: Locked</span>
                </>
              )}
            </button>
          )}

          {/* Student Whiteboard Permission Badge in Header */}
          {userRole === 'student' && (
            <div className="hidden md:flex items-center">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${
                studentWhiteboardAllowed 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-[#111827] border-[#1E293B] text-slate-400'
              }`}>
                {studentWhiteboardAllowed ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                <span>{studentWhiteboardAllowed ? 'Drawing Active' : 'Drawing Locked'}</span>
              </span>
            </div>
          )}

          {/* Live Session Recording Controls */}
          {userRole === 'teacher' ? (
            !isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium transition flex items-center gap-1.5 shadow-xs"
                title="Record lesson video and audio for student review and playback"
              >
                <Circle className="w-3 h-3 fill-rose-500 text-rose-500 animate-pulse" />
                <span className="hidden sm:inline">Record</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/50 rounded-xl px-3 py-1.5 text-xs">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="font-mono font-medium text-rose-300">
                  REC {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                </span>
                <button
                  onClick={handleStopRecording}
                  className="ml-1 px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-medium transition flex items-center gap-1"
                  title="Stop recording and review video"
                >
                  <Square className="w-2.5 h-2.5 fill-white" />
                  <span>Stop</span>
                </button>
              </div>
            )
          ) : (
            remoteRecordingActive && (
              <div className="hidden sm:flex items-center gap-1.5 bg-rose-950/60 border border-rose-500/40 rounded-xl px-3 py-1.5 text-xs text-rose-300 animate-pulse">
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-medium text-[11px]">REC Active</span>
              </div>
            )
          )}

          {/* Elapsed Timer */}
          <div className="bg-[#111827] px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-emerald-400 border border-[#1E293B] flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {formatTimer(seconds)}
          </div>

          {/* Exit Room Button */}
          <button
            onClick={handleLeaveClassroom}
            className="px-3.5 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-sm transition hover:shadow-rose-950/50"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Floating Alerts & Teacher Request Notifications */}
      {userRole === 'teacher' && pendingStudentRequest && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 px-4 py-2.5 text-xs font-medium flex items-center justify-between z-30 shadow-lg backdrop-blur-xs animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Student <strong className="text-white">{pendingStudentRequest}</strong> has requested drawing access.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleStudentWhiteboard(true)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs transition shadow-xs"
            >
              Grant Access
            </button>
            <button
              onClick={() => setPendingStudentRequest(null)}
              className="p-1 hover:bg-[#1E293B] rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Student Toast Notice */}
      {permissionNotice && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-200 px-4 py-2 text-xs font-medium flex items-center justify-between z-30 shadow-md backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{permissionNotice}</span>
          </div>
          <button onClick={() => setPermissionNotice(null)} className="text-emerald-400 hover:text-white transition">
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

        {/* INTERACTIVE WORKSPACE PANE: Whiteboard, Desmos Grapher, Split, Code Studio */}
        {(viewMode === 'split' || viewMode === 'whiteboard_only') && (
          <div className={`${
            viewMode === 'split' ? 'w-full lg:w-1/2 border-l border-[#1E293B]' : 'flex-1'
          } bg-[#0A0F1D] flex flex-col text-slate-200 relative shadow-2xl overflow-hidden`}>
            
            {/* Unified Workspace Tab Navigation */}
            <div className="h-11 bg-[#0D1424] border-b border-[#1E293B] px-3 sm:px-4 flex items-center justify-between text-xs flex-shrink-0 select-none">
              <div className="flex items-center gap-2">
                <div className="bg-[#080D1A] p-0.5 rounded-xl border border-[#1E293B] flex items-center shadow-inner">
                  <button
                    onClick={() => handleWorkspaceTabChange('whiteboard')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                      activeWorkspaceTab === 'whiteboard'
                        ? 'bg-[#1E293B] text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Whiteboard</span>
                  </button>
                  <button
                    onClick={() => handleWorkspaceTabChange('grapher')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                      activeWorkspaceTab === 'grapher'
                        ? 'bg-[#1E293B] text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5 text-blue-400" />
                    <span>Desmos Grapher</span>
                  </button>
                  <button
                    onClick={() => handleWorkspaceTabChange('split')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                      activeWorkspaceTab === 'split'
                        ? 'bg-[#1E293B] text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5 text-amber-400" />
                    <span>Split View</span>
                  </button>
                  <button
                    onClick={() => handleWorkspaceTabChange('code')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                      activeWorkspaceTab === 'code'
                        ? 'bg-[#1E293B] text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Code Studio</span>
                  </button>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  {activeWorkspaceTab === 'whiteboard' && 'Interactive Collaborative Canvas'}
                  {activeWorkspaceTab === 'grapher' && 'Desmos Graphing Engine'}
                  {activeWorkspaceTab === 'split' && 'Dual Canvas & Grapher Studio'}
                  {activeWorkspaceTab === 'code' && 'OneCompiler Cloud Engine'}
                </span>
              </div>
            </div>

            {/* Main Interactive Content */}
            {activeWorkspaceTab === 'whiteboard' && renderWhiteboard()}

            {activeWorkspaceTab === 'grapher' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <DesmosMathGrapher
                  canEdit={canDraw}
                  userRole={userRole}
                  onStateChange={handleDesmosStateChange}
                  remoteState={desmosRemoteState}
                  onSnapshotToCanvas={handleStampGraphToCanvas}
                  theme="dark"
                />
              </div>
            )}

            {activeWorkspaceTab === 'split' && (
              <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden">
                <div className="flex-1 h-1/2 xl:h-full overflow-hidden border-b xl:border-b-0 xl:border-r border-[#1E293B]">
                  {renderWhiteboard()}
                </div>
                <div className="flex-1 h-1/2 xl:h-full flex flex-col overflow-hidden relative">
                  <DesmosMathGrapher
                    canEdit={canDraw}
                    userRole={userRole}
                    onStateChange={handleDesmosStateChange}
                    remoteState={desmosRemoteState}
                    onSnapshotToCanvas={handleStampGraphToCanvas}
                    theme="dark"
                  />
                </div>
              </div>
            )}

            {activeWorkspaceTab === 'code' && (
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
