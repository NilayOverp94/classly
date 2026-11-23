'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Download, 
  Share2, 
  Clock, 
  Calendar, 
  BookOpen, 
  User, 
  Check, 
  Sparkles,
  ListVideo
} from 'lucide-react';
import { SessionRecording } from '@/lib/types';

interface RecordingPlaybackModalProps {
  recording: SessionRecording | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RecordingPlaybackModal({
  recording,
  isOpen,
  onClose,
}: RecordingPlaybackModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying]);

  if (!isOpen || !recording) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || recording.duration_seconds || 1800);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleJumpToChapter = (chapterTimeStr: string) => {
    const parts = chapterTimeStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      if (!isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = recording.video_url;
    a.download = `${recording.title.replace(/[^a-zA-Z0-9]/g, '_')}_Classly.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/classroom/${recording.session_id}?playback=${recording.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-[#09090b] border border-[#27272a] text-slate-100 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#27272a] bg-[#121215] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ListVideo className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${
                  recording.subject.toLowerCase().includes('computer')
                    ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                    : 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
                }`}>
                  {recording.subject}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{recording.date}</span>
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{recording.duration}</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white truncate mt-1">
                {recording.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#18181c] hover:bg-[#27272a] text-slate-300 hover:text-white border border-[#27272a] text-xs font-semibold flex items-center gap-1.5 transition"
              title="Copy Shareable Recording Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-amber-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              title="Download Recording Video"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#18181c] hover:bg-[#27272a] text-slate-400 hover:text-white transition"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player & Main Viewport */}
        <div className="relative bg-black flex-1 flex flex-col justify-center items-center overflow-hidden group select-none min-h-[300px] sm:min-h-[420px]">
          <video
            ref={videoRef}
            src={recording.video_url}
            poster={recording.thumbnail_url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            playsInline
            className="w-full h-full max-h-[58vh] object-contain cursor-pointer"
          />

          {/* Big Center Play Overlay Button when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-400/90 hover:bg-amber-300 text-zinc-950 font-bold text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 z-10 backdrop-blur-sm"
              aria-label="Play recording"
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white" />
            </button>
          )}

          {/* Player Controls Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 sm:p-4 transition-opacity flex flex-col gap-2 z-20">
            {/* Scrubber Bar */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max={duration || recording.duration_seconds || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:h-2 transition-all"
              />
            </div>

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={togglePlay}
                  className="p-1.5 hover:text-white transition"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1.5 hover:text-white transition"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <span className="font-mono text-slate-400">
                  <strong className="text-white">{formatSeconds(currentTime)}</strong> / {formatSeconds(duration || recording.duration_seconds || 0)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Speed Selector */}
                <div className="flex items-center bg-black/40 border border-slate-700/80 rounded-lg p-0.5">
                  {[1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                        playbackSpeed === speed
                          ? 'bg-amber-400 text-zinc-950 font-bold text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.requestFullscreen) {
                        videoRef.current.requestFullscreen();
                      }
                    }
                  }}
                  className="p-1.5 hover:text-white transition"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters & Lesson Meta Footer */}
        <div className="p-4 sm:p-5 bg-[#0F172A] border-t border-[#27272a] grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Chapter Timeline Jump Marks */}
          <div className="md:col-span-8">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Session Chapters & Timestamps</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recording.chapters && recording.chapters.length > 0 ? (
                recording.chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleJumpToChapter(ch.time)}
                    className="p-2.5 rounded-xl bg-[#18181c] hover:bg-[#27272a] border border-[#27272a] hover:border-amber-500/40 text-left transition flex items-center justify-between group"
                  >
                    <span className="text-xs text-slate-300 group-hover:text-white font-medium truncate mr-2">
                      {ch.title}
                    </span>
                    <span className="px-2 py-0.5 bg-[#121215] text-amber-400 rounded text-[10px] font-mono font-bold shrink-0">
                      {ch.time}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic py-2">
                  No automated chapter markers recorded for this session.
                </div>
              )}
            </div>
          </div>

          {/* Session Metadata Card */}
          <div className="md:col-span-4 bg-[#141E33] border border-[#27272a] rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Lesson Details</span>
              <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Educator:</span>
                  <span className="font-semibold text-white">{recording.teacher_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-semibold text-white">{recording.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Session ID:</span>
                  <span className="font-mono text-amber-400">{recording.session_id}</span>
                </div>
                {recording.file_size && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Size:</span>
                    <span className="text-slate-300">{recording.file_size}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="mt-3 w-full py-2 bg-amber-400 text-zinc-950 font-bold/20 hover:bg-amber-400 text-zinc-950 font-bold/30 text-amber-400 border border-amber-500/40 hover:border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Offline (.mp4)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
