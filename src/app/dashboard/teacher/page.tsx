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
  LogOut
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TeacherDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      if (currentUser) {
        setUser(currentUser);
      }
    };
    checkAuth();
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
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  const teacherHourlyRate = 
    user?.user_metadata?.hourly_rate || 25;
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

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherClasses((prev) => [
      ...prev,
      {
        id: `cls-${Date.now()}`,
        title: newClass.title,
        subject: newClass.subject,
        gradeLevel: newClass.gradeLevel,
        price: Number(newClass.price),
        dateTime: newClass.dateTime,
        durationMinutes: Number(newClass.durationMinutes),
        maxStudents: Number(newClass.maxStudents),
        enrolledCount: 0,
      },
    ]);
    setClassCreatedNotice(true);
    setTimeout(() => {
      setClassCreatedNotice(false);
      setActiveTab('classes');
    }, 1200);
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
              { id: 'classes', label: 'Scheduled Classes', icon: <Calendar className="w-4 h-4" />, count: teacherClasses.length },
              { id: 'availability', label: 'Manage Availability', icon: <Clock className="w-4 h-4" /> },
              { id: 'create_class', label: 'Create a Class', icon: <PlusCircle className="w-4 h-4" /> },
              { id: 'earnings', label: 'Payouts & Banking', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'students', label: 'Student Roster', icon: <Users className="w-4 h-4" /> },
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

          {/* Main Panel */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* 4 Clean Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle">
                    <span className="text-xs text-charcoal-500 font-medium block mb-1">Upcoming Lessons</span>
                    <span className="text-2xl font-bold text-navy-800">{teacherClasses.length}</span>
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
                    <span className="text-2xl font-bold text-navy-800">$0.00</span>
                    <span className="text-[11px] text-charcoal-400 block mt-1">Updates after lessons</span>
                  </div>
                </div>

                {/* Next Class Launch Card or Empty State */}
                {teacherClasses.length > 0 ? (
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
                  <h2 className="text-base font-bold text-navy-800">Your Scheduled Classes ({teacherClasses.length})</h2>
                  <button
                    onClick={() => setActiveTab('create_class')}
                    className="px-3 py-1.5 bg-navy-800 text-white rounded-lg text-xs font-semibold"
                  >
                    + Add Class
                  </button>
                </div>

                {teacherClasses.length > 0 ? (
                  teacherClasses.map((cls) => (
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

                      <Link
                        href={`/classroom/room-${cls.id}`}
                        className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Start Class</span>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-subtle text-center">
                    <p className="text-xs text-charcoal-500 mb-3">No classes published yet.</p>
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
                      className="px-6 py-2.5 bg-navy-800 hover:bg-navy-900 text-white rounded-lg font-bold text-xs shadow-subtle"
                    >
                      Publish Class
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
                      <button onClick={() => alert('Availability slot saved')} className="text-xs font-semibold text-navy-800 hover:underline">
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EARNINGS TAB */}
            {activeTab === 'earnings' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-4 text-xs">
                <h2 className="text-base font-bold text-navy-800">Bank Payout Coordinates & Balance</h2>
                <div className="p-4 bg-softblue-50 border border-softblue-200 rounded-lg">
                  <div className="font-bold text-navy-800 mb-1">Direct Bank Account Transfer</div>
                  <p className="text-[11px] text-charcoal-600">
                    Payouts are calculated in USD and disbursed in INR directly to your verified local Indian bank account via NEFT/IMPS.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="font-bold text-navy-800 text-sm">No Pending Payouts</div>
                  <p className="text-[11px] text-charcoal-500 mt-1">
                    Lesson fees accrue here upon completion of each scheduled session.
                  </p>
                </div>
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === 'students' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-4">
                <h2 className="text-base font-bold text-navy-800">Student Roster</h2>
                <div className="py-8 text-center text-xs text-charcoal-500">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="font-bold text-navy-800 text-sm">No Enrolled Students Yet</div>
                  <p className="max-w-xs mx-auto mt-1">
                    Once students book 1-on-1 sessions or enroll in your published classes, their contact details and learning goals will appear here.
                  </p>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}
