'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/MotionComponents';

interface PendingApplication {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  subjects: string[];
  education: string;
  experience: string;
  hourlyRate: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'applications' | 'teachers' | 'revenue' | 'complaints'>('applications');
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [activeTutors, setActiveTutors] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string>('milayraj713@gmail.com');

  const supabase = createClient();

  useEffect(() => {
    async function loadAdminData() {
      try {
        // Authenticate admin user
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = (user?.email || '').toLowerCase().trim();
        const isAdmin = userEmail === 'milayraj713@gmail.com' || userEmail === 'nilayraj713@gmail.com';

        if (!user || !isAdmin) {
          router.replace('/login');
          return;
        }

        setAdminEmail(userEmail);

        // Fetch pending and approved teachers from dedicated Admin API
        const res = await fetch('/api/admin/teachers', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setApplications(data.pending || []);
          setActiveTutors(data.approved || []);
        } else {
          setApplications([]);
          setActiveTutors([]);
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
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: app.id, action: 'approve' }),
      });

      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== app.id));
        setActiveTutors((prev) => [
          ...prev,
          {
            id: app.id,
            user_id: app.id,
            full_name: app.name,
            avatar_url: app.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=0B121E&color=ffffff&size=256&bold=true`,
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
            city: 'India',
            country: 'India',
            subjects: app.subjects,
            grades: ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
            languages: ['English'],
          } as any,
        ]);
      }
    } catch (e) {
      console.error('Error approving teacher:', e);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'reject' }),
      });

      if (res.ok) {
        setApplications((prev) => prev.filter((app) => app.id !== id));
      }
    } catch (e) {
      console.error('Error rejecting teacher:', e);
    }
  };

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <div className="bg-offwhite dark:bg-[#09090b] min-h-screen py-8 border-b border-gray-200 dark:border-[#27272a] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <FadeIn direction="up" delay={0.05} duration={0.45}>
          <div className="bg-navy-900 dark:bg-[#121215] text-white p-6 rounded-xl border border-navy-800 dark:border-[#27272a] shadow-lift mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-accent-400 dark:text-amber-400" />
                <h1 className="text-xl font-bold">Classly Administrator Console</h1>
                <span className="text-[11px] font-semibold bg-navy-800 dark:bg-[#18181c] text-accent-400 dark:text-amber-400 px-2 py-0.5 rounded border border-navy-700 dark:border-[#27272a]">
                  Superuser Access
                </span>
              </div>
              <p className="text-xs text-gray-300 dark:text-zinc-400">
                Educator compliance review, teacher verification queue, and platform ledger monitoring.
              </p>
            </div>

            <div className="text-right text-xs text-gray-300 dark:text-zinc-400">
              <div>Logged in: <strong className="text-white">{adminEmail}</strong></div>
              <span>Marketplace Mode: <strong className="text-accent-400 dark:text-amber-400">Live Production</strong></span>
            </div>
          </div>
        </FadeIn>

        {/* Real Operational Metrics */}
        <StaggerContainer staggerDelay={0.07} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StaggerItem distance={14} duration={0.4}>
            <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle hover:shadow-card transition-all">
              <span className="text-[11px] text-charcoal-500 dark:text-zinc-400 font-semibold uppercase tracking-wider block">Pending Applications</span>
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">{pendingCount}</span>
              <span className="text-[10px] text-charcoal-400 dark:text-zinc-500">Awaiting credential review</span>
            </div>
          </StaggerItem>
          <StaggerItem distance={14} duration={0.4}>
            <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle hover:shadow-card transition-all">
              <span className="text-[11px] text-charcoal-500 dark:text-zinc-400 font-semibold uppercase tracking-wider block">Approved Educators</span>
              <span className="text-2xl font-bold text-navy-800 dark:text-white mt-1 block">{activeTutors.length}</span>
              <span className="text-[10px] text-accent-600 dark:text-amber-400">Active on marketplace</span>
            </div>
          </StaggerItem>
          <StaggerItem distance={14} duration={0.4}>
            <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle hover:shadow-card transition-all">
              <span className="text-[11px] text-charcoal-500 dark:text-zinc-400 font-semibold uppercase tracking-wider block">Core Subject Tracks</span>
              <span className="text-2xl font-bold text-navy-800 dark:text-white mt-1 block">8</span>
              <span className="text-[10px] text-charcoal-400 dark:text-zinc-500">Curricula configured</span>
            </div>
          </StaggerItem>
          <StaggerItem distance={14} duration={0.4}>
            <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle hover:shadow-card transition-all">
              <span className="text-[11px] text-charcoal-500 dark:text-zinc-400 font-semibold uppercase tracking-wider block">Platform Commission</span>
              <span className="text-2xl font-bold text-navy-800 dark:text-white mt-1 block">15%</span>
              <span className="text-[10px] text-charcoal-400 dark:text-zinc-500">Standard market take</span>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-[#27272a] mb-6 gap-2 text-xs font-semibold overflow-x-auto">
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
                  ? 'border-navy-800 dark:border-amber-500/40 text-navy-800 dark:text-white font-bold'
                  : 'border-transparent text-charcoal-500 dark:text-zinc-400 hover:text-navy-800 dark:hover:text-white'
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
          <div className="bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-[#18181c] border-b border-gray-200 dark:border-[#27272a] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-navy-800 dark:text-white">Educator Compliance Verification Queue</h3>
                <p className="text-xs text-charcoal-500 dark:text-zinc-400">
                  Review applicant transcripts, university degrees, and identity verification before approving public listing.
                </p>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center text-xs text-charcoal-500 dark:text-zinc-400">
                <CheckCircle2 className="w-8 h-8 text-accent-500 dark:text-amber-400 mx-auto mb-2" />
                <div className="font-bold text-navy-800 dark:text-white text-sm">Verification Queue Empty</div>
                <p className="text-charcoal-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
                  No educator applications currently awaiting compliance review. New teacher signups will populate here.
                </p>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#18181c] border-b border-gray-200 dark:border-[#27272a] text-charcoal-500 dark:text-zinc-400 uppercase text-[10px] font-semibold">
                    <th className="p-3.5">Applicant</th>
                    <th className="p-3.5">Education / Degree</th>
                    <th className="p-3.5">Subjects</th>
                    <th className="p-3.5">Experience</th>
                    <th className="p-3.5">Rate</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/60 dark:hover:bg-[#18181c]/60 transition">
                      <td className="p-3.5 font-bold text-navy-800 dark:text-white">
                        <div>{app.name}</div>
                        <div className="text-[11px] text-charcoal-400 dark:text-zinc-500 font-normal">{app.email}</div>
                      </td>
                      <td className="p-3.5 text-charcoal-700 dark:text-zinc-300">{app.education}</td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {app.subjects.map((s) => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-softblue-50 dark:bg-[#18181c] text-navy-800 dark:text-amber-400 text-[10px] font-medium border border-softblue-200 dark:border-[#27272a]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5 text-charcoal-700 dark:text-zinc-300">{app.experience}</td>
                      <td className="p-3.5 font-bold text-navy-800 dark:text-white">${app.hourlyRate}/hr</td>
                      <td className="p-3.5">
                        {app.status === 'pending' && (
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded text-[10px] font-semibold border border-amber-200 dark:border-amber-800">
                            Pending Audit
                          </span>
                        )}
                        {app.status === 'approved' && (
                          <span className="px-2 py-0.5 bg-accent-50 dark:bg-amber-950/30 text-accent-700 dark:text-amber-400 rounded text-[10px] font-semibold border border-accent-200 dark:border-amber-800/40">
                            Approved & Active
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded text-[10px] font-semibold border border-red-200 dark:border-red-800">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {app.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(app)}
                              className="px-2.5 py-1 bg-accent-500 dark:bg-amber-400 dark:text-zinc-950 font-bold hover:bg-accent-600 dark:hover:bg-amber-300 text-white rounded font-semibold text-[11px] flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded font-semibold text-[11px] flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 dark:text-zinc-500 italic">Action complete</span>
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
          <div className="bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle p-5">
            <h3 className="font-bold text-sm text-navy-800 dark:text-white mb-3">Live Roster of Approved Educators ({activeTutors.length})</h3>
            {activeTutors.length === 0 ? (
              <div className="p-10 text-center text-xs text-charcoal-500 dark:text-zinc-400">
                <Users className="w-8 h-8 text-gray-400 dark:text-zinc-500 mx-auto mb-2" />
                <div className="font-bold text-navy-800 dark:text-white text-sm">No Approved Educators Yet</div>
                <p className="text-charcoal-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
                  When teacher applications are approved from the verification queue, they will appear in this live marketplace roster.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {activeTutors.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                        <Image src={t.avatar_url} alt={t.full_name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-navy-800 dark:text-white">{t.full_name}</div>
                        <div className="text-[11px] text-charcoal-500 dark:text-zinc-400">{t.headline}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-navy-800 dark:text-white">${t.hourly_rate}/hr</div>
                      <div className="text-[11px] text-accent-600 dark:text-amber-400 font-semibold">Active & Approved</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Revenue & Ledger */}
        {activeTab === 'revenue' && (
          <div className="bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-navy-800 dark:text-white">Financial Ledger & Automated Split Architecture</h3>
            <p className="text-charcoal-600 dark:text-zinc-400 leading-relaxed">
              When students complete a booking, the payment is captured in USD. 85% is transferred to the educator's payout reserve, and 15% is retained as the Classly platform commission.
            </p>
            <div className="p-4 bg-gray-50 dark:bg-[#18181c] rounded-lg border border-gray-200 dark:border-[#27272a] text-center py-8">
              <DollarSign className="w-8 h-8 text-gray-400 dark:text-zinc-500 mx-auto mb-2" />
              <div className="font-bold text-navy-800 dark:text-white text-sm">Marketplace Ledger Ready</div>
              <p className="text-[11px] text-charcoal-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Transactions will populate here in real-time as users schedule and pay for lessons.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Complaints */}
        {activeTab === 'complaints' && (
          <div className="bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle p-6 space-y-3 text-xs">
            <h3 className="font-bold text-base text-navy-800 dark:text-white">Customer Reports & Mediation</h3>
            <p className="text-charcoal-600 dark:text-zinc-400">No open customer complaints or unresolved dispute reports currently flagged.</p>
          </div>
        )}

      </div>
    </div>
  );
}
