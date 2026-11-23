'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  Video, 
  Calendar, 
  Sparkles, 
  X, 
  ChevronRight,
  Radio,
  Flame
} from 'lucide-react';
import { getTimeUntilSession, CalendarEventData } from '@/lib/calendar/calendarSync';
import { CalendarSyncDropdown } from './CalendarSyncDropdown';

interface SessionCountdownBannerProps {
  booking: any;
  userRole?: 'student' | 'teacher';
  onDismiss?: () => void;
}

export function SessionCountdownBanner({
  booking,
  userRole = 'student',
  onDismiss,
}: SessionCountdownBannerProps) {
  const [countdown, setCountdown] = useState(
    getTimeUntilSession(
      booking?.date || booking?.formatted_time || 'Today',
      booking?.time_slot,
      booking?.duration_minutes || 60
    )
  );
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!booking) return;

    const interval = setInterval(() => {
      const updated = getTimeUntilSession(
        booking?.date || booking?.formatted_time || 'Today',
        booking?.time_slot,
        booking?.duration_minutes || 60
      );
      setCountdown(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  if (!booking || isDismissed || countdown.isPast) return null;

  const subject = booking.subject || 'Lesson';
  const partnerName = userRole === 'teacher' 
    ? (booking.student_name || 'Student') 
    : (booking.teacher_name || 'Educator');

  const classroomUrl = booking.meeting_url 
    ? (booking.meeting_url.includes('?') 
        ? `${booking.meeting_url}&subject=${encodeURIComponent(subject)}`
        : `${booking.meeting_url}?subject=${encodeURIComponent(subject)}`)
    : `/classroom/room-${booking.id || booking.bookingId}?subject=${encodeURIComponent(subject)}`;

  const calendarEvent: CalendarEventData = {
    title: `${subject} Tutoring with ${booking.teacher_name || 'Educator'}`,
    subject: subject,
    teacherName: booking.teacher_name || 'Educator',
    studentName: booking.student_name,
    dateStr: booking.date || booking.formatted_time || 'Today',
    timeSlotStr: booking.time_slot,
    durationMinutes: booking.duration_minutes || 60,
    meetingUrl: classroomUrl,
    notes: booking.notes,
  };

  const isStartingSoon = countdown.totalSecondsRemaining <= 1800; // <= 30 minutes
  const isImminent = countdown.isNow || countdown.totalSecondsRemaining <= 900; // <= 15 minutes or now

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-card ${
      isImminent 
        ? 'bg-gradient-to-r from-emerald-900/90 via-[#0B1E28] to-emerald-950 border-emerald-500/60 shadow-emerald-900/20'
        : isStartingSoon
        ? 'bg-gradient-to-r from-blue-950/90 via-[#0D152A] to-navy-950 border-blue-500/50 shadow-blue-900/20'
        : 'bg-white dark:bg-[#121215] border-gray-200 dark:border-[#27272a]'
    }`}>
      {/* Decorative background glow */}
      {isImminent && (
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        {/* Left: Timing Beacon & Details */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${
            isImminent
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 animate-pulse'
              : isStartingSoon
              ? 'bg-blue-500/20 border-blue-400 text-blue-400'
              : 'bg-emerald-50 dark:bg-[#18181c] border-emerald-200 dark:border-[#323238] text-emerald-600 dark:text-amber-400'
          }`}>
            {isImminent ? (
              <Radio className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
            ) : (
              <Clock className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {isImminent ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>{countdown.isNow ? 'Lesson Active Now' : 'Starting Soon'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span>Next Confirmed Lesson</span>
                </span>
              )}

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                subject.toLowerCase().includes('computer')
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
              }`}>
                {subject}
              </span>
            </div>

            <h3 className={`text-base font-bold mt-1 ${isImminent || isStartingSoon ? 'text-white' : 'text-navy-800 dark:text-white'}`}>
              {subject} with {partnerName}
            </h3>

            <div className="flex items-center gap-3 text-xs text-slate-300 dark:text-zinc-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 opacity-70" />
                <span>{booking.formatted_time || `${booking.date} at ${booking.time_slot}`}</span>
              </span>
              <span>•</span>
              <span className="font-medium text-emerald-400">
                60 Mins Encrypted WebRTC
              </span>
            </div>
          </div>
        </div>

        {/* Right: Countdown Clock & Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
          {/* Digital Countdown Pill */}
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {countdown.isNow ? 'Status' : 'Countdown'}
            </span>
            <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1">
              {countdown.isNow ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Live Room Open
                </span>
              ) : (
                <span className={isStartingSoon ? 'text-emerald-400' : 'text-white'}>
                  {countdown.formattedCountdown}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CalendarSyncDropdown
              event={calendarEvent}
              variant={isImminent || isStartingSoon ? 'secondary' : 'secondary'}
              label="Sync"
            />

            <Link
              href={classroomUrl}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                isImminent
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30 animate-pulse'
                  : 'bg-navy-800 hover:bg-navy-900 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-zinc-950 font-bold text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{isImminent ? 'Enter Classroom Now' : 'Join Classroom'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            {onDismiss && (
              <button
                onClick={() => {
                  setIsDismissed(true);
                  if (onDismiss) onDismiss();
                }}
                className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/10"
                title="Dismiss countdown reminder"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
