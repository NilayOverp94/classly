'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const initialRole = roleParam === 'teacher' ? 'teacher' : 'student';

  const [role, setRole] = useState<'student' | 'teacher'>(initialRole);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Student / Parent onboarding state
  const [parentName, setParentName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('Grade 8');
  const [learningFocus, setLearningFocus] = useState('');
  const [coppaConsent, setCoppaConsent] = useState(false);

  // Teacher onboarding state
  const [teacherName, setTeacherName] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [qualifications, setQualifications] = useState('');
  const [yearsExperience, setYearsExperience] = useState('5');
  const [hourlyRate, setHourlyRate] = useState('30');

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        // If not logged in, redirect to login
        router.replace('/login');
        return;
      }

      const email = (user.email || '').toLowerCase().trim();
      if (email === 'milayraj713@gmail.com' || email === 'nilayraj713@gmail.com') {
        router.replace('/admin');
        return;
      }

      setCurrentUser(user);
      const prefillName = user.user_metadata?.full_name || user.user_metadata?.name || '';
      setParentName(prefillName);
      setTeacherName(prefillName);

      if (user.user_metadata?.role === 'teacher' || roleParam === 'teacher') {
        setRole('teacher');
      }
    };

    fetchUser();
  }, [router, roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (role === 'student' && !coppaConsent) {
      setErrorMessage('Parental authorization under COPPA is required to activate a student account.');
      return;
    }

    setLoading(true);

    try {
      if (role === 'student') {
        await supabase.auth.updateUser({
          data: {
            role: 'parent',
            parent_name: parentName.trim(),
            full_name: parentName.trim(),
            student_name: studentName.trim(),
            student_grade: studentGrade,
            learning_goals: learningFocus.trim(),
            coppa_consented: true,
            onboarding_completed: true,
          },
        });
        router.push('/dashboard/student');
      } else {
        await supabase.auth.updateUser({
          data: {
            role: 'teacher',
            full_name: teacherName.trim(),
            teaching_subjects: [subject],
            qualifications: qualifications.trim(),
            years_experience: Number(yearsExperience),
            hourly_rate: Number(hourlyRate),
            onboarding_completed: true,
          },
        });
        router.push('/dashboard/teacher');
      }
    } catch (err: any) {
      console.error('Failed to update user profile:', err);
      // Fallback
      if (role === 'student') {
        router.push('/dashboard/student');
      } else {
        router.push('/dashboard/teacher');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#F9FAF8] dark:bg-[#09090b] text-navy-800 dark:text-zinc-100 selection:bg-softblue-200 selection:text-navy-900 overflow-hidden py-10 px-4 sm:px-6 transition-colors duration-200">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <Image
          src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2400&q=80"
          alt="Atmospheric study hall"
          fill
          priority
          className="object-cover object-center opacity-[0.14] dark:opacity-[0.05] blur-[3px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6]/92 via-[#F8F9FA]/88 to-[#F1F3F5]/96 dark:from-[#09090b]/95 dark:via-[#0c0c0e]/90 dark:to-[#09090b]/98" />
        <div 
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(#183153 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-lg w-full mx-auto">
        
        {/* Concentric Framing Architecture */}
        <div 
          className="rounded-[28px] p-2 transition-all duration-300 border border-charcoal-200/50 dark:border-[#27272a] bg-white/80 dark:bg-[#121215]/90 backdrop-blur-xl"
          style={{
            boxShadow: `
              0 1px 2px rgba(24, 49, 83, 0.03),
              0 4px 8px -2px rgba(24, 49, 83, 0.04),
              0 12px 24px -4px rgba(24, 49, 83, 0.06),
              0 28px 56px -12px rgba(24, 49, 83, 0.08)
            `,
          }}
        >
          <div className="rounded-[20px] bg-white dark:bg-[#121215] border border-charcoal-200/70 dark:border-[#27272a] p-7 sm:p-9 shadow-sm">
            
            {/* Header Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-3 tracking-wide uppercase bg-accent-50 dark:bg-amber-950/30 text-accent-700 dark:text-amber-400 border border-accent-200 dark:border-amber-800/40">
                <Sparkles className="w-3.5 h-3.5 text-accent-500 dark:text-amber-400" />
                <span>Account Setup Required</span>
              </div>

              <h1 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">
                Complete Your Profile
              </h1>
              <p className="mt-1.5 text-xs text-charcoal-500 dark:text-zinc-400 max-w-sm mx-auto">
                {currentUser?.email ? (
                  <>Signed in as <strong className="text-navy-900 dark:text-white">{currentUser.email}</strong>. Please provide your learning profile details to finish activating your account.</>
                ) : (
                  'Please provide your profile details to finish activating your learning account.'
                )}
              </p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-charcoal-100/80 dark:bg-[#18181c] rounded-2xl border border-charcoal-200/60 dark:border-[#27272a] mb-6">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  role === 'student'
                    ? 'bg-white dark:bg-[#121215] text-navy-900 dark:text-white shadow-sm font-bold border border-charcoal-200/40 dark:border-[#27272a]'
                    : 'text-charcoal-600 dark:text-zinc-400 hover:text-navy-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-accent-600 dark:text-amber-400' : 'text-charcoal-400 dark:text-zinc-500'}`} />
                <span className="text-xs">Student / Parent</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  role === 'teacher'
                    ? 'bg-white dark:bg-[#121215] text-navy-900 dark:text-white shadow-sm font-bold border border-charcoal-200/40 dark:border-[#27272a]'
                    : 'text-charcoal-600 dark:text-zinc-400 hover:text-navy-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${role === 'teacher' ? 'text-accent-600 dark:text-amber-400' : 'text-charcoal-400 dark:text-zinc-500'}`} />
                <span className="text-xs">Teacher / Tutor</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 dark:text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM: Student / Parent */}
            {role === 'student' ? (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">
                    Parent / Guardian Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. Jane Smith"
                    className="w-full h-10 px-3.5 bg-charcoal-50/60 dark:bg-[#18181c] border border-charcoal-200/90 dark:border-[#27272a] rounded-xl text-xs text-navy-900 dark:text-white placeholder-charcoal-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:border-navy-700 dark:focus:border-amber-400 focus:ring-2 focus:ring-navy-800/10 dark:focus:ring-amber-400/20 transition outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">
                      Student First & Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Alex Smith"
                      className="w-full h-10 px-3.5 bg-charcoal-50/60 dark:bg-[#18181c] border border-charcoal-200/90 dark:border-[#27272a] rounded-xl text-xs text-navy-900 dark:text-white placeholder-charcoal-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:border-navy-700 dark:focus:border-amber-400 focus:ring-2 focus:ring-navy-800/10 dark:focus:ring-amber-400/20 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">
                      Current Grade Level *
                    </label>
                    <select
                      value={studentGrade}
                      onChange={(e) => setStudentGrade(e.target.value)}
                      className="w-full h-10 px-3 bg-charcoal-50/60 dark:bg-[#18181c] border border-charcoal-200/90 dark:border-[#27272a] rounded-xl text-xs text-navy-900 dark:text-white focus:bg-white dark:focus:bg-[#18181c] focus:border-navy-700 dark:focus:border-amber-400 focus:ring-2 focus:ring-navy-800/10 dark:focus:ring-amber-400/20 transition outline-none"
                    >
                      <option value="Grade 5">Grade 5 (Elementary)</option>
                      <option value="Grade 6">Grade 6 (Middle School)</option>
                      <option value="Grade 7">Grade 7 (Middle School)</option>
                      <option value="Grade 8">Grade 8 (Middle School)</option>
                      <option value="Grade 9">Grade 9 (Freshman)</option>
                      <option value="Grade 10">Grade 10 (Sophomore)</option>
                      <option value="Grade 11">Grade 11 (Junior)</option>
                      <option value="Grade 12">Grade 12 (Senior)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">
                    Primary Subjects / Learning Focus
                  </label>
                  <input
                    type="text"
                    value={learningFocus}
                    onChange={(e) => setLearningFocus(e.target.value)}
                    placeholder="e.g. AP Calculus AB, SAT Math, Physics homework support"
                    className="w-full h-10 px-3.5 bg-charcoal-50/60 dark:bg-[#18181c] border border-charcoal-200/90 dark:border-[#27272a] rounded-xl text-xs text-navy-900 dark:text-white placeholder-charcoal-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:border-navy-700 dark:focus:border-amber-400 focus:ring-2 focus:ring-navy-800/10 dark:focus:ring-amber-400/20 transition outline-none"
                  />
                </div>

                {/* COPPA Consent */}
                <div className="pt-2 border-t border-charcoal-100 dark:border-gray-800">
                  <label className="flex items-start gap-2.5 cursor-pointer text-charcoal-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      required
                      checked={coppaConsent}
                      onChange={(e) => setCoppaConsent(e.target.checked)}
                      className="mt-0.5 accent-navy-800 dark:accent-amber-400 w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-[11px] leading-relaxed">
                      I confirm that I am the parent or legal guardian. I consent to Classly's{' '}
                      <Link href="/privacy" className="text-navy-900 dark:text-amber-400 underline font-semibold">
                        COPPA-compliant Privacy Policy
                      </Link>{' '}
                      and authorize tutoring session scheduling under parent supervision.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-4 bg-navy-800 dark:bg-amber-400 dark:text-zinc-950 font-bold hover:bg-navy-900 dark:hover:bg-amber-300 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  <span>{loading ? 'Activating account...' : 'Complete Setup & Open Classroom'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              /* FORM: Teacher / Tutor */
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">
                    Educator Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="e.g. Dr. Jane Smith"
                    className="w-full h-10 px-3.5 bg-charcoal-50/60 dark:bg-[#18181c] border border-charcoal-200/90 dark:border-[#27272a] rounded-xl text-xs text-navy-900 dark:text-white placeholder-charcoal-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:border-navy-700 dark:focus:border-amber-400 focus:ring-2 focus:ring-navy-800/10 dark:focus:ring-amber-400/20 transition outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">
                      Primary Subject *
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-10 px-3 bg-charcoal-50/60 dark:bg-[#18181c] border border-charcoal-200/90 dark:border-[#27272a] rounded-xl text-xs text-navy-900 dark:text-white focus:bg-white dark:focus:bg-[#18181c] focus:border-navy-700 dark:focus:border-amber-400 focus:ring-2 focus:ring-navy-800/10 dark:focus:ring-amber-400/20 transition outline-none"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Computer Science">Computer Science</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">
                      Hourly Rate ($ USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min={15}
                      max={150}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full h-10 px-3.5 bg-charcoal-50/60 dark:bg-[#18181c] border border-charcoal-200/90 dark:border-[#27272a] rounded-xl text-xs text-navy-900 dark:text-white placeholder-charcoal-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:border-navy-700 dark:focus:border-amber-400 focus:ring-2 focus:ring-navy-800/10 dark:focus:ring-amber-400/20 transition outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">
                    Highest Degree / University *
                  </label>
                  <input
                    type="text"
                    required
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    placeholder="e.g. M.Sc. in Mathematics, IIT Delhi"
                    className="w-full h-10 px-3.5 bg-charcoal-50/60 dark:bg-[#18181c] border border-charcoal-200/90 dark:border-[#27272a] rounded-xl text-xs text-navy-900 dark:text-white placeholder-charcoal-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:border-navy-700 dark:focus:border-amber-400 focus:ring-2 focus:ring-navy-800/10 dark:focus:ring-amber-400/20 transition outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">
                    Years of Teaching Experience *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={40}
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full h-10 px-3.5 bg-charcoal-50/60 dark:bg-[#18181c] border border-charcoal-200/90 dark:border-[#27272a] rounded-xl text-xs text-navy-900 dark:text-white placeholder-charcoal-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:border-navy-700 dark:focus:border-amber-400 focus:ring-2 focus:ring-navy-800/10 dark:focus:ring-amber-400/20 transition outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-4 bg-navy-800 dark:bg-amber-400 dark:text-zinc-950 font-bold hover:bg-navy-900 dark:hover:bg-amber-300 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  <span>{loading ? 'Activating educator profile...' : 'Complete Setup & Open Studio'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

          </div>
        </div>

      </div>

      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 text-center text-[11px] text-charcoal-400 dark:text-zinc-500">
        Classly Educational Marketplace • All student profiles protected by COPPA
      </footer>

    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9FAF8] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-navy-800/20 border-t-navy-800 rounded-full animate-spin" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
