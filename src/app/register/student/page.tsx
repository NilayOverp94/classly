'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, User, BookOpen, AlertCircle, ArrowRight, ShieldCheck, Gift, Sparkles } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';
import { ScaleIn } from '@/components/ui/MotionComponents';

function StudentRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams?.get('ref') || '';
  const supabase = createClient();

  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('Grade 8');
  const [learningGoals, setLearningGoals] = useState('');
  const [coppaConsent, setCoppaConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coppaConsent) {
      setErrorMessage('Parental consent under COPPA is required for student registration.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          fullName: parentName.trim(),
          role: 'student',
          studentName: studentName.trim(),
          studentGrade: studentGrade,
          learningGoals: learningGoals.trim(),
          appliedReferralCode: refCode || undefined,
        }),
      });

      const regData = await regRes.json();

      if (!regRes.ok) {
        setErrorMessage(regData.error || 'Failed to complete registration.');
        setLoading(false);
        return;
      }

      // Establish authenticated session
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (signInErr) {
        router.push('/login?role=student');
        return;
      }

      router.push('/dashboard/student');
    } catch (err: any) {
      setErrorMessage('Registration server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-offwhite dark:bg-[#09090b] min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors duration-200">
      <ScaleIn className="max-w-md w-full">
        <div className="w-full bg-white dark:bg-[#121215] rounded-2xl border border-gray-200 dark:border-[#27272a] shadow-card p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <Logo size="md" className="justify-center mb-4" />
            <h1 className="text-2xl font-bold text-navy-800 dark:text-white tracking-tight">
              Parent & Student Registration
            </h1>
            <p className="mt-1 text-xs text-charcoal-600 dark:text-zinc-300">
              Create your account to browse tutors, book lessons, and track academic progress.
            </p>
          </div>

          {/* $20 Referral Welcome Banner */}
          {refCode && (
            <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-300 dark:border-amber-700/40 text-emerald-800 dark:text-amber-300 text-xs flex items-center gap-2.5 shadow-xs">
              <div className="p-1.5 rounded-lg bg-emerald-500 text-white shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold flex items-center gap-1 text-navy-900 dark:text-white">
                  <span>$20 Welcome Credit Activated!</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-amber-400 mt-0.5">
                  Referred via code <strong>{refCode}</strong>. Your credit will be automatically attached to your new account.
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div>
              <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">Parent's Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-400 dark:text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-[#323238] bg-white dark:bg-[#18181c] text-charcoal-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-navy-800 dark:focus:ring-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">Parent / Guardian Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 dark:text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-[#323238] bg-white dark:bg-[#18181c] text-charcoal-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-navy-800 dark:focus:ring-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 dark:text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-[#323238] bg-white dark:bg-[#18181c] text-charcoal-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-navy-800 dark:focus:ring-amber-400 transition"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-[#27272a]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 dark:text-zinc-400 mb-2">
                Student Details
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">Student First Name *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Liam"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#323238] bg-white dark:bg-[#18181c] text-charcoal-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-navy-800 dark:focus:ring-amber-400 transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">Grade Level *</label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="w-full px-2.5 py-2 border border-gray-300 dark:border-[#323238] bg-white dark:bg-[#18181c] text-charcoal-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-navy-800 dark:focus:ring-amber-400 transition"
                  >
                    <option value="Elementary (K-5)">Elementary (K-5)</option>
                    <option value="Middle School (6-8)">Middle School (6-8)</option>
                    <option value="High School (9-10)">High School (9-10)</option>
                    <option value="High School (11-12)">High School (11-12)</option>
                    <option value="AP / College Prep">AP / College Prep</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 dark:text-zinc-300 mb-1">Learning Goals or Subject Needs</label>
                <input
                  type="text"
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  placeholder="e.g. Algebra 1 support, AP Chemistry exam prep"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#323238] bg-white dark:bg-[#18181c] text-charcoal-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-navy-800 dark:focus:ring-amber-400 transition"
                />
              </div>
            </div>

            {/* COPPA Consent */}
            <div className="pt-2">
              <label className="flex items-start gap-2 text-charcoal-600 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={coppaConsent}
                  onChange={(e) => setCoppaConsent(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-navy-800 focus:ring-navy-800 dark:focus:ring-amber-400"
                />
                <span className="text-[11px] leading-tight">
                  I confirm that I am the parent or legal guardian of this student and consent to their participation under COPPA guidelines.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 bg-navy-800 hover:bg-navy-900 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-zinc-950 font-bold text-white font-bold rounded-lg transition shadow-subtle flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Existing account link */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#27272a] text-center text-xs text-charcoal-600 dark:text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-navy-800 dark:text-amber-400 hover:underline">
              Log In
            </Link>
          </div>

        </div>
      </ScaleIn>
    </div>
  );
}

export default function StudentRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-charcoal-500 dark:text-zinc-400">Loading registration...</div>}>
      <StudentRegisterContent />
    </Suspense>
  );
}
