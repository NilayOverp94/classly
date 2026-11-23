'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Download, 
  CloudUpload, 
  X, 
  Video, 
  Play, 
  Loader2, 
  Film,
  Sparkles
} from 'lucide-react';

interface RecordingCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  durationSeconds: number;
  sessionId: string;
  subject: string;
  teacherId?: string | null;
  teacherName?: string;
  studentId?: string | null;
  studentName?: string;
  onSaved?: (recording: any) => void;
}

export function RecordingCompleteModal({
  isOpen,
  onClose,
  recordedBlob,
  recordedUrl,
  durationSeconds,
  sessionId,
  subject,
  teacherId = '',
  teacherName = 'Classly Educator',
  studentId = '',
  studentName = 'Student',
  onSaved,
}: RecordingCompleteModalProps) {
  const [title, setTitle] = useState(`${subject} Lesson Recording`);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !recordedUrl) return null;

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getEstimatedSizeMB = () => {
    if (recordedBlob) {
      return (recordedBlob.size / (1024 * 1024)).toFixed(1);
    }
    return (durationSeconds * 0.05).toFixed(1);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = recordedUrl;
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          title,
          subject,
          teacherId,
          teacherName,
          studentId,
          studentName,
          duration: formatDuration(durationSeconds),
          durationSeconds,
          videoUrl: recordedUrl,
          fileSize: `${getEstimatedSizeMB()} MB`,
          chapters: [
            { time: '00:00', title: 'Lesson Start & Concept Review' },
            { time: formatDuration(Math.floor(durationSeconds * 0.4)), title: 'Interactive Solving & Walkthrough' },
            { time: formatDuration(Math.floor(durationSeconds * 0.8)), title: 'Homework Q&A & Wrap Up' },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedSuccess(true);
        if (onSaved) onSaved(data.recording);
      } else {
        alert('Could not save recording metadata to database, but your local download is ready.');
      }
    } catch (err) {
      console.error('Error saving recording:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-[#0c0c0e] border border-[#27272a] text-slate-100 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#27272a] bg-[#121215] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Lesson Recording Ready</h3>
              <p className="text-xs text-slate-400">Review, archive to student dashboard, or download</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#27272a] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Video Preview */}
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-[#27272a]">
            <video
              src={recordedUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center justify-between text-xs bg-[#18181c] p-3 rounded-xl border border-[#27272a]">
            <div>
              <span className="text-slate-400">Duration: </span>
              <strong className="text-amber-400 font-mono">{formatDuration(durationSeconds)}</strong>
            </div>
            <div>
              <span className="text-slate-400">Estimated Size: </span>
              <strong className="text-white">{getEstimatedSizeMB()} MB</strong>
            </div>
            <div>
              <span className="text-slate-400">Subject: </span>
              <strong className="text-white">{subject}</strong>
            </div>
          </div>

          {/* Editable Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Recording Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#18181c] border border-[#27272a] focus:border-amber-400 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
              placeholder="e.g. Calculus: Derivatives Review"
            />
          </div>

          {savedSuccess && (
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center gap-2 text-xs text-amber-300">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Recording successfully archived and linked to student & teacher dashboards!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleSaveToCloud}
              disabled={isSaving || savedSuccess}
              className="w-full sm:flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold disabled:bg-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Cloud...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved to Dashboard</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  <span>Save to Student Dashboard</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="w-full sm:w-auto py-2.5 px-4 bg-[#18181c] hover:bg-[#27272a] text-slate-200 border border-[#27272a] rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
