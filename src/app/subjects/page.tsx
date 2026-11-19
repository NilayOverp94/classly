'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Atom, 
  TestTube, 
  Dna, 
  Code, 
  BookOpen, 
  Landmark, 
  FlaskConical,
  Search, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/MotionComponents';

interface DetailedSubject {
  id: string;
  name: string;
  category: 'Mathematics' | 'Computer Science';
  headline: string;
  description: string;
  topics: string[];
  grades: string;
  iconName: string;
}

const detailedSubjects: DetailedSubject[] = [
  {
    id: 'subj-math',
    name: 'Mathematics',
    category: 'Mathematics',
    headline: 'Pre-Algebra through AP Calculus AB/BC',
    description: 'Master foundational numeracy, algebraic reasoning, geometry proofs, and differential/integral calculus with step-by-step visual problem solving.',
    topics: ['Pre-Algebra', 'Algebra I & II', 'Geometry', 'Trigonometry', 'Pre-Calculus', 'AP Calculus AB', 'AP Calculus BC', 'SAT Math Prep'],
    grades: 'Grades 5 – 12',
    iconName: 'Calculator',
  },
  {
    id: 'subj-cs',
    name: 'Computer Science',
    category: 'Computer Science',
    headline: 'Python, AP CS A (Java) & Coding Fundamentals',
    description: 'From first lines of code to advanced object-oriented programming, data structures, recursion, and algorithmic problem-solving for school and competitions.',
    topics: ['Python for Beginners', 'AP Computer Science A (Java)', 'Data Structures & Algorithms', 'Object-Oriented Design', 'Web Basics (HTML/CSS/JS)', 'Logic & Problem Solving'],
    grades: 'Grades 6 – 12',
    iconName: 'Code',
  },
];

const iconMap: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-6 h-6 text-navy-800 dark:text-emerald-400" />,
  Atom: <Atom className="w-6 h-6 text-navy-800 dark:text-emerald-400" />,
  TestTube: <TestTube className="w-6 h-6 text-navy-800 dark:text-emerald-400" />,
  Dna: <Dna className="w-6 h-6 text-navy-800 dark:text-emerald-400" />,
  Code: <Code className="w-6 h-6 text-navy-800 dark:text-emerald-400" />,
  BookOpen: <BookOpen className="w-6 h-6 text-navy-800 dark:text-emerald-400" />,
  Landmark: <Landmark className="w-6 h-6 text-navy-800 dark:text-emerald-400" />,
  FlaskConical: <FlaskConical className="w-6 h-6 text-navy-800 dark:text-emerald-400" />,
};

export default function SubjectsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredSubjects = useMemo(() => {
    return detailedSubjects.filter((subj) => {
      if (selectedCategory !== 'all' && subj.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = subj.name.toLowerCase().includes(q);
        const matchesDesc = subj.description.toLowerCase().includes(q);
        const matchesTopics = subj.topics.some((t) => t.toLowerCase().includes(q));
        return matchesName || matchesDesc || matchesTopics;
      }
      return true;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="bg-offwhite dark:bg-[#0A0F1D] min-h-screen py-10 lg:py-16 border-b border-gray-200 dark:border-[#1E293B] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <FadeIn direction="up" delay={0.05} duration={0.5}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-softblue-100 dark:bg-[#162032] border border-softblue-200 dark:border-[#2D3B4F] text-xs font-semibold text-navy-800 dark:text-emerald-400 mb-3 shadow-subtle">
              <GraduationCap className="w-4 h-4 text-accent-500 dark:text-emerald-400" />
              <span>US K-12 & AP Curriculum Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-800 dark:text-white tracking-tight">
              Subjects & Curriculum Taught on Classly
            </h1>
            <p className="mt-3 text-sm sm:text-base text-charcoal-600 dark:text-slate-300 leading-relaxed">
              Every subject on Classly is instructed by verified degree-holding educators who specialize in US school curricula, AP exam standards, and foundational academic confidence.
            </p>
          </div>
        </FadeIn>

        {/* Search & Category Filter Bar */}
        <FadeIn direction="up" delay={0.15} duration={0.5}>
          <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-200 dark:border-[#1E293B] shadow-subtle mb-10 max-w-4xl mx-auto space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-charcoal-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by topic (e.g. 'Calculus', 'Python', 'Algebra I & II', 'Geometry', 'Data Structures')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#162032] border border-gray-200 dark:border-[#2D3B4F] rounded-lg text-sm text-navy-800 dark:text-white placeholder-charcoal-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#1C283F] transition"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
              {[
                { id: 'all', label: 'All Tracks' },
                { id: 'Mathematics', label: 'Mathematics' },
                { id: 'Computer Science', label: 'Computer Science & Coding' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg border transition active:scale-95 ${
                    selectedCategory === cat.id
                      ? 'bg-navy-800 dark:bg-emerald-600 text-white border-navy-800 dark:border-emerald-600 shadow-subtle'
                      : 'bg-gray-50 dark:bg-[#162032] text-charcoal-700 dark:text-slate-300 border-gray-200 dark:border-[#2D3B4F] hover:bg-gray-100 dark:hover:bg-[#1E293B]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Subjects Grid */}
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredSubjects.map((subj) => (
            <StaggerItem key={subj.id} distance={18} duration={0.5}>
              <div
                className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200/90 dark:border-[#1E293B] shadow-subtle hover:shadow-card dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-navy-300 dark:hover:border-slate-600 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between h-full group hover:-translate-y-1"
              >
                <div>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-softblue-100 dark:bg-[#162032] border border-transparent dark:border-[#2D3B4F] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                        {iconMap[subj.iconName]}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-navy-800 dark:text-white">
                          {subj.name}
                        </h2>
                        <span className="text-xs font-semibold text-accent-600 dark:text-emerald-400">
                          {subj.headline}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-navy-800 dark:text-white block">{subj.grades}</span>
                      <span className="text-[11px] text-accent-700 dark:text-emerald-300 font-semibold bg-accent-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-accent-200 dark:border-emerald-800/60">
                        Standard Track
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-charcoal-600 dark:text-slate-300 leading-relaxed mb-4">
                    {subj.description}
                  </p>

                  {/* Subtopic tags */}
                  <div className="mb-6">
                    <span className="text-[11px] font-bold text-charcoal-400 dark:text-slate-400 uppercase tracking-wider block mb-2">
                      Key Topics Covered ({subj.grades})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {subj.topics.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded bg-gray-50 dark:bg-[#162032] text-navy-900 dark:text-slate-200 text-xs font-medium border border-gray-200 dark:border-[#2D3B4F] hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom action row */}
                <div className="pt-4 border-t border-gray-100 dark:border-[#1E293B] flex items-center justify-between">
                  <span className="text-[11px] text-charcoal-500 dark:text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent-500 dark:text-emerald-400" />
                    <span>1-on-1 & Small Group Sessions</span>
                  </span>
                  
                  <Link
                    href={`/tutors?subject=${encodeURIComponent(subj.name)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-subtle active:scale-95"
                  >
                    <span>Browse {subj.name} Tutors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Pedagogical Trust Strip */}
        <FadeIn direction="up" delay={0.2} duration={0.5}>
          <div className="mt-14 p-8 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-[#1E293B] shadow-subtle hover:shadow-card transition-shadow duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-charcoal-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-navy-800 dark:text-white text-sm block mb-1">Targeted to US School Syllabi</span>
                  <span>Our tutors teach directly from your student's textbook, teacher assignments, and state standards.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-navy-800 dark:text-white text-sm block mb-1">College Board AP Exam Alignment</span>
                  <span>Specialized focus on FRQs (Free-Response Questions), rubric scoring guidelines, and past exam pattern practice.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-navy-800 dark:text-white text-sm block mb-1">Homework & Test Preparation</span>
                  <span>Bring difficult weekly homework problems directly into the live whiteboard classroom for immediate clarity.</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

      </div>
    </div>
  );
}

