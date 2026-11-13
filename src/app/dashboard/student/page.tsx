'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  CreditCard, 
  Star, 
  Settings, 
  User, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  ExternalLink,
  Download,
  AlertCircle
} from 'lucide-react';
import { mockBookings } from '@/lib/data/mockBookings';
import { mockTutors } from '@/lib/data/mockTutors';

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'upcoming' | 'past' | 'tutors' | 'materials' | 'payments' | 'settings'
  >('upcoming');

  const upcomingBookings = mockBookings.filter((b) => b.status === 'confirmed');
  const pastBookings = mockBookings.filter((b) => b.status === 'completed');

  return (
    <div className="bg-offwhite min-h-screen py-8 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Student / Parent Info Banner */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                alt="Ethan Miller"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-navy-800">
                  Ethan Miller
                </h1>
                <span className="text-[11px] font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                  Grade 8 • Active Student
                </span>
              </div>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Account Supervised by <strong>Jennifer Miller</strong> (Parent) • Local Time: New York (EST)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tutors"
              className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-semibold shadow-subtle"
            >
              + Book New Lesson
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
              { id: 'tutors', label: 'My Tutors', icon: <User className="w-4 h-4" /> },
              { id: 'materials', label: 'Learning Materials', icon: <FileText className="w-4 h-4" /> },
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
              <Link
                href="/login"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </Link>
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

                {upcomingBookings.map((b) => (
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
                          <span>Tomorrow at 05:00 PM EST</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2.5">
                      <Link
                        href={`/classroom/${b.meeting_room_id}`}
                        className="w-full md:w-auto px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-xs font-bold transition shadow-subtle flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Live Classroom</span>
                      </Link>
                      <button
                        onClick={() => alert('Rescheduling requests are accommodated up to 24 hours prior to class.')}
                        className="w-full md:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-gray-100"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Past History */}
            {activeTab === 'past' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-navy-800 mb-2">
                  Completed Lessons & Attendance
                </h2>
                {pastBookings.map((b) => (
                  <div key={b.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-subtle flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-navy-800">{b.subject} with {b.teacher_name}</div>
                      <div className="text-xs text-charcoal-500 mt-0.5">Completed • 60 mins • Implicit differentiation & calculus</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500">$32.00 Paid</span>
                      <button
                        onClick={() => alert('Thank you for providing feedback!')}
                        className="px-3 py-1.5 bg-softblue-100 text-navy-800 text-xs font-semibold rounded hover:bg-softblue-200"
                      >
                        Leave Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: My Tutors */}
            {activeTab === 'tutors' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-navy-800 mb-2">Booked Tutors</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockTutors.slice(0, 2).map((t) => (
                    <div key={t.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-subtle flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={t.avatar_url} alt={t.full_name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-navy-800 truncate">{t.full_name}</div>
                        <div className="text-[11px] text-charcoal-500">{t.subjects.join(', ')}</div>
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
              </div>
            )}

            {/* TAB: Learning Materials */}
            {activeTab === 'materials' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-4">
                <h2 className="text-base font-bold text-navy-800">Class Notes & Homework Sheets</h2>
                <div className="space-y-2 text-xs">
                  {[
                    { name: 'AP Calculus AB - Chapter 3 Derivatives Formula Sheet.pdf', date: 'Oct 28', size: '1.4 MB', author: 'Dr. Aarav Sharma' },
                    { name: 'Practice Worksheet - Related Rates & Optimization Problems.pdf', date: 'Oct 24', size: '820 KB', author: 'Dr. Aarav Sharma' },
                    { name: 'AP Physics 1 Rotational Motion Problem Set.pdf', date: 'Oct 19', size: '2.1 MB', author: 'Priya Nambiar' },
                  ].map((doc, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-navy-800" />
                        <div>
                          <div className="font-semibold text-navy-800">{doc.name}</div>
                          <div className="text-[11px] text-charcoal-500">Shared by {doc.author} • {doc.date}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Downloading ${doc.name}`)}
                        className="flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Payments & Receipts */}
            {activeTab === 'payments' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-4">
                <h2 className="text-base font-bold text-navy-800">Payment History & Tax Invoices</h2>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-charcoal-400 font-semibold uppercase text-[10px]">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-3 text-charcoal-600">Nov 12, 2026</td>
                      <td className="py-3 font-semibold text-navy-800">1-on-1 Lesson with Dr. Aarav Sharma</td>
                      <td className="py-3 font-bold text-navy-800">$32.00</td>
                      <td className="py-3"><span className="text-accent-600 font-semibold">Paid</span></td>
                      <td className="py-3 text-right">
                        <button onClick={() => alert('Receipt #REC-8921 downloaded')} className="text-navy-800 hover:underline font-semibold">Download</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-charcoal-600">Nov 04, 2026</td>
                      <td className="py-3 font-semibold text-navy-800">1-on-1 Lesson with Priya Nambiar</td>
                      <td className="py-3 font-bold text-navy-800">$28.00</td>
                      <td className="py-3"><span className="text-accent-600 font-semibold">Paid</span></td>
                      <td className="py-3 text-right">
                        <button onClick={() => alert('Receipt #REC-8730 downloaded')} className="text-navy-800 hover:underline font-semibold">Download</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: Settings */}
            {activeTab === 'settings' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-4 text-xs">
                <h2 className="text-base font-bold text-navy-800">Parental Control & Safety Settings</h2>
                <div className="p-4 bg-softblue-50 rounded-lg border border-softblue-200">
                  <div className="flex items-center gap-2 font-bold text-navy-800 mb-1">
                    <ShieldCheck className="w-4 h-4 text-accent-500" />
                    <span>Parent Supervised Mode Active</span>
                  </div>
                  <p className="text-[11px] text-charcoal-600">
                    All financial transactions, tutor bookings, and outbound contact requires authorization from parent email (jennifer.miller@example.com).
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

