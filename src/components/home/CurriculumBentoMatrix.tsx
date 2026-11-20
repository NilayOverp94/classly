'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Code2, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Terminal,
  Cpu,
  GraduationCap,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

export function CurriculumBentoMatrix() {
  const [activeMathTopic, setActiveMathTopic] = useState('calculus');
  const [activeCsTopic, setActiveCsTopic] = useState('python');

  const mathDetails: Record<string, { title: string; syllabus: string[]; testTarget: string }> = {
    calculus: {
      title: 'AP Calculus AB & BC',
      syllabus: ['Limits & Continuity', 'Derivatives & Chain Rule', 'Integrals & Fundamental Theorem', 'Series & Polar Coordinates'],
      testTarget: 'Target: 5 on AP Exam & High School GPA Booster',
    },
    algebra: {
      title: 'Algebra I, II & Trigonometry',
      syllabus: ['Quadratic Equations & Complex Numbers', 'Polynomial Functions', 'Logarithmic & Exponential Models', 'Trig Identities & Graphs'],
      testTarget: 'Target: Solid Foundation for High School & SAT/ACT Math',
    },
    geometry: {
      title: 'High School & Honors Geometry',
      syllabus: ['Euclidean Formal Proofs', 'Congruence & Similarity', 'Circle Theorems & Tangents', '3D Coordinate Solid Geometry'],
      testTarget: 'Target: Critical Deductive Logic & School Honors Placement',
    },
  };

  const csDetails: Record<string, { title: string; syllabus: string[]; stack: string }> = {
    python: {
      title: 'Python Programming & Algorithms',
      syllabus: ['Variables, Loops & Recursion', 'Object-Oriented Programming (OOP)', 'List Comprehensions & Dictionaries', 'Algorithmic Problem Solving'],
      stack: 'Python 3.12 • Pygame • LeetCode Junior',
    },
    apcs: {
      title: 'AP Computer Science A (Java)',
      syllabus: ['Java Syntax & Class Architecture', 'Arrays, 2D Arrays & ArrayLists', 'Inheritance & Polymorphism', 'Searching & Sorting Algorithms'],
      stack: 'Java SE 17 • AP CollegeBoard Syllabus',
    },
  };

  return (
    <section className="py-20 lg:py-28 bg-[#FAFAF8] dark:bg-[#070B14] border-b border-gray-200/80 dark:border-[#1E293B] relative overflow-hidden transition-colors duration-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SPECIALIZED K-12 SYLLABI</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy-950 dark:text-white tracking-tight leading-tight">
              Two Disciplines. Zero Distractions.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-charcoal-600 dark:text-slate-300 max-w-xl">
              We don&apos;t offer 50 random subjects with generic tutors. We specialize deeply in high-impact Mathematics and Computer Science.
            </p>
          </div>

          <Link
            href="/subjects"
            className="mt-6 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-[#1E293B] text-navy-950 dark:text-white border border-gray-200/90 dark:border-[#1E293B] font-bold text-sm shadow-sm transition group"
          >
            <span>Explore All Course Syllabi</span>
            <ArrowRight className="w-4 h-4 text-accent-500 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Bento Card 1: Mathematics Mastery (7 cols) */}
          <div className="lg:col-span-7 p-7 sm:p-9 rounded-3xl bg-white dark:bg-[#0D1322] border border-gray-200/90 dark:border-[#1E293B] shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-sm">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Grades 5 – 12 • AP / Honors
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-navy-950 dark:text-white tracking-tight mb-2">
                Mathematics Track
              </h3>
              <p className="text-sm sm:text-base text-charcoal-600 dark:text-slate-300 mb-6">
                Master rigorous step-by-step mathematical proofs, analytical problem breakdown, and score higher on school exams and AP tests.
              </p>

              {/* Interactive Topic Tabs */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveMathTopic('calculus')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeMathTopic === 'calculus'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-[#162032] text-gray-700 dark:text-slate-300 hover:bg-gray-200'
                  }`}
                >
                  AP Calculus
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMathTopic('algebra')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeMathTopic === 'algebra'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-[#162032] text-gray-700 dark:text-slate-300 hover:bg-gray-200'
                  }`}
                >
                  Algebra I & II
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMathTopic('geometry')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeMathTopic === 'geometry'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-[#162032] text-gray-700 dark:text-slate-300 hover:bg-gray-200'
                  }`}
                >
                  Geometry & Proofs
                </button>
              </div>

              {/* Topic Syllabus Breakdown */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#111827] border border-gray-200/80 dark:border-[#1E293B] mb-6">
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-navy-950 dark:text-white font-mono">
                  <span>{mathDetails[activeMathTopic].title}</span>
                  <span className="text-amber-600 dark:text-amber-400">{mathDetails[activeMathTopic].testTarget}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-charcoal-700 dark:text-slate-300">
                  {mathDetails[activeMathTopic].syllabus.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/tutors?subject=Mathematics"
              className="inline-flex items-center justify-between p-3.5 rounded-xl bg-gray-100 dark:bg-[#162032] hover:bg-amber-50 dark:hover:bg-amber-950/40 text-navy-950 dark:text-white text-xs font-bold transition group-hover:border-amber-300"
            >
              <span>Connect with Verified Mathematics Tutors</span>
              <ArrowRight className="w-4 h-4 text-amber-500 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Bento Card 2: Computer Science Engineering (5 cols) */}
          <div className="lg:col-span-5 p-7 sm:p-9 rounded-3xl bg-white dark:bg-[#0D1322] border border-gray-200/90 dark:border-[#1E293B] shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm">
                  <Code2 className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Grades 6 – 12 • Practical & AP
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-navy-950 dark:text-white tracking-tight mb-2">
                Computer Science Track
              </h3>
              <p className="text-sm text-charcoal-600 dark:text-slate-300 mb-6">
                Real code, real algorithms. Move beyond drag-and-drop toys into Python and Java with our live integrated in-browser IDE.
              </p>

              {/* CS Sub-topics */}
              <div className="flex items-center gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveCsTopic('python')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeCsTopic === 'python'
                      ? 'bg-emerald-500 text-navy-950 shadow-sm'
                      : 'bg-gray-100 dark:bg-[#162032] text-gray-700 dark:text-slate-300'
                  }`}
                >
                  Python Mastery
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCsTopic('apcs')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeCsTopic === 'apcs'
                      ? 'bg-emerald-500 text-navy-950 shadow-sm'
                      : 'bg-gray-100 dark:bg-[#162032] text-gray-700 dark:text-slate-300'
                  }`}
                >
                  AP CS A (Java)
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900 text-gray-200 font-mono text-xs mb-6 space-y-2 border border-gray-800">
                <div className="text-emerald-400 font-bold flex items-center justify-between pb-2 border-b border-gray-800">
                  <span>{csDetails[activeCsTopic].title}</span>
                  <span className="text-gray-400 text-[10px]">{csDetails[activeCsTopic].stack}</span>
                </div>
                {csDetails[activeCsTopic].syllabus.map((topic) => (
                  <div key={topic} className="flex items-center gap-2 text-gray-300 text-[11px]">
                    <span className="text-emerald-400">&gt;</span>
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/tutors?subject=Computer%20Science"
              className="inline-flex items-center justify-between p-3.5 rounded-xl bg-gray-100 dark:bg-[#162032] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-navy-950 dark:text-white text-xs font-bold transition group-hover:border-emerald-300"
            >
              <span>Connect with Computer Science Tutors</span>
              <ArrowRight className="w-4 h-4 text-emerald-500 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Bento Card 3: 4-Tier Educator Auditing Pipeline (12 cols) */}
          <div className="lg:col-span-12 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold mb-4">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>RIGOROUS CREDENTIAL VERIFICATION</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Only 3.2% of Applicant Educators are Approved.
                </h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Unlike open tutor directories where anyone can list themselves, every Classly educator passes an identity verification, university degree audit, subject exam, and live teaching audition.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2.5 mb-1.5 font-bold text-white text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-mono">01</span>
                    <span>Degree Transcripts</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-8">
                    Manual verification of official university diplomas from accredited US & global institutions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2.5 mb-1.5 font-bold text-white text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-mono">02</span>
                    <span>Live Teaching Audition</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-8">
                    45-minute live simulated classroom lesson evaluated by master curriculum specialists.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2.5 mb-1.5 font-bold text-white text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-mono">03</span>
                    <span>Technical Aptitude Test</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-8">
                    Timed problem solving in AP Calculus theorems or advanced Python/Java data structures.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2.5 mb-1.5 font-bold text-white text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-mono">04</span>
                    <span>Continuous Parent Audits</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-8">
                    Strict 4.8+ rating threshold with full lesson recordings available for parent review anytime.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
