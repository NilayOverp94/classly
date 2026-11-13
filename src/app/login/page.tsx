'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, GraduationCap } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (role === 'teacher') router.push('/dashboard/teacher');
      else if (role === 'admin') router.push('/admin');
      else router.push('/dashboard/student');
    }, 500);
  };

  const handleQuickDemo = (demoRole: 'student' | 'teacher' | 'admin') => {
    if (demoRole === 'student') router.push('/dashboard/student');
    else if (demoRole === 'teacher') router.push('/dashboard/teacher');
    else router.push('/admin');
  };

  return (
    <div className="bg-offwhite min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-card p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <Logo size="md" className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-navy-800 tracking-tight">
            Log in to Classly
          </h1>
          <p className="mt-1 text-xs text-charcoal-600">
            Welcome back. Please select your account role to continue.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg text-xs font-semibold mb-6">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`py-2 rounded-md transition ${
              role === 'student' ? 'bg-white text-navy-800 shadow-subtle' : 'text-charcoal-600 hover:text-navy-800'
            }`}
          >
            Student / Parent
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`py-2 rounded-md transition ${
              role === 'teacher' ? 'bg-white text-navy-800 shadow-subtle' : 'text-charcoal-600 hover:text-navy-800'
            }`}
          >
            Teacher
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`py-2 rounded-md transition ${
              role === 'admin' ? 'bg-white text-navy-800 shadow-subtle' : 'text-charcoal-600 hover:text-navy-800'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-navy-600 focus:bg-white text-navy-800"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-charcoal-700">Password</label>
              <a href="#" className="text-[11px] text-accent-600 hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-navy-600 focus:bg-white text-navy-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-lg transition shadow-subtle flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider mb-2.5 text-center">
            One-Click Demo Portals
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              onClick={() => handleQuickDemo('student')}
              className="py-1.5 px-2 bg-softblue-50 border border-softblue-200 text-navy-800 rounded font-semibold hover:bg-softblue-100 text-center"
            >
              Demo Student
            </button>
            <button
              onClick={() => handleQuickDemo('teacher')}
              className="py-1.5 px-2 bg-accent-50 border border-accent-200 text-accent-700 rounded font-semibold hover:bg-accent-100 text-center"
            >
              Demo Teacher
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-gray-100 border border-gray-300 text-charcoal-700 rounded font-semibold hover:bg-gray-200 text-center"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Register link */}
        <div className="mt-6 text-center text-xs text-charcoal-600">
          Don't have an account yet?{' '}
          <Link href="/register/student" className="font-bold text-navy-800 hover:underline">
            Register as Student / Parent
          </Link>
          {' · '}
          <Link href="/become-a-tutor" className="font-bold text-accent-600 hover:underline">
            Teach on Classly
          </Link>
        </div>

      </div>
    </div>
  );
}

