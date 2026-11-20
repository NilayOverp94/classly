'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Download, 
  ExternalLink, 
  Check, 
  Copy, 
  Share2 
} from 'lucide-react';
import { 
  CalendarEventData, 
  generateGoogleCalendarUrl, 
  downloadIcsFile 
} from '@/lib/calendar/calendarSync';

interface CalendarSyncDropdownProps {
  event: CalendarEventData;
  variant?: 'primary' | 'secondary' | 'subtle' | 'compact';
  className?: string;
  label?: string;
}

export function CalendarSyncDropdown({
  event,
  variant = 'secondary',
  className = '',
  label = 'Add to Calendar',
}: CalendarSyncDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleIcsDownload = () => {
    downloadIcsFile(event);
    setIsOpen(false);
  };

  const handleCopyClassroomLink = () => {
    const baseUrl = window.location.origin;
    const fullUrl = event.meetingUrl.startsWith('http') 
      ? event.meetingUrl 
      : `${baseUrl}${event.meetingUrl.startsWith('/') ? '' : '/'}${event.meetingUrl}`;

    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      setIsOpen(false);
    });
  };

  // Button styling variants
  let btnClasses = 'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition select-none ';
  if (variant === 'primary') {
    btnClasses += 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs';
  } else if (variant === 'subtle') {
    btnClasses += 'bg-transparent hover:bg-gray-100 dark:hover:bg-[#162032] text-charcoal-700 dark:text-slate-300 border border-transparent';
  } else if (variant === 'compact') {
    btnClasses += 'px-2 py-1 text-[11px] bg-gray-50 hover:bg-gray-100 dark:bg-[#162032] dark:hover:bg-[#1E293B] text-charcoal-700 dark:text-slate-300 border border-gray-200 dark:border-[#2D3B4F]';
  } else {
    btnClasses += 'bg-white hover:bg-gray-50 dark:bg-[#162032] dark:hover:bg-[#1E293B] text-charcoal-800 dark:text-slate-200 border border-gray-200 dark:border-[#2D3B4F] shadow-xs';
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={btnClasses}
        title="Sync lesson to your personal calendar"
      >
        <Calendar className="w-3.5 h-3.5 text-navy-800 dark:text-emerald-400" />
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 text-charcoal-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-[#1E293B] shadow-xl z-40 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-gray-100 dark:border-[#1E293B] mb-1">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 dark:text-slate-400 tracking-wider">
              Sync Lesson Schedule
            </span>
          </div>

          {/* Google Calendar Option */}
          <button
            onClick={handleGoogleCalendar}
            className="w-full px-3 py-2 text-left text-xs font-medium text-charcoal-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-[#162032] flex items-center justify-between group transition"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                G
              </span>
              <span>Google Calendar</span>
            </div>
            <ExternalLink className="w-3 h-3 text-charcoal-400 group-hover:text-blue-500 transition" />
          </button>

          {/* Apple Calendar / Outlook .ics Option */}
          <button
            onClick={handleIcsDownload}
            className="w-full px-3 py-2 text-left text-xs font-medium text-charcoal-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-[#162032] flex items-center justify-between group transition"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Apple / Outlook (.ics)</span>
            </div>
            <span className="text-[10px] text-charcoal-400">Download</span>
          </button>

          {/* Copy Classroom Link */}
          <div className="border-t border-gray-100 dark:border-[#1E293B] mt-1 pt-1">
            <button
              onClick={handleCopyClassroomLink}
              className="w-full px-3 py-2 text-left text-xs font-medium text-charcoal-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-[#162032] flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-2">
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-charcoal-400 dark:text-slate-400" />
                )}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Classroom Link'}</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
