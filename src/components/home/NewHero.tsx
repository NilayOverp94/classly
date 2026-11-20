'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Calculator, 
  Terminal, 
  CheckCircle,
  Play,
  Cpu,
  GraduationCap
} from 'lucide-react';
import { Hero3DCanvas } from './Hero3DCanvas';
import { motion } from 'framer-motion';

export function NewHero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'math' | 'cs'>('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tutors?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/tutors');
    }
  };

  const quickPills = [
    { label: 'AP Calculus AB/BC', query: 'AP Calculus', subject: 'math', icon: Calculator },
    { label: 'Python & OOP', query: 'Python', subject: 'cs', icon: Code2 },
    { label: 'AP Computer Science A', query: 'Computer Science', subject: 'cs', icon: Terminal },
    { label: 'Algebra I & II', query: 'Algebra', subject: 'math', icon: Calculator },
    { label: 'Geometry & Proofs', query: 'Geometry', subject: 'math', icon: Calculator },
  ];

  return (
    <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden bg-[#FAFAF8] dark:bg-[#070B14] border-b border-gray-200/80 dark:border-[#1E293B] transition-colors duration-200">
      
      {/* Background Architectural Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ambient Radial Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[420px] h-[420px] bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Kicker Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-[#1E293B] shadow-sm text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-gray-500 dark:text-slate-400">CLASSLY_ACCELERATOR</span>
            <span className="text-gray-300 dark:text-slate-600">/</span>
            <span className="font-semibold text-navy-950 dark:text-emerald-400">MATH & COMPUTER SCIENCE</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-gray-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% DEGREE AUDITED</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-accent-500" />
              <span>LIVE CODE & WHITEBOARD</span>
            </span>
          </div>
        </div>

        {/* Two-Column Grid: Left Editorial Copy, Right Interactive 3D Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column (Editorial, Dynamic Search, Concrete Value) */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black text-navy-950 dark:text-white tracking-tight leading-[1.05]">
                Master the Code.<br />
                Command the Math.<br />
                <span className="font-serif italic font-normal text-accent-600 dark:text-emerald-400 tracking-normal text-3xl sm:text-4xl lg:text-[48px] block mt-1">
                  1-on-1 with elite educators.
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-base sm:text-lg text-charcoal-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal"
            >
              Skip generic video libraries and AI bots. Work directly with verified university instructors who teach deep problem-solving, algorithmic thinking, and curriculum mastery tailored to your school syllabus.
            </motion.p>

            {/* Interactive Search Terminal */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8"
            >
              <form 
                onSubmit={handleSearchSubmit}
                className="relative flex items-center p-2 rounded-2xl bg-white dark:bg-[#111827] border-2 border-gray-200/90 dark:border-[#1E293B] shadow-card hover:border-navy-400 dark:hover:border-emerald-500/60 transition-all duration-200 group max-w-xl"
              >
                <div className="pl-3 pr-2 text-charcoal-400 dark:text-slate-400">
                  <Search className="w-5 h-5 group-hover:text-accent-500 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search AP Calculus, Python OOP, Linear Algebra, Java..."
                  className="w-full py-2 bg-transparent text-navy-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm sm:text-base font-medium focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-navy-950 font-bold text-xs sm:text-sm tracking-wide shadow-md transition active:scale-95"
                >
                  <span>Find Tutor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Filter Subject Pills */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-semibold text-gray-400 dark:text-slate-500 mr-1">QUICK JUMP:</span>
                {quickPills.map((pill) => {
                  const Icon = pill.icon;
                  return (
                    <button
                      key={pill.label}
                      type="button"
                      onClick={() => router.push(`/tutors?subject=${encodeURIComponent(pill.subject === 'math' ? 'Mathematics' : 'Computer Science')}&q=${encodeURIComponent(pill.query)}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-[#162032] hover:bg-navy-50 dark:hover:bg-[#1E293B] text-charcoal-700 dark:text-slate-200 border border-gray-200/80 dark:border-[#24334C] transition shadow-2xs hover:border-gray-300 dark:hover:border-slate-500 active:scale-95"
                    >
                      <Icon className="w-3.5 h-3.5 text-accent-500 dark:text-emerald-400" />
                      <span>{pill.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Transparent Platform Trust Row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 pt-6 border-t border-gray-200/80 dark:border-[#1E293B] grid grid-cols-3 gap-4 max-w-xl text-xs font-mono"
            >
              <div>
                <span className="block text-xl sm:text-2xl font-black text-navy-950 dark:text-white font-sans">
                  Top 3%
                </span>
                <span className="text-gray-500 dark:text-slate-400 text-[11px] leading-tight block mt-0.5">
                  Tutor Acceptance Rate
                </span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-accent-600 dark:text-emerald-400 font-sans">
                  0 Subscriptions
                </span>
                <span className="text-gray-500 dark:text-slate-400 text-[11px] leading-tight block mt-0.5">
                  Pay Per Single Lesson
                </span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-navy-950 dark:text-white font-sans">
                  1-on-1 Live
                </span>
                <span className="text-gray-500 dark:text-slate-400 text-[11px] leading-tight block mt-0.5">
                  Code & Math Whiteboard
                </span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Interactive 3D Canvas + Floating Physical HUD Cards */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Main Three.js Interactive Canvas Container */}
              <Hero3DCanvas />

              {/* Floating Physical Overlay Card 1: Live Interactive Classroom Telemetry */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="absolute -bottom-6 -left-4 sm:-left-6 p-4 rounded-2xl bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-gray-200/90 dark:border-[#1E293B] shadow-2xl z-20 max-w-[280px] hidden sm:block"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                      Live Classroom
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    Connected
                  </span>
                </div>
                {/* Code syntax snippet */}
                <div className="p-2.5 rounded-lg bg-gray-900 text-gray-200 font-mono text-[11px] leading-relaxed overflow-hidden">
                  <div className="text-purple-400">def <span className="text-yellow-300">binary_search</span>(arr, x):</div>
                  <div className="pl-3 text-blue-300">mid = (low + high) // 2</div>
                  <div className="pl-3 text-emerald-400"># Lesson whiteboard synced</div>
                </div>
              </motion.div>

              {/* Floating Physical Overlay Card 2: Verified Educator Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="absolute -top-5 -right-3 sm:-right-5 p-3.5 rounded-2xl bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-gray-200/90 dark:border-[#1E293B] shadow-2xl z-20 hidden sm:flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-navy-950 dark:text-white">Audited Educator</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">M.S. Computer Science • Stanford</span>
                </div>
              </motion.div>

            </motion.div>

          </div>

        </div>

      </div>

    </section>
  );
}
