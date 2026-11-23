'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Target, Heart, Globe, Award, ArrowRight } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/MotionComponents';

export default function AboutPage() {
  return (
    <div className="bg-offwhite dark:bg-[#09090b] min-h-screen py-12 lg:py-20 border-b border-gray-200 dark:border-[#27272a] transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero */}
        <FadeIn direction="up" delay={0.05} duration={0.5}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-accent-600 dark:text-amber-400 uppercase tracking-wider mb-2 block">
              Our Mission & Story
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-navy-800 dark:text-white tracking-tight leading-tight">
              Connecting motivated students with world-class educators.
            </h1>
            <p className="mt-4 text-base text-charcoal-600 dark:text-zinc-300 leading-relaxed">
              Classly was created to bridge a vital gap in K-12 education: giving American families access to deeply qualified, passionate subject matter specialists at fair, transparent rates.
            </p>
          </div>
        </FadeIn>

        {/* Founding Philosophy */}
        <FadeIn direction="up" delay={0.15} duration={0.55}>
          <div className="bg-white dark:bg-[#121215] rounded-2xl border border-gray-200 dark:border-[#27272a] shadow-subtle hover:shadow-card transition-shadow duration-300 p-8 sm:p-12 mb-12 space-y-6">
            <h2 className="text-2xl font-bold text-navy-800 dark:text-white">
              Why We Started Classly
            </h2>
            <p className="text-sm text-charcoal-700 dark:text-zinc-300 leading-relaxed">
              Every parent knows that when a student struggles with Algebra II, AP Calculus, or Python programming, standard classroom instruction often moves too fast to address individual learning hurdles. At the same time, finding reliable local tutoring in the US often costs $70 to $120 per hour — placing dedicated academic support out of reach for many hardworking families.
            </p>
            <p className="text-sm text-charcoal-700 dark:text-zinc-300 leading-relaxed">
              Meanwhile, India is home to an extraordinary pool of brilliant educators: university medalists, IIT and BITS engineering graduates, and career senior secondary teachers who master STEM subjects with deep conceptual rigor.
            </p>
            <p className="text-sm text-charcoal-700 dark:text-zinc-300 leading-relaxed font-semibold text-navy-800 dark:text-amber-400">
              Classly brings these two communities together through modern WebRTC browser classrooms — delivering personalized, high-accountability learning where students thrive and educators are fairly rewarded.
            </p>
          </div>
        </FadeIn>

        {/* Core Principles */}
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <StaggerItem distance={18} duration={0.5}>
            <div className="p-6 bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle hover:shadow-lift dark:hover:border-zinc-700 transition-all duration-300 h-full group hover:-translate-y-1">
              <ShieldCheck className="w-6 h-6 text-accent-500 dark:text-amber-400 mb-3 transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-base text-navy-800 dark:text-white mb-2">Uncompromising Vetting</h3>
              <p className="text-xs text-charcoal-600 dark:text-zinc-300 leading-relaxed">
                We never cut corners on verification. Every teacher undergoes academic transcript audits, identity checks, and pedagogical interviews before teaching.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem distance={18} duration={0.5}>
            <div className="p-6 bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle hover:shadow-lift dark:hover:border-zinc-700 transition-all duration-300 h-full group hover:-translate-y-1">
              <Target className="w-6 h-6 text-accent-500 dark:text-amber-400 mb-3 transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-base text-navy-800 dark:text-white mb-2">Curriculum Alignment</h3>
              <p className="text-xs text-charcoal-600 dark:text-zinc-300 leading-relaxed">
                Our educators adapt specifically to the student's US school curriculum, whether it is Common Core, Honors, or College Board AP standards.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem distance={18} duration={0.5}>
            <div className="p-6 bg-white dark:bg-[#121215] rounded-xl border border-gray-200 dark:border-[#27272a] shadow-subtle hover:shadow-lift dark:hover:border-zinc-700 transition-all duration-300 h-full group hover:-translate-y-1">
              <Heart className="w-6 h-6 text-accent-500 dark:text-amber-400 mb-3 transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-base text-navy-800 dark:text-white mb-2">Child Safety First</h3>
              <p className="text-xs text-charcoal-600 dark:text-zinc-300 leading-relaxed">
                Parent-managed accounts, COPPA privacy adherence, and recorded session security ensure peace of mind for every household.
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* CTA */}
        <FadeIn direction="up" delay={0.2} duration={0.5}>
          <div className="p-8 bg-navy-800 dark:bg-[#121215] border border-transparent dark:border-[#27272a] text-white rounded-2xl text-center space-y-4 shadow-lift">
            <h3 className="text-2xl font-bold">Start your learning journey with Classly</h3>
            <p className="text-xs text-gray-300 dark:text-zinc-300 max-w-md mx-auto">
              Explore verified tutor profiles or apply to join our global teaching faculty.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link
                href="/tutors"
                className="px-6 py-2.5 bg-white dark:bg-amber-400 dark:text-zinc-950 font-bold text-navy-800 dark:text-white rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-amber-300 transition shadow-subtle active:scale-95"
              >
                Find a Tutor
              </Link>
              <Link
                href="/become-a-tutor"
                className="px-6 py-2.5 bg-navy-700 dark:bg-[#18181c] text-white border border-navy-600 dark:border-[#323238] rounded-lg text-xs font-semibold hover:bg-navy-600 dark:hover:bg-[#27272a] transition active:scale-95"
              >
                Teach on Classly
              </Link>
            </div>
          </div>
        </FadeIn>

      </div>
    </div>
  );
}

