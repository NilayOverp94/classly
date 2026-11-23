'use client';

import React from 'react';
import Link from 'next/link';
import { Search, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import { FadeIn } from '@/components/ui/MotionComponents';

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-navy-950 dark:bg-[#09090b] border-t border-transparent dark:border-[#27272a] text-white relative overflow-hidden transition-colors duration-200">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-navy-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <FadeIn direction="up" delay={0.05} duration={0.45}>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-navy-900 border border-navy-800 text-xs font-bold text-accent-400 uppercase tracking-wider mb-6 shadow-subtle">
            <ShieldCheck className="w-4 h-4 text-accent-400" />
            <span>Risk-Free 100% First Lesson Guarantee</span>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.12} duration={0.55}>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
            Your child's next great learning breakthrough starts here.
          </h2>
        </FadeIn>
        
        <FadeIn direction="up" delay={0.2} duration={0.5}>
          <p className="mt-5 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Experience personalized, high-impact instruction in <strong className="text-white">Mathematics</strong> and <strong className="text-white">Computer Science</strong> tailored to your student's school curriculum and goals.
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.28} duration={0.5}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tutors"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent-400 hover:bg-accent-500 text-navy-950 font-bold rounded-2xl shadow-lift hover:shadow-lift-lg transition-all text-sm group active:scale-98"
            >
              <Search className="w-4 h-4 text-navy-950" />
              <span>Find a Tutor</span>
              <ArrowRight className="w-4 h-4 text-navy-950 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/become-a-tutor"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-2xl border border-navy-700 transition-all text-sm active:scale-98"
            >
              <GraduationCap className="w-4 h-4 text-accent-400" />
              <span>Apply to Teach</span>
            </Link>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.35} duration={0.45}>
          <div className="mt-8 text-xs text-gray-400 flex flex-wrap items-center justify-center gap-4">
            <span>• Zero subscription commitments</span>
            <span>• Pay as you go</span>
            <span>• 100% money-back guarantee</span>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
