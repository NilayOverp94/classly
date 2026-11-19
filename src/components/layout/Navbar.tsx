'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../ui/Logo';
import { 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  BookOpen, 
  GraduationCap,
  LayoutDashboard,
  User,
  Settings,
  ChevronDown,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Load initial session
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        deriveRole(session.user);
      } else {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          setUser(currentUser);
          deriveRole(currentUser);
        } else {
          setUser(null);
        }
      }
    };

    loadSession();

    // 2. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        deriveRole(session.user);
      } else {
        setUser(null);
      }
    });

    // 3. Click outside listener to close profile dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  const deriveRole = (u: any) => {
    const email = (u?.email || '').toLowerCase().trim();
    if (email === 'milayraj713@gmail.com' || email === 'nilayraj713@gmail.com') {
      setUserRole('admin');
    } else if (u?.user_metadata?.role === 'teacher') {
      setUserRole('teacher');
    } else {
      setUserRole('student');
    }
  };

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const dashboardHref = 
    userRole === 'admin' 
      ? '/admin' 
      : userRole === 'teacher' 
      ? '/dashboard/teacher' 
      : '/dashboard/student';

  const dashboardLabel =
    userRole === 'admin'
      ? 'Admin Console'
      : userRole === 'teacher'
      ? 'Teacher Studio'
      : 'Dashboard';

  const userDisplayName = 
    user?.user_metadata?.student_name ||
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    user?.email?.split('@')[0] || 
    'Account';

  const userAvatarUrl = 
    user?.user_metadata?.avatar_url || 
    user?.user_metadata?.picture || 
    '';

  // Navigation Links Architecture:
  // - Guest (Before Login): shows marketing, discovery, and educator recruitment links
  // - Authenticated (After Login): clean, dedicated product discovery only (marketing clutter removed)
  const navLinks = user ? [
    { name: 'Find Tutors', href: '/tutors' },
    { name: 'Subjects', href: '/subjects' },
  ] : [
    { name: 'Find Tutors', href: '/tutors' },
    { name: 'Subjects', href: '/subjects' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Become a Tutor', href: '/become-a-tutor' },
  ];

  const isCurrent = (href: string) => {
    if (href === '/tutors' && pathname === '/tutors') return true;
    if (href !== '/tutors' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0B111E]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-800/80 transition-colors duration-200 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo (Links to Dashboard when authenticated, Home when guest) */}
          <div className="flex-shrink-0 flex items-center">
            <Logo size="md" href={user ? dashboardHref : '/'} />
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isCurrent(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'text-navy-900 bg-softblue-100 font-bold dark:bg-slate-800 dark:text-emerald-400'
                      : 'text-charcoal-600 hover:text-navy-900 hover:bg-gray-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions & User Profile Section */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <div className="flex items-center space-x-2.5">
                
                {/* Quick Dashboard Shortcut Button */}
                <Link
                  href={dashboardHref}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-subtle ${
                    userRole === 'admin'
                      ? 'bg-navy-900 text-white hover:bg-navy-950 border border-navy-700'
                      : 'bg-navy-800 text-white hover:bg-navy-900 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                  }`}
                >
                  {userRole === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-accent-400" />
                  ) : userRole === 'teacher' ? (
                    <BookOpen className="w-3.5 h-3.5 text-accent-400" />
                  ) : (
                    <LayoutDashboard className="w-3.5 h-3.5 text-softblue-300" />
                  )}
                  <span>{dashboardLabel}</span>
                </Link>

                {/* Profile Section & Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 pl-2.5 pr-2 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-gray-200/90 dark:border-slate-700 text-xs transition cursor-pointer group"
                    aria-expanded={profileDropdownOpen}
                  >
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-navy-800 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-[11px] uppercase shadow-subtle flex-shrink-0">
                      {userAvatarUrl ? (
                        <Image
                          src={userAvatarUrl}
                          alt={userDisplayName}
                          fill
                          className="object-cover"
                          unoptimized={true}
                        />
                      ) : (
                        <span>{userDisplayName.charAt(0)}</span>
                      )}
                    </div>
                    <span className="font-bold text-navy-900 dark:text-slate-100 max-w-[110px] truncate">
                      {userDisplayName}
                    </span>
                    <span className="text-[10px] font-semibold text-charcoal-500 dark:text-slate-300 uppercase px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
                      {userRole}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-charcoal-400 dark:text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu Card with Fluid Motion */}
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#111C2E] border border-gray-200/90 dark:border-slate-800 shadow-lift-lg py-2 z-50 origin-top-right"
                      >
                        {/* Dropdown Header */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-navy-800 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-subtle flex-shrink-0">
                              {userAvatarUrl ? (
                                <Image
                                  src={userAvatarUrl}
                                  alt={userDisplayName}
                                  fill
                                  className="object-cover"
                                  unoptimized={true}
                                />
                              ) : (
                                <span>{userDisplayName.charAt(0)}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-sm text-navy-900 dark:text-white truncate">
                                {userDisplayName}
                              </div>
                              <div className="text-[11px] text-charcoal-500 dark:text-slate-400 truncate">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent-700 dark:text-emerald-300 bg-accent-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-accent-200 dark:border-emerald-800/60">
                            <ShieldCheck className="w-3 h-3 text-accent-500 dark:text-emerald-400" />
                            <span>{userRole === 'admin' ? 'Super Administrator' : userRole === 'teacher' ? 'Accredited Tutor' : 'Student & Parent'}</span>
                          </div>
                        </div>

                        {/* Dropdown Navigation Links */}
                        <div className="py-1 text-xs">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-charcoal-700 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60 font-medium transition"
                          >
                            <User className="w-4 h-4 text-accent-600 dark:text-emerald-400" />
                            <span>Edit Profile & Account</span>
                          </Link>

                          <Link
                            href={dashboardHref}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-charcoal-700 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60 font-medium transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-navy-800 dark:text-softblue-300" />
                            <span>{dashboardLabel}</span>
                          </Link>

                          {userRole === 'student' && (
                            <Link
                              href="/tutors"
                              className="flex items-center gap-2.5 px-4 py-2.5 text-charcoal-700 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60 font-medium transition"
                            >
                              <GraduationCap className="w-4 h-4 text-charcoal-500 dark:text-slate-400" />
                              <span>Browse Verified Tutors</span>
                            </Link>
                          )}
                        </div>

                        {/* Sign Out Divider & Action */}
                        <div className="pt-1 border-t border-gray-100 dark:border-slate-800">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
                            <span>Sign Out</span>
                          </button>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            ) : (
              /* Guest Actions: Log In & Sign Up */
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold text-charcoal-700 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-charcoal-500 dark:text-slate-400" />
                  <span>Log In</span>
                </Link>

                <Link
                  href="/register/student"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-navy-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg hover:bg-navy-900 transition shadow-subtle"
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-600 dark:text-slate-300 hover:text-navy-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu with Smooth Height & Fade Animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0B111E] px-4 pt-3 pb-6 space-y-2.5 shadow-lift"
          >
            {/* User Profile Header for Mobile */}
            {user && (
              <div className="p-3 mb-2 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-navy-800 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-subtle">
                    {userDisplayName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-navy-900 dark:text-white">{userDisplayName}</div>
                    <div className="text-[11px] text-charcoal-500 dark:text-slate-400 truncate max-w-[160px]">{user.email}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-softblue-100 dark:bg-slate-700 text-navy-800 dark:text-emerald-400 border border-softblue-200 dark:border-slate-600">
                  {userRole}
                </span>
              </div>
            )}

            {/* Navigation links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-charcoal-700 dark:text-slate-200 hover:text-navy-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile Appearance Toggle Row */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">Theme</span>
              <ThemeToggle showLabel />
            </div>

            {/* User Specific Mobile Options */}
            {user ? (
              <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-navy-800 dark:text-slate-200 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition active:scale-98"
                >
                  <User className="w-4 h-4 text-accent-600 dark:text-emerald-400" />
                  <span>Edit Profile & Settings</span>
                </Link>

                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-navy-800 dark:bg-emerald-600 rounded-lg hover:bg-navy-900 dark:hover:bg-emerald-500 shadow-subtle transition active:scale-98"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to {dashboardLabel}</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition active:scale-98"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-2.5 text-xs font-bold text-navy-800 dark:text-slate-200 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/60 transition active:scale-98"
                >
                  Log In
                </Link>
                <Link
                  href="/register/student"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-2.5 text-xs font-bold text-white bg-navy-800 rounded-lg hover:bg-navy-900 shadow-subtle transition active:scale-98"
                >
                  Sign Up as Student / Parent
                </Link>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
