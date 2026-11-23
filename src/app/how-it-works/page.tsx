'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  CalendarCheck, 
  Video, 
  ShieldCheck, 
  CheckCircle, 
  Users, 
  Lock, 
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/MotionComponents';

export default function HowItWorksPage() {
  return (
    <div className="bg-offwhite dark:bg-[#09090b] min-h-screen py-12 lg:py-16 border-b border-gray-200 dark:border-[#27272a] transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <FadeIn direction="up" delay={0.05} duration={0.5}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-accent-600 dark:text-amber-400 uppercase tracking-wider mb-2 block">
              The Classly Experience
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-800 dark:text-white tracking-tight">
              How Classly Works for Families & Educators
            </h1>
            <p className="mt-3 text-sm text-charcoal-600 dark:text-zinc-300 leading-relaxed">
              A safe, transparent international marketplace connecting US K-12 students with top-tier educators through modern video classrooms.
            </p>
          </div>
        </FadeIn>

        {/* 3 Step Flow for Students & Parents */}
        <FadeIn direction="up" delay={0.15} duration={0.55}>
          <div className="bg-white dark:bg-[#121215] rounded-2xl border border-gray-200 dark:border-[#27272a] shadow-subtle p-8 sm:p-10 mb-12 space-y-10">
            <div className="border-b border-gray-100 dark:border-[#27272a] pb-4">
              <h2 className="text-xl font-bold text-navy-800 dark:text-white">For Students & Parents</h2>
              <p className="text-xs text-charcoal-500 dark:text-zinc-400">From discovery to the first lesson in three clear steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3 p-4 rounded-2xl hover:bg-softblue-50/50 dark:hover:bg-[#18181c] transition-colors duration-200">
                <div className="w-10 h-10 rounded-lg bg-softblue-100 dark:bg-[#18181c] border border-transparent dark:border-[#323238] text-navy-800 dark:text-amber-400 flex items-center justify-center font-bold text-sm shadow-subtle">
                  01
                </div>
                <h3 className="font-bold text-base text-navy-800 dark:text-white">1. Search & Filter Tutors</h3>
                <p className="text-xs text-charcoal-600 dark:text-zinc-300 leading-relaxed">
                  Filter by subject track (e.g. Pre-Algebra, AP Calculus, Python, AP Computer Science A), grade level, price range, and student reviews. Watch video introductions and review teaching methodologies before booking.
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl hover:bg-softblue-50/50 dark:hover:bg-[#18181c] transition-colors duration-200">
                <div className="w-10 h-10 rounded-lg bg-softblue-100 dark:bg-[#18181c] border border-transparent dark:border-[#323238] text-navy-800 dark:text-amber-400 flex items-center justify-center font-bold text-sm shadow-subtle">
                  02
                </div>
                <h3 className="font-bold text-base text-navy-800 dark:text-white">2. Book a Time Slot</h3>
                <p className="text-xs text-charcoal-600 dark:text-zinc-300 leading-relaxed">
                  Choose between private 1-on-1 sessions or small group classes. Select a date and time in your local US timezone (Eastern, Central, Mountain, or Pacific). Pay securely with transparent hourly rates.
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl hover:bg-softblue-50/50 dark:hover:bg-[#18181c] transition-colors duration-200">
                <div className="w-10 h-10 rounded-lg bg-softblue-100 dark:bg-[#18181c] border border-transparent dark:border-[#323238] text-navy-800 dark:text-amber-400 flex items-center justify-center font-bold text-sm shadow-subtle">
                  03
                </div>
                <h3 className="font-bold text-base text-navy-800 dark:text-white">3. Learn Live in Browser</h3>
                <p className="text-xs text-charcoal-600 dark:text-zinc-300 leading-relaxed">
                  Enter your live, private classroom with one click. Use interactive dual whiteboards, share homework worksheets, and receive session notes directly in your student dashboard.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 4 Pillars of Trust & Safety */}
        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <StaggerItem distance={18} duration={0.5}>
            <div className="p-6 bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle hover:shadow-lift dark:hover:border-zinc-700 transition-all duration-300 h-full group hover:-translate-y-1">
              <ShieldCheck className="w-6 h-6 text-accent-500 dark:text-amber-400 mb-3 transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-sm text-navy-800 dark:text-white mb-1">Rigorously Vetted Educators</h3>
              <p className="text-xs text-charcoal-600 dark:text-zinc-300 leading-relaxed">
                We verify university degrees from premier institutions (such as IITs, BITS Pilani, Delhi University), subject mastery, and identity credentials before any educator can publish classes.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem distance={18} duration={0.5}>
            <div className="p-6 bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle hover:shadow-lift dark:hover:border-zinc-700 transition-all duration-300 h-full group hover:-translate-y-1">
              <Lock className="w-6 h-6 text-accent-500 dark:text-amber-400 mb-3 transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-sm text-navy-800 dark:text-white mb-1">Parent Supervised Accounts (COPPA)</h3>
              <p className="text-xs text-charcoal-600 dark:text-zinc-300 leading-relaxed">
                Parents retain full oversight of student accounts, payment authorizations, and classroom bookings. Children cannot independently initiate unmonitored contacts.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem distance={18} duration={0.5}>
            <div className="p-6 bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle hover:shadow-lift dark:hover:border-zinc-700 transition-all duration-300 h-full group hover:-translate-y-1">
              <CheckCircle className="w-6 h-6 text-accent-500 dark:text-amber-400 mb-3 transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-sm text-navy-800 dark:text-white mb-1">100% First Lesson Guarantee</h3>
              <p className="text-xs text-charcoal-600 dark:text-zinc-300 leading-relaxed">
                If your student is not completely satisfied with their first lesson with any tutor, Classly will promptly refund your payment or credit a new session with an alternate teacher.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem distance={18} duration={0.5}>
            <div className="p-6 bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle hover:shadow-lift dark:hover:border-zinc-700 transition-all duration-300 h-full group hover:-translate-y-1">
              <CreditCard className="w-6 h-6 text-accent-500 dark:text-amber-400 mb-3 transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-sm text-navy-800 dark:text-white mb-1">Transparent Pay-As-You-Go</h3>
              <p className="text-xs text-charcoal-600 dark:text-zinc-300 leading-relaxed">
                No locked-in annual subscriptions or surprise fees. You only pay for lessons you schedule, with easy cancellation up to 24 hours prior to class.
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* CTA */}
        <FadeIn direction="up" delay={0.2} duration={0.5}>
          <div className="p-8 bg-navy-800 dark:bg-[#121215] border border-transparent dark:border-[#27272a] text-white rounded-2xl text-center space-y-4 shadow-lift">
            <h3 className="text-2xl font-bold">Ready to find the ideal tutor for your student?</h3>
            <p className="text-xs text-gray-300 dark:text-zinc-300 max-w-md mx-auto">
              Browse verified educators across mathematics, physics, chemistry, biology, coding, and language arts.
            </p>
            <div className="pt-2">
              <Link
                href="/tutors"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-amber-400 dark:text-zinc-950 font-bold text-navy-800 dark:text-white rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-amber-300 transition shadow-subtle active:scale-95"
              >
                <span>Explore Tutors Now</span>
                <ArrowRight className="w-4 h-4 text-navy-800 dark:text-white" />
              </Link>
            </div>
          </div>
        </FadeIn>

      </div>
    </div>
  );
}

