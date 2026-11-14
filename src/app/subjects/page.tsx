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
import { mockSubjects } from '@/lib/data/mockSubjects';

interface DetailedSubject {
  id: string;
  name: string;
  category: 'Mathematics' | 'Science' | 'Computer Science' | 'Humanities';
  headline: string;
  description: string;
  topics: string[];
  grades: string;
  tutorCount: number;
  startingPrice: number;
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
    tutorCount: 42,
    startingPrice: 20,
    iconName: 'Calculator',
  },
  {
    id: 'subj-physics',
    name: 'Physics',
    category: 'Science',
    headline: 'Conceptual, Honors & AP Physics 1, 2, C',
    description: 'Understand Newtonian mechanics, thermodynamics, electromagnetism, and wave optics through intuitive real-world simulations and free-response problem sets.',
    topics: ['Kinematics & Dynamics', 'Work, Energy & Power', 'Rotational Mechanics', 'Electricity & Magnetism', 'AP Physics 1 & 2', 'AP Physics C Mechanics'],
    grades: 'Grades 8 – 12',
    tutorCount: 24,
    startingPrice: 24,
    iconName: 'Atom',
  },
  {
    id: 'subj-chemistry',
    name: 'Chemistry',
    category: 'Science',
    headline: 'Honors Chemistry & AP Chemistry',
    description: 'Demystify stoichiometry, molecular orbital theory, chemical equilibrium, thermochemistry, and reaction kinetics with structured worksheets.',
    topics: ['Atomic Structure & Periodic Trends', 'Stoichiometry & Dimensional Analysis', 'Chemical Equilibrium', 'Acids, Bases & Buffers', 'Thermodynamics & Kinetics', 'Organic Chemistry Basics'],
    grades: 'Grades 9 – 12',
    tutorCount: 19,
    startingPrice: 25,
    iconName: 'TestTube',
  },
  {
    id: 'subj-biology',
    name: 'Biology',
    category: 'Science',
    headline: 'Life Sciences & AP Biology',
    description: 'Explore cellular energetics, Mendelian genetics, molecular biotechnology, evolutionary biology, and ecology with interactive concept maps.',
    topics: ['Cell Structure & Transport', 'Cellular Respiration & Photosynthesis', 'Genetics & Heredity', 'Gene Expression & Regulation', 'Ecology & Natural Selection'],
    grades: 'Grades 7 – 12',
    tutorCount: 22,
    startingPrice: 22,
    iconName: 'Dna',
  },
  {
    id: 'subj-cs',
    name: 'Computer Science',
    category: 'Computer Science',
    headline: 'Python, AP CS A (Java) & Coding Fundamentals',
    description: 'From first lines of code to advanced object-oriented programming, data structures, recursion, and algorithmic problem-solving for school and competitions.',
    topics: ['Python for Beginners', 'AP Computer Science A (Java)', 'Data Structures & Algorithms', 'Object-Oriented Design', 'Web Basics (HTML/CSS/JS)', 'Logic & Problem Solving'],
    grades: 'Grades 6 – 12',
    tutorCount: 36,
    startingPrice: 25,
    iconName: 'Code',
  },
  {
    id: 'subj-english',
    name: 'English Language Arts',
    category: 'Humanities',
    headline: 'Critical Reading, AP Lit & Essay Composition',
    description: 'Develop persuasive thesis construction, literary analysis, grammatical precision, and close-reading strategies for middle school and high school exams.',
    topics: ['Reading Comprehension', 'Persuasive & Expository Writing', 'AP English Language', 'AP English Literature', 'SAT/ACT Verbal Strategies', 'Vocabulary & Rhetoric'],
    grades: 'Grades 6 – 12',
    tutorCount: 31,
    startingPrice: 22,
    iconName: 'BookOpen',
  },
  {
    id: 'subj-history',
    name: 'History & Social Studies',
    category: 'Humanities',
    headline: 'US History, AP World History & Civics',
    description: 'Master historical contextualization, DBQ (Document-Based Question) structure, and chronological cause-and-effect reasoning.',
    topics: ['AP US History (APUSH)', 'AP World History (Modern)', 'European History', 'Civics & US Government', 'Historical Essay Writing'],
    grades: 'Grades 7 – 12',
    tutorCount: 17,
    startingPrice: 22,
    iconName: 'Landmark',
  },
  {
    id: 'subj-general-science',
    name: 'Integrated Science',
    category: 'Science',
    headline: 'Middle School Physical & Earth Science',
    description: 'Build robust foundational scientific inquiry skills covering earth systems, states of matter, simple machines, and experimental design.',
    topics: ['Earth & Space Science', 'Forces & Motion', 'Weather & Climate', 'Matter & Energy', 'Scientific Method & Lab Skills'],
    grades: 'Grades 5 – 8',
    tutorCount: 28,
    startingPrice: 20,
    iconName: 'FlaskConical',
  },
];

const iconMap: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-6 h-6 text-navy-800" />,
  Atom: <Atom className="w-6 h-6 text-navy-800" />,
  TestTube: <TestTube className="w-6 h-6 text-navy-800" />,
  Dna: <Dna className="w-6 h-6 text-navy-800" />,
  Code: <Code className="w-6 h-6 text-navy-800" />,
  BookOpen: <BookOpen className="w-6 h-6 text-navy-800" />,
  Landmark: <Landmark className="w-6 h-6 text-navy-800" />,
  FlaskConical: <FlaskConical className="w-6 h-6 text-navy-800" />,
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
    <div className="bg-offwhite min-h-screen py-10 lg:py-16 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-softblue-100 border border-softblue-200 text-xs font-semibold text-navy-800 mb-3 shadow-subtle">
            <GraduationCap className="w-4 h-4 text-accent-500" />
            <span>US K-12 & AP Curriculum Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-800 tracking-tight">
            Subjects & Curriculum Taught on Classly
          </h1>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 leading-relaxed">
            Every subject on Classly is instructed by verified degree-holding educators who specialize in US school curricula, AP exam standards, and foundational academic confidence.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle mb-10 max-w-4xl mx-auto space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic (e.g. 'Calculus', 'Organic Chemistry', 'Python', 'APUSH', 'Essay Writing')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Subjects' },
              { id: 'Mathematics', label: 'Mathematics' },
              { id: 'Science', label: 'Science & Physics' },
              { id: 'Computer Science', label: 'Coding & CS' },
              { id: 'Humanities', label: 'English & Humanities' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  selectedCategory === cat.id
                    ? 'bg-navy-800 text-white border-navy-800 shadow-subtle'
                    : 'bg-gray-50 text-charcoal-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredSubjects.map((subj) => (
            <div
              key={subj.id}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-subtle hover:shadow-card hover:border-navy-300 transition-all p-6 sm:p-7 flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-softblue-100 flex items-center justify-center flex-shrink-0">
                      {iconMap[subj.iconName]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-navy-800">
                        {subj.name}
                      </h2>
                      <span className="text-xs font-semibold text-accent-600">
                        {subj.headline}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-navy-800 block">From ${subj.startingPrice}/hr</span>
                    <span className="text-[11px] text-charcoal-500">{subj.tutorCount} tutors</span>
                  </div>
                </div>

                <p className="text-xs text-charcoal-600 leading-relaxed mb-4">
                  {subj.description}
                </p>

                {/* Subtopic tags */}
                <div className="mb-6">
                  <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block mb-2">
                    Key Topics Covered ({subj.grades})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {subj.topics.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded bg-gray-50 text-navy-900 text-xs font-medium border border-gray-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom action row */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-charcoal-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
                  <span>1-on-1 & Small Group Sessions</span>
                </span>
                
                <Link
                  href={`/tutors?subject=${encodeURIComponent(subj.name)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-bold transition shadow-subtle"
                >
                  <span>Browse {subj.name} Tutors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>

        {/* Pedagogical Trust Strip */}
        <div className="mt-14 p-8 bg-white rounded-2xl border border-gray-200 shadow-subtle">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-charcoal-600">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy-800 text-sm block mb-1">Targeted to US School Syllabi</span>
                <span>Our tutors teach directly from your student's textbook, teacher assignments, and state standards.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy-800 text-sm block mb-1">College Board AP Exam Alignment</span>
                <span>Specialized focus on FRQs (Free-Response Questions), rubric scoring guidelines, and past exam pattern practice.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy-800 text-sm block mb-1">Homework & Test Preparation</span>
                <span>Bring difficult weekly homework problems directly into the live whiteboard classroom for immediate clarity.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
