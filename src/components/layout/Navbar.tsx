'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../ui/Logo';
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  Search,
  LogIn
} from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Find Tutors', href: '/tutors' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Subjects', href: '/tutors?focus=subjects' },
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
          
          {/* Left: Brand Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" />
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
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

          {/* Right: Actions & Dashboards */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-navy-800 bg-navy-50 rounded-md border border-navy-100 hover:bg-navy-100 transition-colors"
              >
                <span>Demo Portals</span>
                <ChevronDown className="w-3.5 h-3.5 text-navy-600" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lift border border-gray-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Instant Access
                  </div>
                  <Link
                    href="/dashboard/student"
                    className="flex items-center gap-2.5 px-3 py-2 text-charcoal-700 hover:bg-softblue-50 hover:text-navy-800"
                  >
                    <BookOpen className="w-4 h-4 text-navy-700" />
                    <span>Student / Parent Dashboard</span>
                  </Link>
                  <Link
                    href="/dashboard/teacher"
                    className="flex items-center gap-2.5 px-3 py-2 text-charcoal-700 hover:bg-softblue-50 hover:text-navy-800"
                  >
                    <GraduationCap className="w-4 h-4 text-accent-500" />
                    <span>Teacher Dashboard</span>
                  </Link>
                  <Link
                    href="/admin"
                    className="flex items-center gap-2.5 px-3 py-2 text-charcoal-700 hover:bg-softblue-50 hover:text-navy-800"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Administrator Console</span>
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link
                    href="/classroom/demo-session-preview"
                    className="flex items-center gap-2.5 px-3 py-2 text-charcoal-700 hover:bg-softblue-50 hover:text-navy-800"
                  >
                    <Search className="w-4 h-4 text-blue-600" />
                    <span>Live Classroom Demo</span>
                  </Link>
                </div>
              )}
            </div>

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
          <div className="border-t border-gray-100 pt-3 mt-2 space-y-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              Portals
            </div>
            <Link
              href="/dashboard/student"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-charcoal-700 hover:bg-gray-50"
            >
              <BookOpen className="w-4 h-4 text-navy-800" />
              <span>Student / Parent Dashboard</span>
            </Link>
            <Link
              href="/dashboard/teacher"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-charcoal-700 hover:bg-gray-50"
            >
              <GraduationCap className="w-4 h-4 text-accent-500" />
              <span>Teacher Dashboard</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-charcoal-700 hover:bg-gray-50"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Administrator Portal</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
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
          </div>
        </div>
      )}
    </header>
  );
}

