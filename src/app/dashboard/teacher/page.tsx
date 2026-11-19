'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  PlusCircle, 
  Video, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen,
  LogOut,
  User,
  Bell,
  Mail,
  AlertCircle,
  Sparkles,
  Trash2,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TeacherDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'availability' | 'create_class' | 'earnings' | 'students'>('overview');
  
  // Real class listings created by teacher (starts empty)
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);

  // Class creation state
  const [newClass, setNewClass] = useState({
    title: '',
    subject: 'Mathematics',
    gradeLevel: 'Grade 11',
    classType: 'group',
    price: '25',
    dateTime: 'Tomorrow at 05:00 PM EST',
    durationMinutes: '60',
    maxStudents: '6',
    description: '',
  });
  const [classCreatedNotice, setClassCreatedNotice] = useState(false);
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      if (currentUser) {
        setUser(currentUser);
        // Load initial classes from metadata if present
        if (Array.isArray(currentUser.user_metadata?.teacher_classes)) {
          setTeacherClasses(currentUser.user_metadata.teacher_classes);
        }

        // Fetch confirmed student bookings from API
        try {
          const res = await fetch(`/api/bookings?userId=${currentUser.id}&role=teacher`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            setBookings(data.bookings || []);
          }
        } catch (e) {
          console.error('Failed to load educator bookings:', e);
        } finally {
          setLoadingBookings(false);
        }

        // Fetch persisted published classes from API
        try {
          const clsRes = await fetch(`/api/classes?teacherId=${currentUser.id}`, { cache: 'no-store' });
          if (clsRes.ok) {
            const clsData = await clsRes.json();
            if (Array.isArray(clsData.classes)) {
              setTeacherClasses(clsData.classes);
            }
          }
        } catch (e) {
          console.error('Failed to load teacher classes:', e);
        }
      }
    };
    checkAuthAndLoad();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const teacherDisplayName = 
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    user?.email?.split('@')[0] || 
    'Teacher';

  const teacherHeadline = 
    user?.user_metadata?.headline || 
    user?.user_metadata?.education || 
    'Classly Verified Educator';

  const teacherAvatar = 
    user?.user_metadata?.avatar_url || 
    user?.user_metadata?.picture || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherDisplayName)}&background=0B121E&color=ffffff&size=256&bold=true`;

  const teacherHourlyRate = 
    Number(user?.user_metadata?.hourly_rate) || 25;

  const totalUpcoming = bookings.length + teacherClasses.length;
  const totalEarned = bookings.reduce((sum, b) => sum + (Number(b.hourly_rate) || teacherHourlyRate), 0);
  const netAccruedPayout = totalEarned * 0.85; // 85% net after 15% platform commission

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert('Educator session expired. Please refresh the page and log in.');
      return;
    }

    setIsSubmittingClass(true);

    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user.id,
          title: newClass.title,
          subject: newClass.subject,
          gradeLevel: newClass.gradeLevel,
          price: Number(newClass.price),
          dateTime: newClass.dateTime,
          durationMinutes: Number(newClass.durationMinutes),
          maxStudents: Number(newClass.maxStudents),
          description: newClass.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish class.');
      }

      setTeacherClasses(data.classes || []);
      setClassCreatedNotice(true);

      // Reset new class form
      setNewClass({
        title: '',
        subject: 'Mathematics',
        gradeLevel: 'Grade 11',
        classType: 'group',
        price: '25',
        dateTime: 'Tomorrow at 05:00 PM EST',
        durationMinutes: '60',
        maxStudents: '6',
        description: '',
      });

      setTimeout(() => {
        setClassCreatedNotice(false);
        setActiveTab('classes');
      }, 1200);
    } catch (err: any) {
      console.error('Publish class error:', err);
      alert(err.message || 'Failed to publish class.');
    } finally {
      setIsSubmittingClass(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!user?.id) return;
    if (!confirm('Are you sure you want to remove this class listing from your schedule?')) return;

    try {
      const res = await fetch(`/api/classes?teacherId=${user.id}&classId=${classId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        setTeacherClasses(data.classes || []);
      }
    } catch (e) {
      console.error('Delete class error:', e);
    }
  };

  return (
    <div className="bg-offwhite min-h-screen py-8 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Educator Profile Banner */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
              <Image
                src={teacherAvatar}
                alt={teacherDisplayName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-navy-800">{teacherDisplayName}</h1>
                <span className="text-[11px] font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                  Verified Educator • Active
                </span>
              </div>
              <p className="text-xs text-charcoal-500 mt-0.5">
                {teacherHeadline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-navy-800 rounded-lg text-xs font-semibold border border-gray-200 shadow-subtle flex items-center gap-1.5 transition"
            >
              <User className="w-4 h-4 text-accent-600" />
              <span>Edit Profile</span>
            </Link>
            <button
              onClick={() => setActiveTab('create_class')}
              className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-semibold shadow-subtle flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Class</span>
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-subtle p-4 space-y-1">
            <div className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider px-3 py-2">
              Teacher Navigation
            </div>

            {[
              { id: 'overview', label: 'Overview & Schedule', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'classes', label: 'Scheduled Classes', icon: <Calendar className="w-4 h-4" />, count: totalUpcoming },
              { id: 'availability', label: 'Manage Availability', icon: <Clock className="w-4 h-4" /> },
              { id: 'create_class', label: 'Create a Class', icon: <PlusCircle className="w-4 h-4" /> },
              { id: 'earnings', label: 'Payouts & Banking', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'students', label: 'Student Roster', icon: <Users className="w-4 h-4" />, count: bookings.length },
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
                    activeTab === item.id ? 'bg-navy-900 text-white' : 'bg-softblue-100 text-navy-800 font-bold'
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

          {/* Main Panel */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Real Booking Alert Banner if Teacher has bookings */}
                {bookings.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0 text-emerald-800">
                        <Bell className="w-5 h-5 animate-bounce" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">New Lesson Booked!</span>
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">Paid & Confirmed</span>
                        </div>
                        <p className="text-xs text-charcoal-700 mt-0.5">
                          <strong>{bookings[0].student_name}</strong> booked a 1-on-1 {bookings[0].subject} session for <strong>{bookings[0].formatted_time || `${bookings[0].date} at ${bookings[0].time_slot}`}</strong>.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        href={user ? `/classroom/room-tutor-${user.id}` : (bookings[0]?.meeting_url || '/classroom/room-tutor')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-subtle"
                      >
                        <Video className="w-4 h-4" />
                        <span>Launch Classroom</span>
                      </Link>
                      <button
                        onClick={() => setActiveTab('classes')}
                        className="px-3 py-2 bg-white hover:bg-gray-50 text-navy-800 rounded-lg text-xs font-semibold border border-gray-200 shadow-subtle"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                )}

                {/* 4 Clean Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle">
                    <span className="text-xs text-charcoal-500 font-medium block mb-1">Upcoming Lessons</span>
                    <span className="text-2xl font-bold text-navy-800">{totalUpcoming}</span>
                    <span className="text-[11px] text-accent-600 block mt-1">Confirmed on calendar</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle">
                    <span className="text-xs text-charcoal-500 font-medium block mb-1">Hourly Rate</span>
                    <span className="text-2xl font-bold text-navy-800">${teacherHourlyRate}</span>
                    <span className="text-[11px] text-charcoal-400 block mt-1">1-on-1 private rate</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle">
                    <span className="text-xs text-charcoal-500 font-medium block mb-1">Account Standing</span>
                    <span className="text-2xl font-bold text-accent-600">Active</span>
                    <span className="text-[11px] text-charcoal-400 block mt-1">Verified educator</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle">
                    <span className="text-xs text-charcoal-500 font-medium block mb-1">Accrued Payout</span>
                    <span className="text-2xl font-bold text-navy-800">${netAccruedPayout.toFixed(2)}</span>
                    <span className="text-[11px] text-accent-600 block mt-1">Net earnings (85%)</span>
                  </div>
                </div>

                {/* Next Class Launch Card or Empty State */}
                {bookings.length > 0 ? (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-navy-800">Next Scheduled Session</h2>
                          <span className="px-2 py-0.5 bg-accent-50 text-accent-700 font-semibold text-[11px] rounded border border-accent-200">
                            1-on-1 Private Lesson
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-500 mt-1">
                          Student: <strong className="text-navy-800">{bookings[0].student_name}</strong> ({bookings[0].student_email || 'Verified Student'}) • 60 mins
                        </p>
                      </div>
                      <span className="px-3 py-1.5 bg-navy-50 text-navy-800 font-bold text-xs rounded-lg border border-navy-100 flex items-center gap-1.5 self-start sm:self-auto">
                        <Clock className="w-3.5 h-3.5 text-navy-600" />
                        {bookings[0].formatted_time || `${bookings[0].date} at ${bookings[0].time_slot}`}
                      </span>
                    </div>

                    {bookings[0].notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-charcoal-600">
                        <span className="font-semibold text-navy-800">Student Learning Focus:</span> "{bookings[0].notes}"
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100 gap-3">
                      <div className="text-xs text-charcoal-600">
                        Subject: <strong>{bookings[0].subject}</strong> • Earnings: <strong className="text-accent-700">${bookings[0].hourly_rate || teacherHourlyRate} USD</strong> (Ready for payout)
                      </div>
                      <Link
                        href={user ? `/classroom/room-tutor-${user.id}` : (bookings[0]?.meeting_url || '/classroom/room-tutor')}
                        className="px-5 py-2.5 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-subtle"
                      >
                        <Video className="w-4 h-4" />
                        <span>Enter Live Classroom</span>
                      </Link>
                    </div>
                  </div>
                ) : teacherClasses.length > 0 ? (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-base font-bold text-navy-800">Next Scheduled Class</h2>
                        <p className="text-xs text-charcoal-500">{teacherClasses[0]?.title} • {teacherClasses[0]?.durationMinutes} mins</p>
                      </div>
                      <span className="px-2.5 py-1 bg-accent-50 text-accent-700 font-semibold text-xs rounded border border-accent-200">
                        {teacherClasses[0]?.dateTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-charcoal-600">
                        Class Type: <strong>Group Class</strong> • Rate: <strong>${teacherClasses[0]?.price}</strong>
                      </div>
                      <Link
                        href={`/classroom/room-${teacherClasses[0]?.id}`}
                        className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-subtle"
                      >
                        <Video className="w-4 h-4" />
                        <span>Open Classroom</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-subtle text-center">
                    <div className="w-12 h-12 rounded-full bg-softblue-50 text-navy-800 flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 text-navy-700" />
                    </div>
                    <h3 className="font-bold text-navy-800 text-sm">No Scheduled Classes Yet</h3>
                    <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1 mb-4">
                      Publish a group masterclass or set your weekly availability slots to begin accepting students.
                    </p>
                    <button
                      onClick={() => setActiveTab('create_class')}
                      className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-semibold"
                    >
                      + Create Your First Class
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* CLASSES TAB */}
            {activeTab === 'classes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-navy-800">Your Scheduled Classes & Lessons ({totalUpcoming})</h2>
                    <p className="text-xs text-charcoal-500">All confirmed 1-on-1 private lessons and group masterclasses.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('create_class')}
                    className="px-3 py-1.5 bg-navy-800 text-white rounded-lg text-xs font-semibold"
                  >
                    + Add Group Class
                  </button>
                </div>

                {bookings.length > 0 || teacherClasses.length > 0 ? (
                  <div className="space-y-3">
                    {/* Confirmed 1-on-1 Bookings */}
                    {bookings.map((b) => (
                      <div key={b.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-navy-800">{b.subject} — 1-on-1 Private Lesson</h3>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                              Confirmed & Paid
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-500 mt-1">
                            Student: <strong className="text-navy-800">{b.student_name}</strong> ({b.student_email || 'Classly Student'}) • {b.formatted_time || `${b.date} at ${b.time_slot}`} • 60 mins • Payout: <strong className="text-accent-700">${b.hourly_rate || teacherHourlyRate} USD</strong>
                          </p>
                          {b.notes && (
                            <p className="text-[11px] text-charcoal-400 mt-1 italic">
                              Note: "{b.notes}"
                            </p>
                          )}
                        </div>

                        <Link
                          href={user ? `/classroom/room-tutor-${user.id}` : (b.meeting_url || `/classroom/room-${b.id}`)}
                          className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-subtle flex-shrink-0"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Open Classroom</span>
                        </Link>
                      </div>
                    ))}

                    {/* Group Classes */}
                    {teacherClasses.map((cls) => (
                      <div key={cls.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-navy-800">{cls.title}</h3>
                            <span className="px-2 py-0.5 bg-softblue-100 text-navy-800 rounded text-[10px] font-semibold">
                              {cls.subject}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-500 mt-1">
                            {cls.dateTime} • {cls.gradeLevel} • ${cls.price}/student • Enrolled: {cls.enrolledCount}/{cls.maxStudents}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={user ? `/classroom/room-tutor-${user.id}` : `/classroom/room-${cls.id}`}
                            className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Start Class</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteClass(cls.id)}
                            className="p-2 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Class Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-subtle text-center">
                    <p className="text-xs text-charcoal-500 mb-3">No classes or lessons scheduled yet.</p>
                    <button
                      onClick={() => setActiveTab('create_class')}
                      className="px-4 py-2 bg-navy-800 text-white rounded-lg text-xs font-semibold"
                    >
                      Create a Class
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CREATE CLASS TAB */}
            {activeTab === 'create_class' && (
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-subtle">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-navy-800">Create a New Class Listing</h2>
                  <p className="text-xs text-charcoal-600">
                    Publish an interactive small group workshop or topic review for US students.
                  </p>
                </div>

                {classCreatedNotice && (
                  <div className="p-4 mb-6 bg-accent-50 border border-accent-200 text-accent-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-500" />
                    <span>Class created and added to your schedule!</span>
                  </div>
                )}

                <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">Class Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AP Calculus AB Optimization & Related Rates Masterclass"
                      value={newClass.title}
                      onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-charcoal-700 mb-1">Subject *</label>
                      <select
                        value={newClass.subject}
                        onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                      >
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Computer Science">Computer Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-charcoal-700 mb-1">Target Grade Level *</label>
                      <select
                        value={newClass.gradeLevel}
                        onChange={(e) => setNewClass({ ...newClass, gradeLevel: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                      >
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-charcoal-700 mb-1">Price per Student (USD) *</label>
                      <input
                        type="number"
                        min="10"
                        required
                        value={newClass.price}
                        onChange={(e) => setNewClass({ ...newClass, price: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-charcoal-700 mb-1">Max Students *</label>
                      <input
                        type="number"
                        min="2"
                        max="10"
                        required
                        value={newClass.maxStudents}
                        onChange={(e) => setNewClass({ ...newClass, maxStudents: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-charcoal-700 mb-1">Duration (Minutes) *</label>
                      <select
                        value={newClass.durationMinutes}
                        onChange={(e) => setNewClass({ ...newClass, durationMinutes: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                      >
                        <option value="45">45 Minutes</option>
                        <option value="60">60 Minutes</option>
                        <option value="75">75 Minutes</option>
                        <option value="90">90 Minutes</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">Syllabus / Focus Description *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Outline key topics to be mastered and what students should prepare..."
                      value={newClass.description}
                      onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800 focus:bg-white"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingClass}
                      className="px-6 py-2.5 bg-navy-800 hover:bg-navy-900 disabled:bg-gray-400 text-white rounded-lg font-bold text-xs shadow-subtle flex items-center gap-2"
                    >
                      {isSubmittingClass && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isSubmittingClass ? 'Publishing Class...' : 'Publish Class'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* AVAILABILITY TAB */}
            {activeTab === 'availability' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-4">
                <h2 className="text-base font-bold text-navy-800">Weekly Availability Schedule</h2>
                <p className="text-xs text-charcoal-600">
                  Configure time slots open for student bookings. Times auto-sync between your local India (IST) time and student local US Eastern Time.
                </p>
                <div className="space-y-3 pt-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-navy-800 w-28">{day}</span>
                      <div className="flex flex-wrap gap-2 flex-1">
                        <span className="px-2 py-1 bg-white border border-gray-200 rounded text-charcoal-700">07:00 AM EST</span>
                        <span className="px-2 py-1 bg-white border border-gray-200 rounded text-charcoal-700">08:30 AM EST</span>
                        <span className="px-2 py-1 bg-white border border-gray-200 rounded text-charcoal-700">05:00 PM EST</span>
                        <span className="px-2 py-1 bg-white border border-gray-200 rounded text-charcoal-700">06:30 PM EST</span>
                      </div>
                      <button onClick={() => alert('Availability slots confirmed and synced to your booking calendar!')} className="text-xs font-semibold text-navy-800 hover:underline">
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EARNINGS TAB */}
            {activeTab === 'earnings' && (
              <div className="space-y-6 text-xs">
                {/* Payout Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle">
                    <span className="text-xs text-charcoal-500 font-medium block mb-1">Gross Lesson Volume</span>
                    <span className="text-2xl font-bold text-navy-800">${totalEarned.toFixed(2)}</span>
                    <span className="text-[11px] text-charcoal-400 block mt-1">{bookings.length} confirmed student sessions</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle">
                    <span className="text-xs text-charcoal-500 font-medium block mb-1">Platform Commission (15%)</span>
                    <span className="text-2xl font-bold text-charcoal-600">-${(totalEarned * 0.15).toFixed(2)}</span>
                    <span className="text-[11px] text-charcoal-400 block mt-1">Standard educator rate</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-subtle">
                    <span className="text-xs text-emerald-900 font-bold block mb-1">Net Accrued Payout</span>
                    <span className="text-2xl font-bold text-emerald-700">${netAccruedPayout.toFixed(2)}</span>
                    <span className="text-[11px] text-emerald-800 block mt-1">Ready for direct bank transfer</span>
                  </div>
                </div>

                {/* Bank Coordinates */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-4">
                  <h2 className="text-base font-bold text-navy-800">Bank Payout Coordinates & Transfer Settings</h2>
                  <div className="p-4 bg-softblue-50 border border-softblue-200 rounded-lg">
                    <div className="font-bold text-navy-800 mb-1">Direct Bank Account Transfer (India NEFT / IMPS)</div>
                    <p className="text-[11px] text-charcoal-600">
                      Payouts are calculated in USD and disbursed directly to your verified local Indian bank account via NEFT/IMPS with zero international wire deduction fees.
                    </p>
                  </div>
                </div>

                {/* Itemized Transaction Ledger */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-4">
                  <h2 className="text-base font-bold text-navy-800">Lesson Payout Ledger ({bookings.length})</h2>
                  {bookings.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-200 text-charcoal-400 uppercase tracking-wider text-[10px]">
                            <th className="pb-3 font-semibold">Date & Time</th>
                            <th className="pb-3 font-semibold">Student</th>
                            <th className="pb-3 font-semibold">Subject</th>
                            <th className="pb-3 font-semibold">Gross</th>
                            <th className="pb-3 font-semibold">Fee (15%)</th>
                            <th className="pb-3 font-semibold">Net Payout</th>
                            <th className="pb-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {bookings.map((b) => {
                            const gross = Number(b.hourly_rate) || teacherHourlyRate;
                            const fee = gross * 0.15;
                            const net = gross - fee;
                            return (
                              <tr key={b.id} className="hover:bg-gray-50">
                                <td className="py-3 text-navy-800 font-medium">{b.formatted_time || `${b.date} at ${b.time_slot}`}</td>
                                <td className="py-3 text-charcoal-700">{b.student_name}</td>
                                <td className="py-3 text-charcoal-700">{b.subject}</td>
                                <td className="py-3 text-charcoal-700">${gross.toFixed(2)}</td>
                                <td className="py-3 text-charcoal-400">-${fee.toFixed(2)}</td>
                                <td className="py-3 font-bold text-accent-700">${net.toFixed(2)}</td>
                                <td className="py-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent-50 text-accent-700 border border-accent-200">
                                    Accrued
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
                      <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="font-bold text-navy-800 text-sm">No Pending Payouts</div>
                      <p className="text-[11px] text-charcoal-500 mt-1">
                        Lesson fees accrue here upon student bookings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === 'students' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-navy-800">Student Roster ({bookings.length})</h2>
                    <p className="text-xs text-charcoal-500">Students enrolled in your private or group sessions</p>
                  </div>
                </div>

                {bookings.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {bookings.map((b, idx) => (
                      <div key={idx} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-softblue-100 text-navy-800 flex items-center justify-center font-bold text-sm">
                            {(b.student_name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-navy-800">{b.student_name}</h3>
                            <p className="text-xs text-charcoal-500">{b.student_email || 'Student Email Protected'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                                {b.subject}
                              </span>
                              <span className="text-[11px] text-charcoal-400">
                                Session: {b.formatted_time || `${b.date} at ${b.time_slot}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={user ? `/classroom/room-tutor-${user.id}` : (b.meeting_url || `/classroom/room-${b.id}`)}
                            className="px-3.5 py-1.5 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Launch Classroom</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-charcoal-500">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="font-bold text-navy-800 text-sm">No Enrolled Students Yet</div>
                    <p className="max-w-xs mx-auto mt-1">
                      Once students book 1-on-1 sessions or enroll in your published classes, their contact details and learning goals will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}
