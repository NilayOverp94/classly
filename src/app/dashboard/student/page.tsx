'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  CreditCard, 
  Settings, 
  User, 
  ShieldCheck, 
  LogOut,
  ArrowRight,
  Sparkles,
  Inbox,
  Star,
  CheckCircle2,
  Film,
  Play,
  Download,
  Search,
  HardDrive,
  Gift,
  Package,
  Layers,
  Award
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { FadeIn } from '@/components/ui/MotionComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { SessionRecording, StudentPrepaidPackage, ReferralProfile } from '@/lib/types';
import { RecordingPlaybackModal } from '@/components/classroom/RecordingPlaybackModal';
import { SessionCountdownBanner } from '@/components/calendar/SessionCountdownBanner';
import { CalendarSyncDropdown } from '@/components/calendar/CalendarSyncDropdown';
import { ReferralShareCard } from '@/components/referrals/ReferralShareCard';
import { getInitialReferralProfile } from '@/lib/referrals/referralService';

export default function StudentDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Real user bookings and state (clean initial state, NO hardcoded fake stats)
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [bookedTutors, setBookedTutors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [activeReviewBooking, setActiveReviewBooking] = useState<any | null>(null);

  // Lesson Packages & Referral state
  const [prepaidPackages, setPrepaidPackages] = useState<StudentPrepaidPackage[]>([]);
  const [referralProfile, setReferralProfile] = useState<ReferralProfile | null>(null);

  // Session Recordings state
  const [recordings, setRecordings] = useState<SessionRecording[]>([]);
  const [activePlaybackRecording, setActivePlaybackRecording] = useState<SessionRecording | null>(null);
  const [recordingFilter, setRecordingFilter] = useState<'all' | 'mathematics' | 'computer_science'>('all');
  const [recordingSearchQuery, setRecordingSearchQuery] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;
        
        if (!currentUser) {
          const { data: { user: fetchedUser } } = await supabase.auth.getUser();
          if (!fetchedUser) {
            router.replace('/login');
            return;
          }
          handleUserRouting(fetchedUser);
        } else {
          handleUserRouting(currentUser);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    const handleUserRouting = async (u: any) => {
      const email = (u.email || '').toLowerCase().trim();
      // Automatic Admin routing
      if (email === 'milayraj713@gmail.com' || email === 'nilayraj713@gmail.com') {
        router.replace('/admin');
        return;
      }
      if (u.user_metadata?.role === 'teacher') {
        router.replace('/dashboard/teacher');
        return;
      }
      setUser(u);

      // Hydrate prepaid packages and referral profile from user metadata
      const pkgs: StudentPrepaidPackage[] = u.user_metadata?.prepaid_packages || [];
      setPrepaidPackages(pkgs);
      const refProf = getInitialReferralProfile(u);
      setReferralProfile(refProf);

      // Fetch confirmed student bookings from API
      try {
        const res = await fetch(`/api/bookings?userId=${u.id}&role=student`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const bookingsList: any[] = data.bookings || [];
          setUpcomingBookings(bookingsList);

          // Populate booked tutors
          const tutorMap = new Map();
          bookingsList.forEach((b: any) => {
            if (b.teacher_id && !tutorMap.has(b.teacher_id)) {
              tutorMap.set(b.teacher_id, {
                id: b.teacher_id,
                full_name: b.teacher_name,
                avatar_url: b.teacher_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.teacher_name)}&background=0B121E&color=ffffff&size=256&bold=true`,
                subjects: [b.subject],
              });
            }
          });
          setBookedTutors(Array.from(tutorMap.values()));

          // Populate payments & receipts
          const payments = bookingsList.map((b: any) => ({
            date: b.date || (b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recent'),
            description: `1-on-1 ${b.subject} Session with ${b.teacher_name}`,
            amount: b.total_amount ? Number(b.total_amount).toFixed(2) : ((Number(b.hourly_rate) || 25) + 4.5).toFixed(2),
            status: 'Paid & Confirmed',
          }));
          setPaymentHistory(payments);
        }

        // Fetch student's session recordings
        const recRes = await fetch(`/api/recordings?userId=${u.id}&role=student`, { cache: 'no-store' });
        if (recRes.ok) {
          const recData = await recRes.json();
          if (Array.isArray(recData.recordings)) {
            setRecordings(recData.recordings);
          }
        }
      } catch (err) {
        console.error('Failed to load student bookings/recordings:', err);
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const [activeTab, setActiveTab] = useState<
    'upcoming' | 'past' | 'recordings' | 'tutors' | 'materials' | 'payments' | 'referrals' | 'settings'
  >('upcoming');

  if (loading) {
    return (
      <div className="bg-offwhite dark:bg-[#09090b] min-h-screen py-16 flex items-center justify-center transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-navy-800/20 dark:border-amber-500/40/20 border-t-navy-800 dark:border-t-amber-400 rounded-full animate-spin" />
          <span className="text-xs text-charcoal-500 dark:text-zinc-400 font-medium">Loading your student dashboard...</span>
        </div>
      </div>
    );
  }

  // Real user display info from authentication session
  const displayName = 
    user?.user_metadata?.student_name ||
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    user?.email?.split('@')[0] || 
    'Student';

  const userEmail = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const gradeLevel = user?.user_metadata?.student_grade || 'K-12 Student';

  return (
    <div className="bg-offwhite dark:bg-[#09090b] min-h-screen py-8 border-b border-gray-200 dark:border-[#27272a] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Real User Profile Banner */}
        <FadeIn direction="up" delay={0.05} duration={0.45}>
          <div className="bg-white dark:bg-[#121215] p-6 rounded-2xl border border-gray-200/90 dark:border-[#27272a] shadow-subtle hover:shadow-card transition-shadow mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-navy-800 dark:bg-[#18181c] text-white border border-gray-200 dark:border-[#323238] flex-shrink-0 flex items-center justify-center shadow-sm">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold uppercase tracking-wider">
                    {displayName.charAt(0)}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-navy-800 dark:text-white">
                    {displayName}
                  </h1>
                  <span className="text-[11px] font-semibold text-accent-700 dark:text-amber-300 bg-accent-50 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-accent-200 dark:border-amber-800/40">
                    {gradeLevel}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500 dark:text-zinc-400 mt-0.5">
                  Logged in as <strong>{userEmail}</strong> • Active Learning Account
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/tutors"
                className="px-4 py-2 bg-navy-800 hover:bg-navy-900 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-zinc-950 font-bold text-white rounded-lg text-xs font-semibold shadow-subtle transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>+ Book a Tutor</span>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Dashboard Grid: Sidebar (3 cols) + Active Panel (9 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle p-4 space-y-1">
            <div className="text-[11px] font-semibold text-charcoal-400 dark:text-zinc-400 uppercase tracking-wider px-3 py-2">
              Student Navigation
            </div>

            {[
              { id: 'upcoming', label: 'Upcoming Lessons', icon: <Calendar className="w-4 h-4" />, count: upcomingBookings.length },
              { id: 'referrals', label: 'Referrals & Rewards', icon: <Gift className="w-4 h-4 text-emerald-500" />, badge: '$20' },
              { id: 'past', label: 'Lesson History', icon: <Clock className="w-4 h-4" /> },
              { id: 'recordings', label: 'Session Recordings', icon: <Film className="w-4 h-4" />, count: recordings.length },
              { id: 'tutors', label: 'My Tutors', icon: <User className="w-4 h-4" />, count: bookedTutors.length },
              { id: 'materials', label: 'Learning Materials', icon: <FileText className="w-4 h-4" />, count: materials.length },
              { id: 'payments', label: 'Payments & Receipts', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'settings', label: 'Account & Safety Settings', icon: <Settings className="w-4 h-4" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-navy-800 dark:bg-amber-400 dark:text-zinc-950 font-bold text-white shadow-subtle'
                    : 'text-charcoal-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-[#18181c] hover:text-navy-800 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-amber-950/40 dark:text-amber-300 border border-emerald-300 dark:border-amber-700/40">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    activeTab === item.id ? 'bg-navy-900 dark:bg-amber-500 text-white' : 'bg-softblue-100 dark:bg-[#18181c] text-navy-800 dark:text-amber-400 border border-transparent dark:border-[#323238]'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-4 border-t border-gray-100 dark:border-[#27272a] mt-4">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          {/* Active Tab Panel with Fluid Transitions */}
          <main className="lg:col-span-9 space-y-6">
            {/* Live Session Countdown & Sync Banner */}
            {upcomingBookings.length > 0 && (
              <SessionCountdownBanner booking={upcomingBookings[0]} userRole="student" />
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* TAB: Upcoming Lessons */}
            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-navy-800 dark:text-white">
                    Confirmed Upcoming Lessons
                  </h2>
                  <span className="text-xs text-charcoal-500 dark:text-zinc-400">Live WebRTC Classrooms</span>
                </div>

                {/* Active Prepaid Lesson Packages Card */}
                {prepaidPackages.filter(p => (p.remainingLessons || 0) > 0).length > 0 && (
                  <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-amber-950/30 dark:via-zinc-900/40 dark:to-zinc-900/20 border border-emerald-200 dark:border-amber-800/40 rounded-2xl p-5 shadow-sm space-y-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500 text-white dark:bg-amber-400 dark:text-zinc-950 font-bold shadow-sm">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                            <span>Prepaid Lesson Credits Ready to Schedule</span>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-amber-950/40 dark:text-amber-300">
                              $0 Checkout
                            </span>
                          </h3>
                          <p className="text-xs text-charcoal-500 dark:text-zinc-400">
                            You have prepaid bundle credits with your saved tutors. Schedule upcoming dates anytime.
                          </p>
                        </div>
                      </div>
                      <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-white dark:bg-[#121215] text-emerald-700 dark:text-amber-300 border border-emerald-200 dark:border-amber-800/40 shadow-subtle">
                        {prepaidPackages.reduce((acc, p) => acc + (p.remainingLessons || 0), 0)} Credits Available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {prepaidPackages.filter(p => (p.remainingLessons || 0) > 0).map((pkg) => (
                        <div key={pkg.id} className="bg-white dark:bg-[#121215] rounded-xl p-4 border border-gray-200 dark:border-[#27272a] shadow-subtle flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-navy-800 dark:text-white">{pkg.subject}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60">
                                {pkg.packageTier || pkg.totalLessons || 5}-Lesson Pack
                              </span>
                            </div>
                            <p className="text-xs text-charcoal-600 dark:text-zinc-300">
                              Tutor: <strong>{pkg.teacherName}</strong>
                            </p>
                            <div className="mt-3 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-charcoal-500 dark:text-zinc-400">Credits:</span>
                                <span className="font-extrabold text-emerald-600 dark:text-amber-400">
                                  {pkg.remainingLessons} of {pkg.totalLessons} remaining
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 dark:bg-[#202025] h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-500 dark:bg-amber-400 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.round(((pkg.totalLessons - (pkg.remainingLessons || 0)) / (pkg.totalLessons || 1)) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/booking/${pkg.teacherId}?useCredit=true`}
                            className="mt-4 w-full py-2 bg-navy-800 hover:bg-navy-900 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-zinc-950 font-bold text-white rounded-lg text-xs font-bold text-center shadow-subtle transition flex items-center justify-center gap-1.5"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Schedule Lesson ($0)</span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white dark:bg-[#121215] p-6 rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#18181c] border border-gray-200 dark:border-[#323238] flex-shrink-0">
                          <Image
                            src={b.teacher_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={b.teacher_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-navy-800 dark:text-white">{b.subject}</h3>
                            <span className="px-2 py-0.5 rounded bg-accent-50 dark:bg-amber-950/30 text-accent-700 dark:text-amber-300 text-[11px] font-semibold border border-accent-200 dark:border-amber-800/40">
                              Confirmed
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-600 dark:text-zinc-300 mt-0.5">
                            with <strong>{b.teacher_name}</strong> • 1-on-1 Session ({b.duration_minutes} mins)
                          </p>
                          <div className="flex items-center gap-2 text-xs text-charcoal-500 dark:text-zinc-400 mt-2">
                            <Clock className="w-3.5 h-3.5 text-accent-500 dark:text-amber-400" />
                            <span>{b.formatted_time || b.start_time || `${b.date} at ${b.time_slot}`}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2.5">
                        <CalendarSyncDropdown
                          event={{
                            title: `${b.subject} Tutoring with ${b.teacher_name}`,
                            subject: b.subject,
                            teacherName: b.teacher_name,
                            studentName: displayName,
                            dateStr: b.date || b.formatted_time,
                            timeSlotStr: b.time_slot,
                            durationMinutes: b.duration_minutes || 60,
                            meetingUrl: b.meeting_url || `/classroom/room-tutor-${b.teacher_id}?subject=${encodeURIComponent(b.subject || 'Mathematics')}`,
                            notes: b.notes,
                          }}
                          variant="secondary"
                        />
                        <Link
                          href={b.meeting_url ? (b.meeting_url.includes('?') ? `${b.meeting_url}&subject=${encodeURIComponent(b.subject || 'Mathematics')}` : `${b.meeting_url}?subject=${encodeURIComponent(b.subject || 'Mathematics')}`) : (b.teacher_id ? `/classroom/room-tutor-${b.teacher_id}?subject=${encodeURIComponent(b.subject || 'Mathematics')}` : `/classroom/room-${b.id}?subject=${encodeURIComponent(b.subject || 'Mathematics')}`)}
                          className="w-full md:w-auto px-5 py-2.5 bg-navy-800 hover:bg-navy-900 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-zinc-950 font-bold text-white rounded-lg text-xs font-bold transition shadow-subtle flex items-center justify-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Live Classroom</span>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  /* Clean Empty State */
                  <div className="bg-white dark:bg-[#121215] p-12 rounded-2xl border border-gray-200/90 dark:border-[#27272a] shadow-subtle text-center">
                    <div className="w-12 h-12 rounded-full bg-softblue-50 dark:bg-[#18181c] text-navy-800 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 text-navy-700 dark:text-amber-400" />
                    </div>
                    <h3 className="text-base font-bold text-navy-800 dark:text-white">No Upcoming Lessons Scheduled</h3>
                    <p className="text-xs text-charcoal-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-5">
                      You don't have any tutoring sessions scheduled yet. Find a verified educator and book your first lesson.
                    </p>
                    <Link
                      href="/tutors"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 hover:bg-navy-900 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-zinc-950 font-bold text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <span>Find a Tutor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Past History */}
            {activeTab === 'past' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-navy-800 dark:text-white mb-2">
                  Completed Lessons & Attendance
                </h2>
                
                {pastBookings.length > 0 ? (
                  pastBookings.map((b) => (
                    <div key={b.id} className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-navy-800 dark:text-white">{b.subject}</span>
                          <span className="text-xs text-charcoal-500 dark:text-zinc-400">with <strong>{b.teacher_name}</strong></span>
                        </div>
                        <div className="text-xs text-charcoal-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-accent-500 dark:text-amber-400" />
                          <span>{b.formatted_time || b.start_time || `${b.duration_minutes || 60} mins lesson`}</span>
                          <span>•</span>
                          <span>${b.price || b.total_amount || 25} Paid</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const matched = recordings.find(r => r.booking_id === b.id || r.session_id.includes(b.teacher_id) || r.subject === b.subject) || recordings[0];
                            if (matched) setActivePlaybackRecording(matched);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-softblue-50 hover:bg-softblue-100 dark:bg-[#18181c] dark:hover:bg-[#27272a] text-navy-800 dark:text-amber-400 border border-gray-200 dark:border-amber-500/40/30 text-xs font-bold transition shadow-xs"
                          title="Watch video recording of this lesson"
                        >
                          <Film className="w-3.5 h-3.5 text-navy-700 dark:text-amber-400" />
                          <span>Watch Recording</span>
                        </button>

                        {b.reviewed ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-amber-950/30 text-emerald-700 dark:text-amber-300 border border-emerald-200 dark:border-amber-800/40 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
                            <span>Reviewed {b.review_rating ? `★ ${b.review_rating}` : '★ 5.0'}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveReviewBooking(b)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-900 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-zinc-950 font-bold text-white text-xs font-bold transition shadow-xs"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>Leave Review</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-[#121215] p-12 rounded-2xl border border-gray-200/90 dark:border-[#27272a] shadow-subtle text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-[#18181c] text-charcoal-400 dark:text-zinc-400 flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-navy-800 dark:text-white">No Past Lessons Yet</h3>
                    <p className="text-xs text-charcoal-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                      Once you complete lessons with your educators, your session history and recordings will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Session Recordings */}
            {activeTab === 'recordings' && (
              <div className="space-y-5">
                {/* Recordings Header Banner */}
                <div className="bg-white dark:bg-[#121215] p-5 rounded-2xl border border-gray-200/90 dark:border-[#27272a] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Film className="w-4 h-4" />
                      </div>
                      <h2 className="text-base font-bold text-navy-800 dark:text-white">
                        In-Classroom Session Recordings
                      </h2>
                    </div>
                    <p className="text-xs text-charcoal-500 dark:text-zinc-400 mt-1">
                      Rewatch whiteboard solutions, code walkthroughs, and discussions anytime.
                    </p>
                  </div>

                  {/* Summary badges */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-softblue-50 dark:bg-[#18181c] border border-gray-200 dark:border-[#27272a] px-3 py-1.5 rounded-xl text-center">
                      <span className="block text-charcoal-400 dark:text-zinc-400 text-[10px] uppercase font-bold">Videos</span>
                      <strong className="text-navy-800 dark:text-amber-400 text-xs font-mono">{recordings.length} Saved</strong>
                    </div>
                    <div className="bg-softblue-50 dark:bg-[#18181c] border border-gray-200 dark:border-[#27272a] px-3 py-1.5 rounded-xl text-center">
                      <span className="block text-charcoal-400 dark:text-zinc-400 text-[10px] uppercase font-bold">Storage</span>
                      <strong className="text-navy-800 dark:text-white text-xs">Cloud Archive</strong>
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center bg-white dark:bg-[#121215] border border-gray-200 dark:border-[#27272a] rounded-xl p-1 w-full sm:w-auto shadow-subtle">
                    <button
                      onClick={() => setRecordingFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        recordingFilter === 'all'
                          ? 'bg-navy-800 dark:bg-amber-400 dark:text-zinc-950 font-bold text-white shadow-xs'
                          : 'text-charcoal-600 dark:text-zinc-400 hover:text-navy-800 dark:hover:text-white'
                      }`}
                    >
                      All Lessons ({recordings.length})
                    </button>
                    <button
                      onClick={() => setRecordingFilter('mathematics')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        recordingFilter === 'mathematics'
                          ? 'bg-navy-800 dark:bg-amber-400 dark:text-zinc-950 font-bold text-white shadow-xs'
                          : 'text-charcoal-600 dark:text-zinc-400 hover:text-navy-800 dark:hover:text-white'
                      }`}
                    >
                      Mathematics
                    </button>
                    <button
                      onClick={() => setRecordingFilter('computer_science')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        recordingFilter === 'computer_science'
                          ? 'bg-navy-800 dark:bg-amber-400 dark:text-zinc-950 font-bold text-white shadow-xs'
                          : 'text-charcoal-600 dark:text-zinc-400 hover:text-navy-800 dark:hover:text-white'
                      }`}
                    >
                      Computer Science
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-charcoal-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={recordingSearchQuery}
                      onChange={(e) => setRecordingSearchQuery(e.target.value)}
                      placeholder="Search recordings or topics..."
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#121215] border border-gray-200 dark:border-[#27272a] rounded-xl text-xs text-charcoal-800 dark:text-white placeholder-charcoal-400 dark:placeholder-slate-500 focus:outline-none focus:border-navy-800 dark:focus:border-amber-400 shadow-subtle"
                    />
                  </div>
                </div>

                {/* Recordings Grid */}
                {recordings.filter((r) => {
                  const matchesFilter =
                    recordingFilter === 'all'
                      ? true
                      : recordingFilter === 'computer_science'
                      ? r.subject.toLowerCase().includes('computer') || r.subject.toLowerCase().includes('coding')
                      : !r.subject.toLowerCase().includes('computer') && !r.subject.toLowerCase().includes('coding');

                  const matchesSearch =
                    !recordingSearchQuery.trim() ||
                    r.title.toLowerCase().includes(recordingSearchQuery.toLowerCase()) ||
                    r.teacher_name.toLowerCase().includes(recordingSearchQuery.toLowerCase()) ||
                    r.subject.toLowerCase().includes(recordingSearchQuery.toLowerCase());

                  return matchesFilter && matchesSearch;
                }).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {recordings
                      .filter((r) => {
                        const matchesFilter =
                          recordingFilter === 'all'
                            ? true
                            : recordingFilter === 'computer_science'
                            ? r.subject.toLowerCase().includes('computer') || r.subject.toLowerCase().includes('coding')
                            : !r.subject.toLowerCase().includes('computer') && !r.subject.toLowerCase().includes('coding');

                        const matchesSearch =
                          !recordingSearchQuery.trim() ||
                          r.title.toLowerCase().includes(recordingSearchQuery.toLowerCase()) ||
                          r.teacher_name.toLowerCase().includes(recordingSearchQuery.toLowerCase()) ||
                          r.subject.toLowerCase().includes(recordingSearchQuery.toLowerCase());

                        return matchesFilter && matchesSearch;
                      })
                      .map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-white dark:bg-[#121215] rounded-2xl border border-gray-200/90 dark:border-[#27272a] overflow-hidden shadow-subtle hover:shadow-card transition flex flex-col group"
                        >
                          {/* Video Thumbnail with Play Button Overlay */}
                          <div 
                            onClick={() => setActivePlaybackRecording(rec)}
                            className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden group-hover:opacity-95 transition"
                          >
                            <img
                              src={rec.thumbnail_url || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80'}
                              alt={rec.title}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition">
                              <div className="w-12 h-12 rounded-full bg-emerald-600/90 group-hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                                <Play className="w-5 h-5 ml-0.5 fill-white" />
                              </div>
                            </div>
                            {/* Duration Badge */}
                            <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded font-bold">
                              {rec.duration}
                            </span>
                            {/* Subject Badge */}
                            <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              rec.subject.toLowerCase().includes('computer')
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : 'bg-navy-950/80 text-blue-300 border border-blue-500/40'
                            }`}>
                              {rec.subject}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 
                                onClick={() => setActivePlaybackRecording(rec)}
                                className="font-bold text-sm text-navy-800 dark:text-white group-hover:text-amber-500 transition cursor-pointer line-clamp-2"
                              >
                                {rec.title}
                              </h3>
                              
                              <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-zinc-400 mt-2.5">
                                <span>Educator: <strong className="text-navy-800 dark:text-zinc-200">{rec.teacher_name}</strong></span>
                                {rec.file_size && <span>{rec.file_size}</span>}
                              </div>
                              <div className="text-[11px] text-charcoal-400 dark:text-zinc-500 mt-1">
                                {rec.date}
                              </div>

                              {/* Chapter Tags */}
                              {rec.chapters && rec.chapters.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#27272a] flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-amber-400">
                                  <Sparkles className="w-3 h-3" />
                                  <span>{rec.chapters.length} Interactive Chapter Markers</span>
                                </div>
                              )}
                            </div>

                            {/* Card Actions */}
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#27272a] flex items-center gap-2">
                              <button
                                onClick={() => setActivePlaybackRecording(rec)}
                                className="flex-1 py-2 bg-navy-800 dark:bg-amber-400 dark:text-zinc-950 font-bold hover:bg-navy-900 dark:hover:bg-amber-300 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Watch Lesson</span>
                              </button>
                              <a
                                href={rec.video_url}
                                download
                                className="p-2 bg-gray-50 dark:bg-[#18181c] hover:bg-gray-100 dark:hover:bg-[#27272a] text-charcoal-600 dark:text-zinc-300 rounded-lg border border-gray-200 dark:border-[#27272a] transition"
                                title="Download Recording (.mp4)"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#121215] p-12 rounded-2xl border border-gray-200/90 dark:border-[#27272a] shadow-subtle text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-[#18181c] text-charcoal-400 dark:text-zinc-400 flex items-center justify-center mx-auto mb-3">
                      <Film className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-navy-800 dark:text-white">No Matching Recordings</h3>
                    <p className="text-xs text-charcoal-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                      No session recordings found matching your current filter. Your upcoming recorded lessons will appear here automatically.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: My Tutors */}
            {activeTab === 'tutors' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-navy-800 dark:text-white mb-2">Booked Tutors</h2>

                {bookedTutors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bookedTutors.map((t) => (
                      <div key={t.id} className="p-4 bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={t.avatar_url} alt={t.full_name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-navy-800 dark:text-white truncate">{t.full_name}</div>
                          <div className="text-[11px] text-charcoal-500 dark:text-zinc-400">{t.subjects?.join(', ')}</div>
                        </div>
                        <Link
                          href={`/booking/${t.id}`}
                          className="px-3 py-1.5 bg-navy-800 hover:bg-navy-900 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-zinc-950 font-bold text-white rounded text-xs font-semibold"
                        >
                          Book
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#121215] p-12 rounded-2xl border border-gray-200/90 dark:border-[#27272a] shadow-subtle text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-[#18181c] text-charcoal-400 dark:text-zinc-400 flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-navy-800 dark:text-white">No Tutors Booked Yet</h3>
                    <p className="text-xs text-charcoal-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
                      Tutors you connect with will be saved here for one-click re-booking and direct messaging.
                    </p>
                    <Link
                      href="/tutors"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-900 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-zinc-950 font-bold text-white rounded-lg text-xs font-semibold transition"
                    >
                      <span>Browse Verified Tutors</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Learning Materials */}
            {activeTab === 'materials' && (
              <div className="bg-white dark:bg-[#121215] p-6 rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle space-y-4">
                <h2 className="text-base font-bold text-navy-800 dark:text-white">Class Notes & Homework Sheets</h2>
                
                {materials.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {materials.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-[#18181c] rounded-lg border border-gray-200 dark:border-[#323238] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-navy-800 dark:text-amber-400" />
                          <div className="font-semibold text-navy-800 dark:text-white">{doc.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-[#18181c] text-charcoal-400 dark:text-zinc-400 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-navy-800 dark:text-white">No Shared Study Materials Yet</h3>
                    <p className="text-xs text-charcoal-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                      Whiteboard exports, formula sheets, and homework worksheets provided by your educators will be accessible here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Payments & Receipts */}
            {activeTab === 'payments' && (
              <div className="bg-white dark:bg-[#121215] p-6 rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle space-y-4">
                <h2 className="text-base font-bold text-navy-800 dark:text-white">Payment History & Tax Invoices</h2>
                
                {paymentHistory.length > 0 ? (
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-[#27272a] text-charcoal-400 dark:text-zinc-400 font-semibold uppercase text-[10px]">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Description</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#27272a]">
                      {paymentHistory.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 text-charcoal-600 dark:text-zinc-300">{item.date}</td>
                          <td className="py-3 font-semibold text-navy-800 dark:text-white">{item.description}</td>
                          <td className="py-3 font-bold text-navy-800 dark:text-white">${item.amount}</td>
                          <td className="py-3"><span className="text-accent-600 dark:text-amber-400 font-semibold">{item.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-[#18181c] text-charcoal-400 dark:text-zinc-400 flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-navy-800 dark:text-white">No Payment Records Yet</h3>
                    <p className="text-xs text-charcoal-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                      Receipts and invoices will be automatically generated and stored here when you book a lesson.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Referrals & Rewards ("Give $20, Get $20") */}
            {activeTab === 'referrals' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-navy-800 dark:text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                    <span>Parent Referral Engine ("Give $20, Get $20")</span>
                  </h2>
                  <p className="text-xs text-charcoal-500 dark:text-zinc-400 mt-0.5">
                    Share your family referral code with school parent groups, WhatsApp, or email. Both families get $20 lesson credit!
                  </p>
                </div>

                {referralProfile && (
                  <ReferralShareCard
                    profile={referralProfile}
                    parentName={displayName}
                  />
                )}
              </div>
            )}

            {/* TAB: Settings */}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-[#121215] p-6 rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle space-y-6 text-xs">
                <div>
                  <h2 className="text-base font-bold text-navy-800 dark:text-white">Account & Safety Settings</h2>
                  <p className="text-xs text-charcoal-500 dark:text-zinc-400 mt-0.5">
                    Manage student information, grade levels, and guardian contact details.
                  </p>
                </div>

                <div className="p-4 bg-softblue-50 dark:bg-[#18181c] rounded-lg border border-softblue-200 dark:border-[#323238]">
                  <div className="flex items-center gap-2 font-bold text-navy-800 dark:text-white mb-1">
                    <ShieldCheck className="w-4 h-4 text-accent-500 dark:text-amber-400" />
                    <span>Protected K-12 Student Account (COPPA Compliant)</span>
                  </div>
                  <p className="text-[11px] text-charcoal-600 dark:text-zinc-300">
                    All tutor interactions, session links, and billing receipts are managed securely under <strong>{userEmail}</strong>.
                  </p>
                </div>

                <div className="p-5 bg-gray-50 dark:bg-[#18181c] rounded-xl border border-gray-200 dark:border-[#323238] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-navy-900 dark:text-white text-sm">Personal & Academic Profile</h3>
                    <p className="text-xs text-charcoal-500 dark:text-zinc-400 mt-0.5">
                      Update student name, school grade level, timezones, and learning goals.
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-900 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-zinc-950 font-bold text-white rounded-lg font-bold text-xs shadow-subtle transition"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </Link>
                </div>
              </div>
            )}
              </motion.div>
            </AnimatePresence>

          </main>

        </div>

      </div>

      {/* Post-Lesson Review Modal */}
      {activeReviewBooking && (
        <ReviewModal
          isOpen={!!activeReviewBooking}
          onClose={() => setActiveReviewBooking(null)}
          onSuccess={(newReview) => {
            setPastBookings((prev) =>
              prev.map((item) =>
                item.id === activeReviewBooking.id || item.bookingId === activeReviewBooking.id
                  ? { ...item, reviewed: true, review_rating: newReview.rating }
                  : item
              )
            );
          }}
          bookingId={activeReviewBooking.id || activeReviewBooking.bookingId}
          tutorId={activeReviewBooking.teacher_id}
          tutorName={activeReviewBooking.teacher_name}
          tutorAvatar={activeReviewBooking.teacher_avatar}
          subject={activeReviewBooking.subject}
          studentId={user?.id}
          studentName={displayName}
          studentGrade={gradeLevel}
        />
      )}
      {/* In-Classroom Session Recording Playback Modal */}
      {activePlaybackRecording && (
        <RecordingPlaybackModal
          recording={activePlaybackRecording}
          isOpen={!!activePlaybackRecording}
          onClose={() => setActivePlaybackRecording(null)}
        />
      )}
    </div>
  );
}
