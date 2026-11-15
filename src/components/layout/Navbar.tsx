'use client';

import React, { useState, useEffect } from 'react';
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
  LayoutDashboard 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Get initial session
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    await supabase.auth.signOut();
    setUser(null);
    setMobileMenuOpen(false);
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
      : 'My Dashboard';

  const userDisplayName = 
    user?.user_metadata?.student_name ||
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    user?.email?.split('@')[0] || 
    'Account';

  // Distinct navigation links based on authentication state:
  // Before Login (Guest): shows marketing & onboarding links (How It Works, Become a Tutor)
  // After Login (Authenticated): clean, functional product navigation only
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo (Links to Dashboard when logged in, Home when logged out) */}
          <div className="flex-shrink-0">
            <Logo size="md" href={user ? dashboardHref : '/'} />
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navLinks.map((link) => {
              const active = isCurrent(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'text-navy-800 bg-softblue-100 font-semibold'
                      : 'text-charcoal-600 hover:text-navy-800 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions (State-aware: Authenticated vs Unauthenticated) */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Dashboard Action Button */}
                <Link
                  href={dashboardHref}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-subtle ${
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

                {/* User Pill & Sign Out */}
                <div className="flex items-center pl-2 border-l border-gray-200 gap-2">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/80 text-xs">
                    <div className="w-6 h-6 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-[11px] uppercase">
                      {userDisplayName.charAt(0)}
                    </div>
                    <span className="font-semibold text-charcoal-700 max-w-[120px] truncate">
                      {userDisplayName}
                    </span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="p-2 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-charcoal-700 hover:text-navy-800 px-3 py-2 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>

                <Link
                  href="/register/student"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-navy-800 rounded-md hover:bg-navy-900 transition-colors shadow-subtle"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-charcoal-600 hover:text-navy-800 hover:bg-gray-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-lift">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-md text-base font-medium text-charcoal-700 hover:text-navy-800 hover:bg-gray-50"
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-xs uppercase">
                      {userDisplayName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy-900">{userDisplayName}</div>
                      <div className="text-[11px] text-charcoal-500">{user.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-softblue-100 text-navy-800">
                    {userRole}
                  </span>
                </div>

                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-navy-800 rounded-md hover:bg-navy-900"
                >
                  Go to {dashboardLabel}
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full text-center py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-medium text-navy-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Log In
                </Link>
                <Link
                  href="/register/student"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-navy-800 rounded-md hover:bg-navy-900"
                >
                  Sign Up as Student / Parent
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
