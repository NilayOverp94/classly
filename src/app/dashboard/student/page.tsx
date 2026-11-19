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
  Inbox
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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
      } catch (err) {
        console.error('Failed to load student bookings:', err);
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
    'upcoming' | 'past' | 'tutors' | 'materials' | 'payments' | 'settings'
  >('upcoming');

  if (loading) {
    return (
      <div className="bg-offwhite min-h-screen py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
          <span className="text-xs text-charcoal-500 font-medium">Loading your student dashboard...</span>
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
    <div className="bg-offwhite min-h-screen py-8 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Real User Profile Banner */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-subtle mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-navy-800 text-white border border-gray-200 flex-shrink-0 flex items-center justify-center shadow-sm">
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
                <h1 className="text-xl font-bold text-navy-800">
                  {displayName}
                </h1>
                <span className="text-[11px] font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                  {gradeLevel}
                </span>
              </div>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Logged in as <strong>{userEmail}</strong> • Active Learning Account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tutors"
              className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-semibold shadow-subtle transition flex items-center gap-1.5"
            >
              <span>+ Book a Tutor</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Grid: Sidebar (3 cols) + Active Panel (9 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-subtle p-4 space-y-1">
            <div className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider px-3 py-2">
              Student Navigation
            </div>

            {[
              { id: 'upcoming', label: 'Upcoming Lessons', icon: <Calendar className="w-4 h-4" />, count: upcomingBookings.length },
              { id: 'past', label: 'Lesson History', icon: <Clock className="w-4 h-4" /> },
              { id: 'tutors', label: 'My Tutors', icon: <User className="w-4 h-4" />, count: bookedTutors.length },
              { id: 'materials', label: 'Learning Materials', icon: <FileText className="w-4 h-4" />, count: materials.length },
              { id: 'payments', label: 'Payments & Receipts', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'settings', label: 'Account & Safety Settings', icon: <Settings className="w-4 h-4" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === item.id
                    ? 'bg-navy-800 text-white shadow-subtle'
                    : 'text-charcoal-700 hover:bg-gray-50 hover:text-navy-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    activeTab === item.id ? 'bg-navy-900 text-white' : 'bg-softblue-100 text-navy-800'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          {/* Active Tab Panel */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* TAB: Upcoming Lessons */}
            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-navy-800">
                    Confirmed Upcoming Lessons
                  </h2>
                  <span className="text-xs text-charcoal-500">Live WebRTC Classrooms</span>
                </div>

                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                          <Image
                            src={b.teacher_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={b.teacher_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-navy-800">{b.subject}</h3>
                            <span className="px-2 py-0.5 rounded bg-accent-50 text-accent-700 text-[11px] font-semibold border border-accent-200">
                              Confirmed
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-600 mt-0.5">
                            with <strong>{b.teacher_name}</strong> • 1-on-1 Session ({b.duration_minutes} mins)
                          </p>
                          <div className="flex items-center gap-2 text-xs text-charcoal-500 mt-2">
                            <Clock className="w-3.5 h-3.5 text-accent-500" />
                            <span>{b.formatted_time || b.start_time || `${b.date} at ${b.time_slot}`}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2.5">
                        <Link
                          href={b.meeting_url || (b.teacher_id ? `/classroom/room-tutor-${b.teacher_id}` : `/classroom/room-${b.id}`)}
                          className="w-full md:w-auto px-5 py-2.5 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-bold transition shadow-subtle flex items-center justify-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Live Classroom</span>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  /* Clean Empty State */
                  <div className="bg-white p-12 rounded-2xl border border-gray-200/90 shadow-subtle text-center">
                    <div className="w-12 h-12 rounded-full bg-softblue-50 text-navy-800 flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 text-navy-700" />
                    </div>
                    <h3 className="text-base font-bold text-navy-800">No Upcoming Lessons Scheduled</h3>
                    <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1 mb-5">
                      You don't have any tutoring sessions scheduled yet. Find a verified educator and book your first lesson.
                    </p>
                    <Link
                      href="/tutors"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 hover:bg-navy-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
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
                <h2 className="text-base font-bold text-navy-800 mb-2">
                  Completed Lessons & Attendance
                </h2>
                
                {pastBookings.length > 0 ? (
                  pastBookings.map((b) => (
                    <div key={b.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-navy-800">{b.subject} with {b.teacher_name}</div>
                        <div className="text-xs text-charcoal-500 mt-0.5">Completed • {b.duration_minutes} mins</div>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">${b.price} Paid</span>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-12 rounded-2xl border border-gray-200/90 shadow-subtle text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 text-charcoal-400 flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-navy-800">No Past Lessons Yet</h3>
                    <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1">
                      Once you complete lessons with your educators, your session history and recordings will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: My Tutors */}
            {activeTab === 'tutors' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-navy-800 mb-2">Booked Tutors</h2>

                {bookedTutors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bookedTutors.map((t) => (
                      <div key={t.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-subtle flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={t.avatar_url} alt={t.full_name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-navy-800 truncate">{t.full_name}</div>
                          <div className="text-[11px] text-charcoal-500">{t.subjects?.join(', ')}</div>
                        </div>
                        <Link
                          href={`/booking/${t.id}`}
                          className="px-3 py-1.5 bg-navy-800 text-white rounded text-xs font-semibold"
                        >
                          Book
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-2xl border border-gray-200/90 shadow-subtle text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 text-charcoal-400 flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-navy-800">No Tutors Booked Yet</h3>
                    <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1 mb-4">
                      Tutors you connect with will be saved here for one-click re-booking and direct messaging.
                    </p>
                    <Link
                      href="/tutors"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-semibold transition"
                    >
                      <span>Browse Verified Tutors</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Learning Materials */}
            {activeTab === 'materials' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-4">
                <h2 className="text-base font-bold text-navy-800">Class Notes & Homework Sheets</h2>
                
                {materials.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {materials.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-navy-800" />
                          <div className="font-semibold text-navy-800">{doc.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 text-charcoal-400 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-navy-800">No Shared Study Materials Yet</h3>
                    <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1">
                      Whiteboard exports, formula sheets, and homework worksheets provided by your educators will be accessible here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Payments & Receipts */}
            {activeTab === 'payments' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-4">
                <h2 className="text-base font-bold text-navy-800">Payment History & Tax Invoices</h2>
                
                {paymentHistory.length > 0 ? (
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-gray-200 text-charcoal-400 font-semibold uppercase text-[10px]">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Description</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paymentHistory.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 text-charcoal-600">{item.date}</td>
                          <td className="py-3 font-semibold text-navy-800">{item.description}</td>
                          <td className="py-3 font-bold text-navy-800">${item.amount}</td>
                          <td className="py-3"><span className="text-accent-600 font-semibold">{item.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 text-charcoal-400 flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-navy-800">No Payment Records Yet</h3>
                    <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1">
                      Receipts and invoices will be automatically generated and stored here when you book a lesson.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Settings */}
            {activeTab === 'settings' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-6 text-xs">
                <div>
                  <h2 className="text-base font-bold text-navy-800">Account & Safety Settings</h2>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Manage student information, grade levels, and guardian contact details.
                  </p>
                </div>

                <div className="p-4 bg-softblue-50 rounded-lg border border-softblue-200">
                  <div className="flex items-center gap-2 font-bold text-navy-800 mb-1">
                    <ShieldCheck className="w-4 h-4 text-accent-500" />
                    <span>Protected K-12 Student Account (COPPA Compliant)</span>
                  </div>
                  <p className="text-[11px] text-charcoal-600">
                    All tutor interactions, session links, and billing receipts are managed securely under <strong>{userEmail}</strong>.
                  </p>
                </div>

                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-navy-900 text-sm">Personal & Academic Profile</h3>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Update student name, school grade level, timezones, and learning goals.
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg font-bold text-xs shadow-subtle transition"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </Link>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}
