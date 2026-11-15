'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Users, 
  ShieldCheck, 
  Clock, 
  Check, 
  X, 
  DollarSign, 
  GraduationCap, 
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TeacherProfile } from '@/lib/types';

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
  const [activeTab, setActiveTab] = useState<'applications' | 'teachers' | 'revenue' | 'complaints'>('applications');
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [activeTutors, setActiveTutors] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadAdminData() {
      try {
        // Fetch approved teachers
        const { data: approvedData } = await supabase
          .from('teacher_profiles')
          .select(`
            id,
            user_id,
            headline,
            bio,
            years_experience,
            hourly_rate,
            teaching_format,
            status,
            education,
            rating,
            review_count,
            total_hours_taught,
            city,
            country,
            profiles (
              full_name,
              avatar_url,
              email
            )
          `)
          .eq('status', 'approved');

        if (approvedData && approvedData.length > 0) {
          const mappedApproved: TeacherProfile[] = approvedData.map((t: any) => ({
            id: t.id,
            user_id: t.user_id,
            full_name: t.profiles?.full_name || 'Educator',
            avatar_url: t.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            headline: t.headline || 'Verified Educator',
            bio: t.bio || '',
            years_experience: t.years_experience || 0,
            hourly_rate: Number(t.hourly_rate) || 25,
            teaching_format: t.teaching_format || 'both',
            status: t.status,
            qualifications: [],
            education: t.education || '',
            teaching_methodology: '',
            rating: Number(t.rating) || 5.0,
            review_count: Number(t.review_count) || 0,
            total_hours_taught: Number(t.total_hours_taught) || 0,
            city: t.city || 'US',
            country: t.country || 'US',
            subjects: [],
            grades: [],
            languages: ['English'],
          }));
          setActiveTutors(mappedApproved);
        } else {
          setActiveTutors([]);
        }

        // Fetch pending teacher applications
        const { data: pendingData } = await supabase
          .from('teacher_profiles')
          .select(`
            id,
            education,
            years_experience,
            hourly_rate,
            created_at,
            status,
            profiles (
              full_name,
              email
            )
          `)
          .eq('status', 'pending');

        if (pendingData && pendingData.length > 0) {
          const mappedPending: PendingApplication[] = pendingData.map((p: any) => ({
            id: p.id,
            name: p.profiles?.full_name || 'Teacher Applicant',
            email: p.profiles?.email || 'applicant@classly.com',
            subjects: ['Mathematics'],
            education: p.education || 'University Degree',
            experience: `${p.years_experience || 1} years teaching`,
            hourlyRate: Number(p.hourly_rate) || 25,
            submittedAt: new Date(p.created_at).toLocaleDateString(),
            status: 'pending',
          }));
          setApplications(mappedPending);
        } else {
          setApplications([]);
        }
      } catch (err) {
        console.error('Error loading admin records:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const handleApprove = async (app: PendingApplication) => {
    try {
      await supabase
        .from('teacher_profiles')
        .update({ status: 'approved' })
        .eq('id', app.id);
    } catch (e) {
      console.error(e);
    }

    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, status: 'approved' } : a))
    );

    setActiveTutors((prev) => [
      ...prev,
      {
        id: app.id,
        full_name: app.name,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        headline: `${app.education} • Verified Educator`,
        bio: `${app.experience}. Specialized in ${app.subjects.join(', ')}.`,
        years_experience: 5,
        hourly_rate: app.hourlyRate,
        teaching_format: 'both',
        status: 'approved',
        qualifications: [app.education],
        education: app.education,
        teaching_methodology: 'Structured problem deconstruction and practice sets.',
        rating: 5.0,
        review_count: 0,
        total_hours_taught: 0,
        city: 'US',
        country: 'US',
        subjects: app.subjects,
        grades: ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
        languages: ['English'],
      },
    ]);
  };

  const handleReject = async (id: string) => {
    try {
      await supabase
        .from('teacher_profiles')
        .update({ status: 'rejected' })
        .eq('id', id);
    } catch (e) {
      console.error(e);
    }

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'rejected' } : app))
    );
  };

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

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
              Educator compliance review, teacher verification queue, and platform ledger monitoring.
            </p>
          </div>

          <div className="text-right text-xs text-gray-300">
            <div>Logged in: <strong className="text-white">milayraj713@gmail.com</strong></div>
            <span>Marketplace Mode: <strong className="text-accent-400">Live Production</strong></span>
          </div>
        </div>

        {/* Real Operational Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle">
            <span className="text-[11px] text-charcoal-500 font-semibold uppercase tracking-wider block">Pending Applications</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">{pendingCount}</span>
            <span className="text-[10px] text-charcoal-400">Awaiting credential review</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle">
            <span className="text-[11px] text-charcoal-500 font-semibold uppercase tracking-wider block">Approved Educators</span>
            <span className="text-2xl font-bold text-navy-800 mt-1 block">{activeTutors.length}</span>
            <span className="text-[10px] text-accent-600">Active on marketplace</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle">
            <span className="text-[11px] text-charcoal-500 font-semibold uppercase tracking-wider block">Core Subject Tracks</span>
            <span className="text-2xl font-bold text-navy-800 mt-1 block">8</span>
            <span className="text-[10px] text-charcoal-400">Curricula configured</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle">
            <span className="text-[11px] text-charcoal-500 font-semibold uppercase tracking-wider block">Platform Commission</span>
            <span className="text-2xl font-bold text-navy-800 mt-1 block">15%</span>
            <span className="text-[10px] text-charcoal-400">Standard market take</span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-2 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'applications', label: 'Tutor Verification Queue', badge: pendingCount },
            { id: 'teachers', label: `Approved Educators (${activeTutors.length})` },
            { id: 'revenue', label: 'Marketplace Ledger & Commission' },
            { id: 'complaints', label: 'Disputes & Refunds (0)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 transition flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
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

        {/* Tab 1: Applications Verification Queue */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-subtle overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-navy-800">Educator Compliance Verification Queue</h3>
                <p className="text-xs text-charcoal-500">
                  Review applicant transcripts, university degrees, and identity verification before approving public listing.
                </p>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center text-xs text-charcoal-500">
                <CheckCircle2 className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                <div className="font-bold text-navy-800 text-sm">Verification Queue Empty</div>
                <p className="text-charcoal-400 mt-1 max-w-sm mx-auto">
                  No educator applications currently awaiting compliance review. New teacher signups will populate here.
                </p>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-charcoal-500 uppercase text-[10px] font-semibold">
                    <th className="p-3.5">Applicant</th>
                    <th className="p-3.5">Education / Degree</th>
                    <th className="p-3.5">Subjects</th>
                    <th className="p-3.5">Experience</th>
                    <th className="p-3.5">Rate</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
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
                            Approved & Active
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
                              onClick={() => handleApprove(app)}
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
            )}
          </div>
        )}

        {/* Tab 2: Approved Teachers */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-subtle p-5">
            <h3 className="font-bold text-sm text-navy-800 mb-3">Live Roster of Approved Educators ({activeTutors.length})</h3>
            {activeTutors.length === 0 ? (
              <div className="p-10 text-center text-xs text-charcoal-500">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="font-bold text-navy-800 text-sm">No Approved Educators Yet</div>
                <p className="text-charcoal-400 mt-1 max-w-sm mx-auto">
                  When teacher applications are approved from the verification queue, they will appear in this live marketplace roster.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 text-xs">
                {activeTutors.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image src={t.avatar_url} alt={t.full_name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-navy-800">{t.full_name}</div>
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
            )}
          </div>
        )}

        {/* Tab 3: Revenue & Ledger */}
        {activeTab === 'revenue' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-subtle p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-navy-800">Financial Ledger & Automated Split Architecture</h3>
            <p className="text-charcoal-600 leading-relaxed">
              When students complete a booking, the payment is captured in USD. 85% is transferred to the educator's payout reserve, and 15% is retained as the Classly platform commission.
            </p>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center py-8">
              <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="font-bold text-navy-800 text-sm">Marketplace Ledger Ready</div>
              <p className="text-[11px] text-charcoal-500 mt-1 max-w-sm mx-auto">
                Transactions will populate here in real-time as users schedule and pay for lessons.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Complaints */}
        {activeTab === 'complaints' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-subtle p-6 space-y-3 text-xs">
            <h3 className="font-bold text-base text-navy-800">Customer Reports & Mediation</h3>
            <p className="text-charcoal-600">No open customer complaints or unresolved dispute reports currently flagged.</p>
          </div>
        )}

      </div>
    </div>
  );
}
