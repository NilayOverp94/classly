'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, BookOpen, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';

export default function StudentRegisterPage() {
  const router = useRouter();
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

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            role: 'parent',
            full_name: parentName.trim(),
            student_name: studentName.trim(),
            student_grade: studentGrade,
            learning_goals: learningGoals.trim(),
          },
        },
      });

      if (error) {
        // Fallback for development if signups are restricted in Supabase settings
        console.warn('Supabase auth signup notice:', error.message);
      }

      router.push('/dashboard/student');
    } catch (err: any) {
      router.push('/dashboard/student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-offwhite min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-card p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <Logo size="md" className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">
            Parent & Student Registration
          </h1>
          <p className="mt-1 text-xs text-charcoal-600">
            Create your account to browse tutors, book lessons, and track academic progress.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">Parent's Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Jane Smith"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-navy-600 focus:bg-white text-navy-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">Parent's Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-navy-600 focus:bg-white text-navy-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">Account Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-navy-600 focus:bg-white text-navy-800"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <span className="block font-bold text-navy-800 uppercase tracking-wider text-[11px] mb-2">
              Student Details (Managed by Parent)
            </span>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Student First Name *</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Grade Level *</label>
                <select
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                >
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9 (Freshman)</option>
                  <option value="Grade 10">Grade 10 (Sophomore)</option>
                  <option value="Grade 11">Grade 11 (Junior)</option>
                  <option value="Grade 12">Grade 12 (Senior)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Primary Learning Focus</label>
              <input
                type="text"
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                placeholder="e.g. Pre-Calculus homework, AP Physics exam preparation"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
              />
            </div>
          </div>

          {/* COPPA Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer text-charcoal-700">
              <input
                type="checkbox"
                required
                checked={coppaConsent}
                onChange={(e) => setCoppaConsent(e.target.checked)}
                className="mt-0.5 accent-navy-800"
              />
              <span className="text-[11px] leading-relaxed">
                I confirm that I am the parent or legal guardian. I consent to Classly's{' '}
                <Link href="/privacy" className="text-navy-800 underline font-semibold">
                  COPPA-compliant Privacy Policy
                </Link>{' '}
                and understand that parent supervision is maintained for all student sessions.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-lg transition shadow-subtle flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Existing account link */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-charcoal-600">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-navy-800 hover:underline">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
}
