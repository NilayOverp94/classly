'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Check, 
  ArrowLeft,
  HelpCircle,
  GraduationCap,
  BookOpen,
  User,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ScaleIn } from '@/components/ui/MotionComponents';

type PortalRole = 'student' | 'teacher';
type AuthMode = 'signin' | 'signup';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get('role');
  const initialRole: PortalRole = initialRoleParam === 'teacher' ? 'teacher' : 'student';

  const [mode, setMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<PortalRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Signed In Successfully');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleRoleChange = (newRole: PortalRole) => {
    setRole(newRole);
    setErrorMessage(null);
    const url = new URL(window.location.href);
    url.searchParams.set('role', newRole);
    window.history.replaceState({}, '', url.toString());
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
  };

  const triggerSuccessTransition = (destination: string, isAdmin: boolean, customMsg?: string) => {
    setLoading(false);
    setSuccess(true);
    if (isAdmin) {
      setSuccessMessage('Administrator Access Verified');
    } else if (customMsg) {
      setSuccessMessage(customMsg);
    }
    setTimeout(() => {
      router.push(destination);
    }, 900);
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const isAdmin = cleanEmail === 'milayraj713@gmail.com' || cleanEmail === 'nilayraj713@gmail.com';
    const destination = isAdmin 
      ? '/admin' 
      : role === 'teacher' 
      ? '/dashboard/teacher' 
      : '/dashboard/student';

    // 1. SIGN UP (CREATE ACCOUNT)
    if (mode === 'signup') {
      if (isAdmin) {
        setLoading(false);
        setErrorMessage('This email is reserved for platform administration. Please switch to Sign In.');
        return;
      }

      if (cleanPassword.length < 6) {
        setLoading(false);
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }

      try {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
            fullName: fullName.trim() || (role === 'teacher' ? 'Educator' : 'Student'),
            role: role,
          }),
        });

        const regData = await regRes.json();

        if (!regRes.ok) {
          setLoading(false);
          setErrorMessage(regData.error || 'Failed to create account.');
          return;
        }

        // Immediately authenticate with newly created credentials
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (signInErr) {
          setLoading(false);
          setErrorMessage('Account created! Please sign in with your email and password.');
          setMode('signin');
          return;
        }

        triggerSuccessTransition(destination, isAdmin, 'Account Created Successfully!');
        return;

      } catch (err: any) {
        setLoading(false);
        setErrorMessage('Registration server error. Please try again.');
        return;
      }
    }

    // 2. SIGN IN (MANUAL LOGIN)
    try {
      // First attempt: standard signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!error && data?.user) {
        triggerSuccessTransition(destination, isAdmin, 'Signed In Successfully');
        return;
      }

      // If signInWithPassword failed, call our resolver to check if user exists (e.g. Google-only account)
      const resolveRes = await fetch('/api/auth/resolve-manual-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const resolveData = await resolveRes.json();

      if (resolveRes.ok && resolveData.linked) {
        // Password was linked to the account! Retry sign-in
        const retry = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!retry.error && retry.data?.user) {
          triggerSuccessTransition(destination, isAdmin, 'Signed In Successfully');
          return;
        }
      }

      setLoading(false);

      if (resolveData.notFound) {
        setErrorMessage('No account found under this email address. Switch to "Create Account" above to register.');
      } else {
        setErrorMessage(resolveData.error || error?.message || 'Incorrect email or password.');
      }

    } catch (err: any) {
      setLoading(false);
      setErrorMessage('Unable to connect to authentication server. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    const targetUrl = role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student';
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${role}&next=${targetUrl}`,
        },
      });
    } catch (err: any) {
      setErrorMessage('Google authentication could not be initiated.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#F9FAF8] dark:bg-[#0A0F1D] text-navy-800 dark:text-slate-100 selection:bg-softblue-200 selection:text-navy-900 overflow-hidden transition-colors duration-200">
      
      {/* 1. Atmospheric Context: Quiet, sunlit academic architectural background */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <Image
          src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2400&q=80"
          alt="Atmospheric study hall"
          fill
          priority
          className="object-cover object-center opacity-[0.14] dark:opacity-[0.05] blur-[3px] scale-105"
        />
        {/* Soft, warm architectural daylight wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6]/92 via-[#F8F9FA]/88 to-[#F1F3F5]/96 dark:from-[#0A0F1D]/95 dark:via-[#0A0F1D]/90 dark:to-[#070C15]/98" />
        
        {/* Minimal architectural precision grid */}
        <div 
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(#183153 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ambient top light beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-white/90 via-softblue-50/20 to-transparent dark:from-emerald-500/10 dark:via-blue-500/5 blur-3xl pointer-events-none" />
      </div>

      {/* Top Bar: Clean minimal header navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Classly</span>
        </Link>

        <Link
          href="/faq"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500 dark:text-slate-400 hover:text-navy-800 dark:hover:text-white transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help & Support</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        
        {/* Concentric Framing Architecture */}
        <ScaleIn className="w-full max-w-[440px]">
          <div 
            className="w-full rounded-[28px] p-2 transition-all duration-300 border border-charcoal-200/50 dark:border-[#1E293B] bg-white/75 dark:bg-[#111827]/80 backdrop-blur-xl"
            style={{
              boxShadow: `
                0 1px 2px rgba(24, 49, 83, 0.03),
                0 4px 8px -2px rgba(24, 49, 83, 0.04),
                0 12px 24px -4px rgba(24, 49, 83, 0.06),
                0 28px 56px -12px rgba(24, 49, 83, 0.08)
              `,
            }}
          >
          <div className="relative rounded-[20px] bg-white dark:bg-[#111827] border border-charcoal-200/70 dark:border-[#1E293B] p-7 sm:p-9 shadow-sm overflow-hidden">
            
            {/* Top ambient edge highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white dark:via-slate-600 to-transparent opacity-80" />

            {/* SUCCESS STATE TRANSITION */}
            {success ? (
              <div className="py-10 flex flex-col items-center justify-center text-center animate-check-pop">
                <div className="relative w-16 h-16 rounded-full bg-accent-50 dark:bg-emerald-950/40 border border-accent-300/80 dark:border-emerald-800/60 flex items-center justify-center mb-5 text-accent-600 dark:text-emerald-400 shadow-[0_0_24px_rgba(69,168,121,0.2)]">
                  <Check className="w-8 h-8 stroke-[2.5]" />
                </div>

                <h2 className="text-xl font-bold text-navy-900 dark:text-white tracking-tight mb-1.5">
                  {successMessage}
                </h2>
                
                <p className="text-xs text-charcoal-500 dark:text-slate-400 max-w-xs mb-6">
                  {role === 'teacher'
                    ? 'Entering your educator studio...'
                    : 'Opening your learning workspace...'}
                </p>

                {/* Progress sweep indicator */}
                <div className="w-48 h-1 bg-charcoal-100 dark:bg-[#162032] rounded-full overflow-hidden">
                  <div className="h-full bg-accent-500 dark:bg-emerald-500 rounded-full animate-progress-sweep" />
                </div>
              </div>
            ) : (
              /* PRIMARY AUTHENTICATION WORKFLOW */
              <div>
                
                {/* Branding Touch */}
                <div className="flex justify-center mb-4">
                  <div className="relative group cursor-pointer">
                    <div className="absolute -inset-1.5 rounded-2xl bg-amber-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
                    
                    <div className="relative w-14 h-14 rounded-[16px] p-2 bg-white dark:bg-[#162032] border border-charcoal-200/80 dark:border-[#2D3B4F] shadow-[0_4px_16px_rgba(24,49,83,0.08)] transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 flex items-center justify-center">
                      <Image
                        src="/images/logo-mark.png"
                        alt="Classly"
                        width={42}
                        height={42}
                        priority
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Mode Switcher: Sign In vs Create Account */}
                <div className="flex items-center justify-center mb-5">
                  <div className="grid grid-cols-2 p-1 bg-charcoal-100 dark:bg-[#162032] rounded-xl border border-charcoal-200/60 dark:border-[#2D3B4F] w-full max-w-[280px]">
                    <button
                      type="button"
                      onClick={() => handleModeChange('signin')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        mode === 'signin'
                          ? 'bg-white dark:bg-[#1E293B] text-navy-900 dark:text-white shadow-sm border border-charcoal-200/50 dark:border-transparent'
                          : 'text-charcoal-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('signup')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        mode === 'signup'
                          ? 'bg-white dark:bg-[#1E293B] text-navy-900 dark:text-white shadow-sm border border-charcoal-200/50 dark:border-transparent'
                          : 'text-charcoal-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="text-center mb-5">
                  <h1 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">
                    {mode === 'signin'
                      ? (role === 'teacher' ? 'Educator Sign In' : 'Student & Parent Sign In')
                      : (role === 'teacher' ? 'Create Educator Account' : 'Create Student Account')}
                  </h1>
                  <p className="mt-1 text-xs text-charcoal-500 dark:text-slate-400">
                    {role === 'teacher'
                      ? 'Access your teaching schedule, whiteboards, and earnings'
                      : 'Access your 1-on-1 tutoring sessions, homework, and live lessons'}
                  </p>
                </div>

                {/* Account Type Selector: Strictly Student / Parent vs Teacher */}
                <div className="mb-5">
                  <div className="grid grid-cols-2 p-1 bg-charcoal-100/80 dark:bg-[#162032] rounded-2xl border border-charcoal-200/60 dark:border-[#2D3B4F]">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('student')}
                      className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                        role === 'student'
                          ? 'bg-white dark:bg-[#1E293B] text-navy-900 dark:text-white shadow-[0_2px_6px_rgba(24,49,83,0.08)] font-bold border border-charcoal-200/40 dark:border-transparent'
                          : 'text-charcoal-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
                      }`}
                    >
                      <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-accent-600 dark:text-emerald-400' : 'text-charcoal-400 dark:text-slate-400'}`} />
                      <span className="text-xs">Student / Parent</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleChange('teacher')}
                      className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                        role === 'teacher'
                          ? 'bg-white dark:bg-[#1E293B] text-navy-900 dark:text-white shadow-[0_2px_6px_rgba(24,49,83,0.08)] font-bold border border-charcoal-200/40 dark:border-transparent'
                          : 'text-charcoal-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
                      }`}
                    >
                      <BookOpen className={`w-4 h-4 ${role === 'teacher' ? 'text-accent-600 dark:text-emerald-400' : 'text-charcoal-400 dark:text-slate-400'}`} />
                      <span className="text-xs">Teacher / Tutor</span>
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50/95 dark:bg-red-950/40 border border-red-200/90 dark:border-red-800/60 text-red-800 dark:text-red-300 rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <span>{errorMessage}</span>
                    </div>
                    {mode === 'signin' && errorMessage.includes('No account found') && (
                      <button
                        type="button"
                        onClick={() => handleModeChange('signup')}
                        className="text-[11px] font-bold text-navy-900 dark:text-white underline hover:text-navy-950 dark:hover:text-emerald-300 block pl-6"
                      >
                        Create an account now with this email →
                      </button>
                    )}
                  </div>
                )}

                {/* Google SSO Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-11 px-4 border border-charcoal-200/90 dark:border-[#2D3B4F] rounded-xl text-xs font-semibold text-charcoal-700 dark:text-slate-200 bg-white dark:bg-[#162032] hover:bg-charcoal-50/70 dark:hover:bg-[#1C283F] hover:border-charcoal-300 dark:hover:border-slate-500 flex items-center justify-center gap-2.5 transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {role === 'teacher' ? 'Continue with Google as Teacher' : 'Continue with Google as Student'}
                  </span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-charcoal-200/60 dark:border-[#1E293B]" />
                  </div>
                  <div className="relative flex justify-center text-[11px]">
                    <span className="bg-white dark:bg-[#111827] px-2.5 text-charcoal-400 dark:text-slate-400 font-medium">
                      or continue with email
                    </span>
                  </div>
                </div>

                {/* Primary Credentials Form */}
                <form onSubmit={handleManualAuth} className="space-y-3.5">
                  
                  {/* Full Name (Sign Up only) */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 dark:text-slate-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-charcoal-400 dark:text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={role === 'teacher' ? 'e.g. Dr. Sarah Jenkins' : 'e.g. Jane Miller'}
                          className="w-full h-11 pl-10 pr-3.5 bg-charcoal-50/60 dark:bg-[#162032] border border-charcoal-200/90 dark:border-[#2D3B4F] rounded-xl text-xs text-navy-900 dark:text-white placeholder:text-charcoal-400 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-[#1C283F] focus:border-navy-700 dark:focus:border-emerald-500 focus:ring-4 focus:ring-navy-800/8 dark:focus:ring-emerald-500/10 transition-all duration-200 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 dark:text-slate-300 mb-1">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-charcoal-400 dark:text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          role === 'teacher'
                            ? 'educator@domain.com'
                            : 'student@example.com or parent@example.com'
                        }
                        className="w-full h-11 pl-10 pr-3.5 bg-charcoal-50/60 dark:bg-[#162032] border border-charcoal-200/90 dark:border-[#2D3B4F] rounded-xl text-xs text-navy-900 dark:text-white placeholder:text-charcoal-400 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-[#1C283F] focus:border-navy-700 dark:focus:border-emerald-500 focus:ring-4 focus:ring-navy-800/8 dark:focus:ring-emerald-500/10 transition-all duration-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                        Password
                      </label>
                      {mode === 'signin' && (
                        <Link 
                          href="/contact?inquiry=password-reset" 
                          className="text-[11px] font-medium text-charcoal-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-emerald-400 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-charcoal-400 dark:text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-10 pr-10 bg-charcoal-50/60 dark:bg-[#162032] border border-charcoal-200/90 dark:border-[#2D3B4F] rounded-xl text-xs text-navy-900 dark:text-white placeholder:text-charcoal-400 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-[#1C283F] focus:border-navy-700 dark:focus:border-emerald-500 focus:ring-4 focus:ring-navy-800/8 dark:focus:ring-emerald-500/10 transition-all duration-200 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-charcoal-400 dark:text-slate-400 hover:text-charcoal-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === 'signup' && (
                      <span className="text-[10px] text-charcoal-400 dark:text-slate-400 mt-1 block">
                        Must be at least 6 characters
                      </span>
                    )}
                  </div>

                  {/* Primary CTA Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 mt-2 bg-navy-800 hover:bg-navy-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-[0_2px_4px_rgba(24,49,83,0.12)] hover:shadow-[0_4px_12px_rgba(24,49,83,0.18)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{mode === 'signup' ? 'Creating account...' : 'Verifying credentials...'}</span>
                      </div>
                    ) : (
                      <>
                        <span>
                          {mode === 'signup' 
                            ? (role === 'teacher' ? 'Create Educator Account' : 'Create Student Account')
                            : (role === 'teacher' ? 'Sign In as Teacher' : 'Sign In as Student / Parent')}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switcher */}
                <div className="mt-5 pt-4 border-t border-charcoal-200/50 dark:border-[#1E293B] text-center text-xs text-charcoal-500 dark:text-slate-400">
                  {mode === 'signin' ? (
                    <div>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeChange('signup')}
                        className="font-bold text-navy-800 dark:text-emerald-400 hover:text-navy-950 dark:hover:text-emerald-300 underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        Create an account →
                      </button>
                    </div>
                  ) : (
                    <div>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeChange('signin')}
                        className="font-bold text-navy-800 dark:text-emerald-400 hover:text-navy-950 dark:hover:text-emerald-300 underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        Sign In →
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
        </ScaleIn>

      </main>

      {/* Clean Bottom Attribution */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between text-[11px] text-charcoal-400 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Classly Inc. Safe, verified learning.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-charcoal-600 dark:hover:text-slate-200 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-charcoal-600 dark:hover:text-slate-200 transition-colors">Terms</Link>
        </div>
      </footer>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9FAF8] dark:bg-[#0A0F1D] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-navy-800/20 dark:border-emerald-400/20 border-t-navy-800 dark:border-t-emerald-400 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
