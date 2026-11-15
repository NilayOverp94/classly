'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 transition-all select-none">
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
                      ? 'text-navy-900 bg-softblue-100 font-bold'
                      : 'text-charcoal-600 hover:text-navy-900 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions & User Profile Section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                
                {/* Quick Dashboard Shortcut Button */}
                <Link
                  href={dashboardHref}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-subtle ${
                    userRole === 'admin'
                      ? 'bg-navy-900 text-white hover:bg-navy-950 border border-navy-700'
                      : 'bg-navy-800 text-white hover:bg-navy-900'
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
                    className="flex items-center gap-2 pl-2.5 pr-2 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/90 text-xs transition cursor-pointer group"
                    aria-expanded={profileDropdownOpen}
                  >
                    <div className="w-6 h-6 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-[11px] uppercase shadow-subtle">
                      {userDisplayName.charAt(0)}
                    </div>
                    <span className="font-bold text-navy-900 max-w-[110px] truncate">
                      {userDisplayName}
                    </span>
                    <span className="text-[10px] font-semibold text-charcoal-500 uppercase px-1.5 py-0.5 rounded bg-white border border-gray-200">
                      {userRole}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-charcoal-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu Card */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-gray-200/90 shadow-lift py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      
                      {/* Dropdown Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="font-bold text-sm text-navy-900 truncate">
                          {userDisplayName}
                        </div>
                        <div className="text-[11px] text-charcoal-500 truncate mt-0.5">
                          {user.email}
                        </div>
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                          <ShieldCheck className="w-3 h-3 text-accent-500" />
                          <span>{userRole === 'admin' ? 'Super Administrator' : userRole === 'teacher' ? 'Accredited Tutor' : 'Student & Parent'}</span>
                        </div>
                      </div>

                      {/* Dropdown Navigation Links */}
                      <div className="py-1 text-xs">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-charcoal-700 hover:text-navy-900 hover:bg-gray-50 font-medium transition"
                        >
                          <User className="w-4 h-4 text-accent-600" />
                          <span>Edit Profile & Account</span>
                        </Link>

                        <Link
                          href={dashboardHref}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-charcoal-700 hover:text-navy-900 hover:bg-gray-50 font-medium transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-navy-800" />
                          <span>{dashboardLabel}</span>
                        </Link>

                        {userRole === 'student' && (
                          <Link
                            href="/tutors"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-charcoal-700 hover:text-navy-900 hover:bg-gray-50 font-medium transition"
                          >
                            <GraduationCap className="w-4 h-4 text-charcoal-500" />
                            <span>Browse Verified Tutors</span>
                          </Link>
                        )}
                      </div>

                      {/* Sign Out Divider & Action */}
                      <div className="pt-1 border-t border-gray-100">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* Guest Actions: Log In & Sign Up */
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold text-charcoal-700 hover:text-navy-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-charcoal-500" />
                  <span>Log In</span>
                </Link>

                <Link
                  href="/register/student"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-navy-800 rounded-lg hover:bg-navy-900 transition shadow-subtle"
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-600 hover:text-navy-800 hover:bg-gray-100 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lift animate-in fade-in">
          
          {/* User Profile Header for Mobile */}
          {user && (
            <div className="p-3 mb-2 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-subtle">
                  {userDisplayName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-navy-900">{userDisplayName}</div>
                  <div className="text-[11px] text-charcoal-500 truncate max-w-[160px]">{user.email}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-softblue-100 text-navy-800 border border-softblue-200">
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
                className="block px-3 py-2 rounded-lg text-sm font-medium text-charcoal-700 hover:text-navy-800 hover:bg-gray-50"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Specific Mobile Options */}
          {user ? (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-navy-800 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
              >
                <User className="w-4 h-4 text-accent-600" />
                <span>Edit Profile & Settings</span>
              </Link>

              <Link
                href={dashboardHref}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-navy-800 rounded-lg hover:bg-navy-900 shadow-subtle"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to {dashboardLabel}</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-2.5 text-xs font-bold text-navy-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Log In
              </Link>
              <Link
                href="/register/student"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-2.5 text-xs font-bold text-white bg-navy-800 rounded-lg hover:bg-navy-900 shadow-subtle"
              >
                Sign Up as Student / Parent
              </Link>
            </div>
          )}

        </div>
      )}
    </header>
  );
}
