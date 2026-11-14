'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../ui/Logo';
import { Menu, X, LogIn } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
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
          
          {/* Left: Brand Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" />
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

          {/* Right: Actions */}
          <div className="hidden md:flex items-center space-x-3">
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
