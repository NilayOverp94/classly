/**
 * Calendar Sync Utility for Classly Tutoring Platform
 * Generates Google Calendar URLs and standard RFC 5545 iCalendar (.ics) files for Apple Calendar & Outlook.
 */

export interface CalendarEventData {
  title: string;
  subject: string;
  teacherName: string;
  studentName?: string;
  dateStr: string;        // e.g. '2026-11-21' or 'Tomorrow at 05:00 PM EST'
  timeSlotStr?: string;    // e.g. '05:00 PM EST'
  durationMinutes?: number;
  meetingUrl: string;     // e.g. '/classroom/room-123'
  notes?: string;
}

/**
 * Parses user booking date & time into Start and End Date objects.
 */
export function parseBookingDates(
  dateStr: string,
  timeSlotStr?: string,
  durationMinutes: number = 60
): { startDate: Date; endDate: Date } {
  const now = new Date();
  let baseDate = new Date();

  // Handle common date formats
  if (dateStr) {
    const trimmed = dateStr.trim().toLowerCase();
    if (trimmed.includes('tomorrow')) {
      baseDate = new Date(now.getTime() + 86400000);
    } else if (trimmed.includes('yesterday')) {
      baseDate = new Date(now.getTime() - 86400000);
    } else if (trimmed.includes('today')) {
      baseDate = new Date();
    } else {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        baseDate = parsed;
      }
    }
  }

  // Extract time: e.g. "05:00 PM", "17:00", "05:00 PM EST"
  const timeSource = timeSlotStr || dateStr || '05:00 PM';
  const timeMatch = timeSource.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);

  let hours = 17;
  let minutes = 0;

  if (timeMatch) {
    let h = parseInt(timeMatch[1], 10);
    const m = parseInt(timeMatch[2], 10);
    const meridiem = timeMatch[3]?.toUpperCase();

    if (meridiem === 'PM' && h < 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;

    hours = h;
    minutes = m;
  }

  const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hours, minutes, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  return { startDate, endDate };
}

/**
 * Formats a Date object to UTC string for Google Calendar and iCal: YYYYMMDDTHHmmssZ
 */
function formatUtcTimestamp(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Builds the absolute classroom meeting URL
 */
function getAbsoluteMeetingUrl(relativeUrl: string): string {
  if (relativeUrl.startsWith('http')) return relativeUrl;
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || 'https://classly-edu.vercel.app');
  return `${baseUrl}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
}

/**
 * Generates a 1-click Google Calendar web link.
 */
export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const { startDate, endDate } = parseBookingDates(event.dateStr, event.timeSlotStr, event.durationMinutes || 60);
  const startIso = formatUtcTimestamp(startDate);
  const endIso = formatUtcTimestamp(endDate);
  const absoluteUrl = getAbsoluteMeetingUrl(event.meetingUrl);

  const eventTitle = `${event.subject} Tutoring with ${event.teacherName} (Classly)`;
  const eventDetails = `Your 1-on-1 ${event.subject} lesson on Classly is confirmed!\n\n` +
    `• Educator: ${event.teacherName}\n` +
    (event.studentName ? `• Student: ${event.studentName}\n` : '') +
    `• Duration: ${event.durationMinutes || 60} Minutes\n` +
    `• Live Classroom Link: ${absoluteUrl}\n\n` +
    (event.notes ? `Lesson Notes: "${event.notes}"\n\n` : '') +
    `To join, open the classroom link above 5 minutes before scheduled start.`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle,
    dates: `${startIso}/${endIso}`,
    details: eventDetails,
    location: absoluteUrl,
    sprop: 'website:classly-edu.vercel.app',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates RFC 5545 iCalendar (.ics) formatted content.
 */
export function generateIcsContent(event: CalendarEventData): string {
  const { startDate, endDate } = parseBookingDates(event.dateStr, event.timeSlotStr, event.durationMinutes || 60);
  const startIso = formatUtcTimestamp(startDate);
  const endIso = formatUtcTimestamp(endDate);
  const nowIso = formatUtcTimestamp(new Date());
  const absoluteUrl = getAbsoluteMeetingUrl(event.meetingUrl);
  const uid = `classly-${Date.now()}-${Math.floor(Math.random() * 100000)}@classly-edu.vercel.app`;

  const title = `${event.subject} Tutoring: ${event.teacherName} - Classly`;
  const description = `Your live tutoring session on Classly.\\n\\n` +
    `Educator: ${event.teacherName}\\n` +
    (event.studentName ? `Student: ${event.studentName}\\n` : '') +
    `Subject: ${event.subject}\\n` +
    `Duration: ${event.durationMinutes || 60} mins\\n` +
    `Live Room: ${absoluteUrl}\\n\\n` +
    (event.notes ? `Notes: ${event.notes}\\n` : '') +
    `Join with camera and audio enabled.`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Classly Education//Tutoring Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowIso}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${absoluteUrl}`,
    `URL:${absoluteUrl}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Your Classly live lesson starts in 15 minutes!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers direct browser download of an iCalendar (.ics) file.
 */
export function downloadIcsFile(event: CalendarEventData): void {
  const icsText = generateIcsContent(event);
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeFilename = `${event.subject.replace(/[^a-zA-Z0-9]/g, '_')}_Classly_Lesson.ics`;

  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Calculates remaining time until session start for live countdown.
 */
export function getTimeUntilSession(
  dateStr: string,
  timeSlotStr?: string,
  durationMinutes: number = 60
): {
  isPast: boolean;
  isNow: boolean;
  totalSecondsRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  formattedCountdown: string;
} {
  const { startDate, endDate } = parseBookingDates(dateStr, timeSlotStr, durationMinutes);
  const now = new Date();
  const diffMs = startDate.getTime() - now.getTime();
  const endDiffMs = endDate.getTime() - now.getTime();

  // If ongoing right now
  const isNow = diffMs <= 0 && endDiffMs > 0;
  // If ended
  const isPast = endDiffMs <= 0;

  if (isPast) {
    return {
      isPast: true,
      isNow: false,
      totalSecondsRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      secondsRemaining: 0,
      formattedCountdown: 'Lesson Completed',
    };
  }

  if (isNow) {
    return {
      isPast: false,
      isNow: true,
      totalSecondsRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      secondsRemaining: 0,
      formattedCountdown: 'Live in Progress',
    };
  }

  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formatted = '';
  if (days > 0) {
    formatted = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return {
    isPast: false,
    isNow: false,
    totalSecondsRemaining: totalSeconds,
    hoursRemaining: hours + days * 24,
    minutesRemaining: minutes,
    secondsRemaining: seconds,
    formattedCountdown: formatted,
  };
}
