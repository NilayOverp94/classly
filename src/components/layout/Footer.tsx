import React from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';
import { Shield, Lock, Award, Globe, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy-900 dark:bg-[#070C15] text-gray-300 border-t border-navy-800 dark:border-slate-800/80 transition-colors duration-200">
      {/* Trust & Safety Highlights Strip */}
      <div className="border-b border-navy-800/80 bg-navy-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-accent-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-white block">100% Verified Educators</span>
                <span className="text-xs text-gray-400">Degrees, identity & teaching credentials checked</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-accent-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-white block">COPPA-Compliant Platform</span>
                <span className="text-xs text-gray-400">Parent-controlled accounts & safe classrooms</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-accent-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-white block">Money-Back Guarantee</span>
                <span className="text-xs text-gray-400">Full refund if unsatisfied with your first lesson</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-accent-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-white block">Global Quality, Fair Pricing</span>
                <span className="text-xs text-gray-400">US K-12 curriculum taught by top educators</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Tagline */}
          <div className="col-span-2">
            <Logo variant="light" size="lg" />
            <p className="mt-4 text-sm text-gray-400 max-w-sm leading-relaxed">
              Classly connects motivated K-12 students across the United States with exceptionally qualified, thoroughly vetted teachers for personalized 1-on-1 tutoring and interactive online masterclasses.
            </p>
            <div className="mt-6 flex flex-col space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent-400" />
                <span>support@classly.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent-400" />
                <span>United States • India • Worldwide Expansion</span>
              </div>
            </div>
          </div>

          {/* Col 2: For Students & Parents */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              For Families
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/tutors" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  Find a Tutor
                </Link>
              </li>
              <li>
                <Link href="/subjects" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  All Subjects & Curriculum
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/tutors?subject=Mathematics" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  Mathematics & AP Calculus
                </Link>
              </li>
              <li>
                <Link href="/tutors?subject=Computer+Science" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  Computer Science & Python
                </Link>
              </li>
              <li>
                <Link href="/register/student" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  Parent Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Tutors */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              For Teachers
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/become-a-tutor" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  Become a Tutor
                </Link>
              </li>
              <li>
                <Link href="/become-a-tutor#earnings" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  Earnings Calculator
                </Link>
              </li>
              <li>
                <Link href="/become-a-tutor#requirements" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  Verification Standards
                </Link>
              </li>
              <li>
                <Link href="/dashboard/teacher" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  Teacher Portal
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  Tutor FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Trust */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Trust & Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200">
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy (COPPA)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-navy-800 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Classly Inc. All rights reserved. "Learn Together. Grow Anywhere." is a registered trademark of Classly.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-gray-400">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-400">Terms</Link>
            <Link href="/contact" className="hover:text-gray-400">Security & Trust</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

