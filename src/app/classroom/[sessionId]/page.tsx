'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Share2, 
  MessageSquare, 
  Hand, 
  PhoneOff, 
  PenTool, 
  Eraser, 
  Download, 
  Send,
  ShieldCheck,
  X,
  Loader2
} from 'lucide-react';
import { mockTutors } from '@/lib/data/mockTutors';

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.sessionId as string) || 'room-session-active';
  const tutor = mockTutors[0];

  // LiveKit Connection State
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [liveKitUrl, setLiveKitUrl] = useState<string>('wss://classly-cq8rvxev.livekit.cloud');
  const [connecting, setConnecting] = useState(true);

  // Media Controls State
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'whiteboard' | 'files' | null>('whiteboard');

  // Chat State
  const [messages, setMessages] = useState([
    { id: '1', sender: tutor.full_name, role: 'teacher', text: 'Welcome Ethan! Let’s begin with problem 4 from yesterday’s calculus sheet.', time: '05:01 PM' },
    { id: '2', sender: 'Ethan Miller', role: 'student', text: 'Hi Dr. Sharma, I have my notes open!', time: '05:02 PM' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

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

  // Fetch real LiveKit token from server
  useEffect(() => {
    async function initLiveKit() {
      try {
        const res = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: sessionId,
            participantName: 'Classly Learner',
            identity: `learner-${Math.random().toString(36).substring(2, 8)}`,
            isTeacher: false,
          }),
        });
        const data = await res.json();
        if (data.token) {
          setLiveKitToken(data.token);
          if (data.wsUrl) setLiveKitUrl(data.wsUrl);
        }
      } catch (err) {
        console.warn('LiveKit room connection notice:', err);
      } finally {
        setConnecting(false);
      }
    }
    initLiveKit();
  }, [sessionId]);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Canvas drawing helpers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [activeSidePanel]);

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
      ctx.lineWidth = 18;
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'Ethan Miller',
        role: 'student',
        text: inputMsg.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputMsg('');
  };

  return (
    <div className="bg-navy-950 text-white min-h-screen flex flex-col h-screen overflow-hidden select-none">
      
      {/* Top Classroom Bar */}
      <header className="h-14 bg-navy-900 border-b border-navy-800 px-4 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/student" className="font-bold text-sm text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-500 animate-pulse"></span>
            <span>Classly Live Classroom</span>
          </Link>
          <span className="text-navy-700 hidden sm:inline">|</span>
          <span className="text-xs text-gray-300 hidden sm:inline">
            AP Calculus AB with {tutor.full_name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-navy-950 px-3 py-1 rounded-md text-xs font-mono font-semibold text-accent-400 border border-navy-800">
            {formatTimer(seconds)}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-accent-400" />
            <span>Encrypted Room</span>
          </div>
        </div>
      </header>

      {/* Main Classroom Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left / Center Video Stage & Whiteboard Area */}
        <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden bg-navy-950">
          
          {/* Dual Video Grid: Teacher & Student */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-52 sm:h-56 flex-shrink-0">
            
            {/* Teacher Video Box */}
            <div className="relative rounded-xl overflow-hidden bg-navy-900 border border-navy-800 flex items-center justify-center shadow-subtle">
              <Image
                src={tutor.avatar_url}
                alt={tutor.full_name}
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-medium text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-500"></span>
                <span>{tutor.full_name} (Teacher)</span>
              </div>
            </div>

            {/* Student Video Box */}
            <div className="relative rounded-xl overflow-hidden bg-navy-900 border border-navy-800 flex items-center justify-center shadow-subtle">
              {videoActive ? (
                <>
                  <Image
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80"
                    alt="Ethan Miller"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-medium text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Ethan Miller (Student)</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 text-xs">
                  <VideoOff className="w-8 h-8 mb-2" />
                  <span>Camera Disabled</span>
                </div>
              )}

              {isHandRaised && (
                <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 shadow-lift">
                  <Hand className="w-3.5 h-3.5" />
                  <span>Hand Raised</span>
                </div>
              )}
            </div>

          </div>

          {/* Interactive Whiteboard Canvas Area */}
          <div className="flex-1 bg-white rounded-xl border border-navy-800 overflow-hidden relative flex flex-col text-charcoal-800 shadow-lift">
            
            {/* Whiteboard Toolbar */}
            <div className="h-11 bg-gray-100 border-b border-gray-200 px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy-800 flex items-center gap-1.5 mr-2">
                  <PenTool className="w-4 h-4 text-navy-800" />
                  <span>Interactive Whiteboard</span>
                </span>

                <button
                  onClick={() => setTool('pen')}
                  className={`px-2.5 py-1 rounded font-semibold ${tool === 'pen' ? 'bg-navy-800 text-white' : 'bg-white border border-gray-200 text-charcoal-700'}`}
                >
                  Pen
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`px-2.5 py-1 rounded font-semibold ${tool === 'eraser' ? 'bg-navy-800 text-white' : 'bg-white border border-gray-200 text-charcoal-700'}`}
                >
                  Eraser
                </button>

                <div className="flex items-center gap-1 ml-2">
                  {['#183153', '#45A879', '#D9381E', '#3B82F6'].map((color) => (
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
                  className="px-2.5 py-1 bg-white border border-gray-200 rounded text-charcoal-600 hover:bg-gray-50 font-medium"
                >
                  Clear Board
                </button>
              </div>
            </div>

            {/* Drawing Canvas */}
            <div className="flex-1 relative cursor-crosshair overflow-hidden">
              <canvas
                ref={canvasRef}
                width={1200}
                height={700}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-full block bg-white"
              />
            </div>

          </div>

        </div>

        {/* Right Collapsible Panel: Chat / Files */}
        {activeSidePanel && (
          <aside className="w-80 bg-navy-900 border-l border-navy-800 flex flex-col z-10">
            
            {/* Panel Tabs */}
            <div className="h-11 border-b border-navy-800 px-3 flex items-center justify-between text-xs">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveSidePanel('chat')}
                  className={`px-3 py-1 rounded font-semibold ${activeSidePanel === 'chat' ? 'bg-navy-800 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  In-Class Chat
                </button>
                <button
                  onClick={() => setActiveSidePanel('files')}
                  className={`px-3 py-1 rounded font-semibold ${activeSidePanel === 'files' ? 'bg-navy-800 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Lesson Files
                </button>
              </div>
              <button
                onClick={() => setActiveSidePanel(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Content: Chat */}
            {activeSidePanel === 'chat' && (
              <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden text-xs">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex flex-col ${m.role === 'student' ? 'items-end' : 'items-start'}`}>
                      <div className="text-[10px] text-gray-400 mb-0.5">
                        {m.sender} • {m.time}
                      </div>
                      <div className={`p-2.5 rounded-lg max-w-[90%] leading-relaxed ${
                        m.role === 'student' ? 'bg-navy-800 text-white' : 'bg-navy-950 text-gray-200 border border-navy-800'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="mt-3 pt-3 border-t border-navy-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message to your teacher..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    className="flex-1 bg-navy-950 border border-navy-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-navy-600"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-accent-500 hover:bg-accent-600 text-white rounded-md flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Panel Content: Files */}
            {activeSidePanel === 'files' && (
              <div className="p-4 space-y-3 text-xs">
                <h4 className="font-bold text-gray-200">Worksheets & Problem Sets</h4>
                <div className="p-3 bg-navy-950 rounded-lg border border-navy-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Calculus_Derivatives_Practice.pdf</div>
                    <div className="text-[10px] text-gray-400">1.2 MB • Uploaded by {tutor.full_name}</div>
                  </div>
                  <button onClick={() => alert('Downloading file')} className="text-accent-400 hover:underline">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </aside>
        )}

      </div>

      {/* Bottom Classroom Controls Dock */}
      <footer className="h-16 bg-navy-900 border-t border-navy-800 px-4 flex items-center justify-between z-20">
        
        {/* Left: Room Status */}
        <div className="text-xs text-gray-400 hidden sm:block">
          Room: <span className="text-gray-200 font-mono">#{sessionId}</span>
        </div>

        {/* Center: Controls Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
          
          {/* Mic */}
          <button
            onClick={() => setMicActive(!micActive)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              micActive ? 'bg-navy-800 text-white hover:bg-navy-700' : 'bg-red-500/90 text-white hover:bg-red-600'
            }`}
            title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Camera */}
          <button
            onClick={() => setVideoActive(!videoActive)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              videoActive ? 'bg-navy-800 text-white hover:bg-navy-700' : 'bg-red-500/90 text-white hover:bg-red-600'
            }`}
            title={videoActive ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {videoActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              isScreenSharing ? 'bg-accent-500 text-white' : 'bg-navy-800 text-white hover:bg-navy-700'
            }`}
            title="Share Screen"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Raise Hand */}
          <button
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              isHandRaised ? 'bg-amber-500 text-white' : 'bg-navy-800 text-white hover:bg-navy-700'
            }`}
            title="Raise Hand"
          >
            <Hand className="w-4 h-4" />
          </button>

          {/* Toggle Chat / Side Panel */}
          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'chat' ? null : 'chat')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              activeSidePanel === 'chat' ? 'bg-softblue-200 text-navy-800' : 'bg-navy-800 text-white hover:bg-navy-700'
            }`}
            title="Toggle In-Class Chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Leave Button */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to exit the classroom?')) {
                router.push('/dashboard/student');
              }
            }}
            className="px-4 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs flex items-center gap-1.5 shadow-lift transition ml-2"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave</span>
          </button>

        </div>

        {/* Right: Layout Switcher */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setActiveSidePanel(activeSidePanel ? null : 'chat')}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-navy-800 rounded"
          >
            Toggle Sidebar
          </button>
        </div>

      </footer>

    </div>
  );
}
