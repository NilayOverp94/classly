'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Code2, 
  ArrowRight,
  BookOpen,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/MotionComponents';

export function PopularSubjects() {
  const tracks = [
    {
      id: 'subj-math',
      name: 'Mathematics',
      headline: 'From Pre-Algebra to AP Calculus AB & BC',
      description: 'Master step-by-step mathematical reasoning, homework problem solving, and score higher on school exams and standardized AP tests.',
      icon: <Calculator className="w-6 h-6 text-navy-900 dark:text-white" />,
      grades: 'Grades 5 – 12',
      topics: ['Algebra I & II', 'Geometry', 'Trigonometry', 'Pre-Calculus', 'AP Calculus AB/BC', 'AP Statistics'],
      accentColor: 'from-amber-50 to-orange-50/30 dark:from-[#111827] dark:to-[#162032]',
      badgeBg: 'bg-amber-100/80 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
    },
    {
      id: 'subj-cs',
      name: 'Computer Science',
      headline: 'Python, AP Computer Science A & Algorithms',
      description: 'Hands-on programming from scratch to syntax. Build games, master data structures, debug live code, and prepare for AP CS exams.',
      icon: <Code2 className="w-6 h-6 text-navy-900 dark:text-white" />,
      grades: 'Grades 6 – 12',
      topics: ['Python Basics & OOP', 'AP Computer Science A', 'Java Programming', 'Algorithms & Logic', 'Web Development'],
      accentColor: 'from-softblue-50 to-blue-50/30 dark:from-[#111827] dark:to-[#162032]',
      badgeBg: 'bg-softblue-100 text-navy-900 border-softblue-200 dark:bg-[#1E293B] dark:text-emerald-300 dark:border-slate-700',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-[#0A0F1D] border-b border-gray-200/70 dark:border-[#1E293B] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <FadeIn direction="up" delay={0.05} duration={0.5}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Specialized K-12 Curriculum</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-navy-950 dark:text-white tracking-tight">
                Core Academic Tracks
              </h2>
              <p className="mt-2 text-charcoal-600 dark:text-slate-300 text-sm sm:text-base max-w-xl">
                We focus deeply on two high-impact subjects with personalized one-to-one tutoring and small group classes.
              </p>
            </div>
            <Link
              href="/subjects"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-navy-800 dark:text-emerald-400 hover:text-accent-600 dark:hover:text-emerald-300 group transition-colors"
            >
              <span>View detailed curriculum syllabi</span>
              <ArrowRight className="w-4 h-4 text-accent-500 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </FadeIn>

        {/* Subjects Grid (Focused 2 Core Tracks) */}
        <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tracks.map((track) => (
            <StaggerItem key={track.id} distance={20} duration={0.55}>
              <div
                className={`p-7 sm:p-8 rounded-3xl border border-gray-200/90 dark:border-[#1E293B] bg-gradient-to-b ${track.accentColor} shadow-card dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:shadow-lift hover:border-navy-300 dark:hover:border-slate-600 transition-all duration-300 flex flex-col justify-between h-full group hover:-translate-y-1`}
              >
                <div>
                  
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200/80 dark:border-[#2D3B4F] shadow-subtle flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      {track.icon}
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${track.badgeBg}`}>
                      {track.grades}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-navy-950 dark:text-white tracking-tight mb-1">
                    {track.name}
                  </h3>
                  <div className="text-xs font-semibold text-accent-700 dark:text-emerald-400 mb-3">
                    {track.headline}
                  </div>
                  
                  <p className="text-sm text-charcoal-600 dark:text-slate-300 leading-relaxed mb-6">
                    {track.description}
                  </p>

                  {/* Topic tags */}
                  <div className="mb-6">
                    <div className="text-xs font-bold text-charcoal-400 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                      Topics & Courses Covered:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {track.topics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-[#1E293B] border border-gray-200/70 dark:border-[#2D3B4F] text-navy-900 dark:text-slate-200 font-semibold text-xs shadow-subtle transition-colors hover:bg-white dark:hover:bg-[#253347]"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Action Footer */}
                <div className="pt-6 border-t border-gray-200/60 dark:border-[#1E293B] flex items-center justify-between">
                  <span className="text-xs font-semibold text-charcoal-500 dark:text-slate-400">
                    1-on-1 & Small Group Sessions
                  </span>
                  <Link
                    href={`/tutors?subject=${encodeURIComponent(track.name)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95 group/btn"
                  >
                    <span>Explore Tutors</span>
                    <ArrowRight className="w-3.5 h-3.5 text-accent-400 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  );
}
