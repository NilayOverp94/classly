'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';
import { mockTutors } from '@/lib/data/mockTutors';

interface PendingApplication {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  education: string;
  experience: string;
  hourlyRate: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'applications' | 'teachers' | 'students' | 'revenue' | 'complaints'>('applications');
  
  // Pending Applications state
  const [applications, setApplications] = useState<PendingApplication[]>([
    {
      id: 'app-901',
      name: 'Dr. Suresh Narayanan',
      email: 'suresh.n@example.com',
      subjects: ['Physics', 'Mathematics'],
      education: 'Ph.D. in Theoretical Physics (IIT Madras)',
      experience: '8 years coaching AP & JEE',
      hourlyRate: 30,
      submittedAt: 'Today, 10:14 AM',
      status: 'pending',
    },
    {
      id: 'app-902',
      name: 'Aditi Deshmukh',
      email: 'aditi.d@example.com',
      subjects: ['Chemistry', 'Biology'],
      education: 'M.Sc. Organic Chemistry (University of Mumbai)',
      experience: '5 years high school educator',
      hourlyRate: 24,
      submittedAt: 'Yesterday, 04:30 PM',
      status: 'pending',
    },
    {
      id: 'app-903',
      name: 'Rohit Khandelwal',
      email: 'rohit.k@example.com',
      subjects: ['Computer Science'],
      education: 'B.Tech CS (BITS Pilani)',
      experience: '4 years Python & AP CS A tutor',
      hourlyRate: 28,
      submittedAt: 'Nov 12, 2026',
      status: 'pending',
    },
  ]);

  const handleApprove = (id: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'approved' } : app))
    );
  };

  const handleReject = (id: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'rejected' } : app))
    );
  };

  return (
    <div className="bg-offwhite min-h-screen py-8 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="bg-navy-900 text-white p-6 rounded-xl border border-navy-800 shadow-lift mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-accent-400" />
              <h1 className="text-xl font-bold">Classly Administrator Console</h1>
              <span className="text-[11px] font-semibold bg-navy-800 text-accent-400 px-2 py-0.5 rounded border border-navy-700">
                Superuser Access
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Platform governance, educator compliance vetting, transaction auditing, and dispute mediation.
            </p>
          </div>

          <div className="text-right text-xs text-gray-300">
            <span>Environment: <strong>Production (US/Global)</strong></span>
          </div>
        </div>

        {/* 6 Key Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle">
            <span className="text-[11px] text-charcoal-500 font-semibold uppercase tracking-wider block">Total Students</span>
            <span className="text-2xl font-bold text-navy-800 mt-1 block">1,420</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle">
            <span className="text-[11px] text-charcoal-500 font-semibold uppercase tracking-wider block">Active Tutors</span>
            <span className="text-2xl font-bold text-navy-800">86</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle">
            <span className="text-[11px] text-charcoal-500 font-semibold uppercase tracking-wider block">Pending Apps</span>
            <span className="text-2xl font-bold text-amber-600">
              {applications.filter((a) => a.status === 'pending').length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle">
            <span className="text-[11px] text-charcoal-500 font-semibold uppercase tracking-wider block">Total Bookings</span>
            <span className="text-2xl font-bold text-navy-800">3,890</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle">
            <span className="text-[11px] text-charcoal-500 font-semibold uppercase tracking-wider block">Gross Volume</span>
            <span className="text-2xl font-bold text-navy-800">$118.4k</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle">
            <span className="text-[11px] text-charcoal-500 font-semibold uppercase tracking-wider block">Platform Net (15%)</span>
            <span className="text-2xl font-bold text-accent-600">$17.7k</span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-2 text-xs font-semibold">
          {[
            { id: 'applications', label: 'Tutor Verification Queue', badge: applications.filter((a) => a.status === 'pending').length },
            { id: 'teachers', label: 'All Teachers' },
            { id: 'students', label: 'All Students' },
            { id: 'revenue', label: 'Transactions & Payouts' },
            { id: 'complaints', label: 'Reports & Refunds' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 transition flex items-center gap-1.5 border-b-2 ${
                activeTab === tab.id
                  ? 'border-navy-800 text-navy-800 font-bold'
                  : 'border-transparent text-charcoal-500 hover:text-navy-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-navy-800">Pending Tutor Applications</h3>
                <p className="text-xs text-charcoal-500">
                  Review applicant degrees, identity credentials, and proposed hourly rates.
                </p>
              </div>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-charcoal-500 uppercase text-[10px] font-semibold">
                  <th className="p-3.5">Applicant</th>
                  <th className="p-3.5">Education / Degree</th>
                  <th className="p-3.5">Subjects</th>
                  <th className="p-3.5">Experience</th>
                  <th className="p-3.5">Rate</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/60">
                    <td className="p-3.5 font-bold text-navy-800">
                      <div>{app.name}</div>
                      <div className="text-[11px] text-charcoal-400 font-normal">{app.email}</div>
                    </td>
                    <td className="p-3.5 text-charcoal-700">{app.education}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {app.subjects.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-softblue-50 text-navy-800 text-[10px] font-medium border border-softblue-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-charcoal-700">{app.experience}</td>
                    <td className="p-3.5 font-bold text-navy-800">${app.hourlyRate}/hr</td>
                    <td className="p-3.5">
                      {app.status === 'pending' && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold border border-amber-200">
                          Pending Audit
                        </span>
                      )}
                      {app.status === 'approved' && (
                        <span className="px-2 py-0.5 bg-accent-50 text-accent-700 rounded text-[10px] font-semibold border border-accent-200">
                          Approved
                        </span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-semibold border border-red-200">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {app.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="px-2.5 py-1 bg-accent-500 hover:bg-accent-600 text-white rounded font-semibold text-[11px] flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded font-semibold text-[11px] flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Action complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TEACHERS TAB */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-subtle p-5">
            <h3 className="font-bold text-sm text-navy-800 mb-3">Live Roster of Approved Educators</h3>
            <div className="divide-y divide-gray-100 text-xs">
              {mockTutors.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image src={t.avatar_url} alt={t.full_name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-navy-800">{t.full_name} ({t.city}, {t.country})</div>
                      <div className="text-[11px] text-charcoal-500">{t.headline}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-navy-800">${t.hourly_rate}/hr</div>
                    <div className="text-[11px] text-accent-600 font-semibold">Active & Approved</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === 'revenue' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-subtle p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-navy-800">Financial Ledger & Split Commissions</h3>
            <p className="text-charcoal-600">
              Student payments processed via Razorpay international card gateway. 85% allocated to teacher payout reserve, 15% retained as Classly gross marketplace take.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-charcoal-500 block mb-1">Gross Inflows (MTD)</span>
                <span className="text-xl font-bold text-navy-800">$18,450.00</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-charcoal-500 block mb-1">Teacher Payouts Due</span>
                <span className="text-xl font-bold text-navy-800">$15,682.50</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-charcoal-500 block mb-1">Platform Revenue Retained</span>
                <span className="text-xl font-bold text-accent-600">$2,767.50</span>
              </div>
            </div>
          </div>
        )}

        {/* COMPLAINTS TAB */}
        {activeTab === 'complaints' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-subtle p-6 space-y-3 text-xs">
            <h3 className="font-bold text-base text-navy-800">Disputes & Refund Mediation</h3>
            <p className="text-charcoal-600">No open customer complaints or unresolved refund requests currently flagged.</p>
          </div>
        )}

      </div>
    </div>
  );
}

