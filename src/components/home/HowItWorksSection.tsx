'use client';

import React from 'react';
import Link from 'next/link';
import { Search, CalendarCheck, Video, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/MotionComponents';

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Choose your educator',
      description: 'Filter vetted teachers by subject track (Mathematics or Computer Science), grade level, and hourly rate. Watch video intros and review academic credentials.',
      icon: <Search className="w-6 h-6 text-navy-900 dark:text-white" />,
      badge: 'Step 1 • Discovery',
    },
    {
      number: '02',
      title: 'Schedule a time slot',
      description: 'Book personalized 1-on-1 sessions or small group classes. All times automatically sync to your local US timezone (Eastern, Central, Mountain, Pacific).',
      icon: <CalendarCheck className="w-6 h-6 text-accent-500 dark:text-amber-400" />,
      badge: 'Step 2 • Scheduling',
    },
    {
      number: '03',
      title: 'Learn live in browser',
      description: 'Join our interactive classroom with one click. Work together on dual-user whiteboards, share code files, and receive lesson notes right in your dashboard.',
      icon: <Video className="w-6 h-6 text-navy-900 dark:text-white" />,
      badge: 'Step 3 • Live Lesson',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#FAFAF8] dark:bg-[#09090b] border-b border-gray-200/70 dark:border-[#27272a] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <FadeIn direction="up" delay={0.05} duration={0.5}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 dark:bg-amber-950/30 border border-accent-200 dark:border-amber-800/40 text-xs font-bold text-accent-700 dark:text-amber-400 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-accent-500" />
              <span>Simple, Transparent Learning</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-950 dark:text-white tracking-tight">
              How Classly Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-charcoal-600 dark:text-zinc-300 leading-relaxed">
              From discovering the perfect tutor to conducting live interactive lessons in three straightforward steps.
            </p>
          </div>
        </FadeIn>

        {/* Steps Grid */}
        <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
          {steps.map((step) => (
            <StaggerItem key={step.number} distance={20} duration={0.55}>
              <div
                className="relative flex flex-col justify-between p-7 sm:p-8 rounded-3xl border border-gray-200/90 dark:border-[#27272a] bg-white dark:bg-[#121215] shadow-card dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:shadow-lift hover:border-navy-300 dark:hover:border-zinc-700 transition-all duration-300 h-full group hover:-translate-y-1"
              >
                <div>
                  {/* Step indicator top row */}
                  <div className="flex items-center justify-between w-full mb-6">
                    <div className="w-13 h-13 p-3 rounded-2xl bg-softblue-50 dark:bg-[#27272a] border border-softblue-100 dark:border-[#323238] flex items-center justify-center shadow-subtle transition-transform duration-300 group-hover:scale-105">
                      {step.icon}
                    </div>
                    <span className="text-3xl font-black text-gray-200 dark:text-zinc-700 tracking-tighter group-hover:text-accent-300 dark:group-hover:text-amber-400 transition-colors duration-300">
                      {step.number}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-accent-600 dark:text-amber-400 uppercase tracking-wider mb-1.5">
                    {step.badge}
                  </div>

                  <h3 className="text-xl font-black text-navy-950 dark:text-white mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-charcoal-600 dark:text-zinc-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#27272a] text-xs font-bold text-navy-800 dark:text-zinc-200 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-accent-500" />
                  <span>Protected by First Lesson Guarantee</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Action Link */}
        <FadeIn direction="up" delay={0.2} duration={0.5}>
          <div className="mt-14 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-bold text-navy-800 dark:text-amber-400 hover:text-accent-600 dark:hover:text-amber-300 transition-colors group"
            >
              <span>Learn more about our classroom tools, safety protocols & parent guarantees</span>
              <ArrowRight className="w-4 h-4 text-accent-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
