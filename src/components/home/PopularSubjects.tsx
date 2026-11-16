import React from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  FlaskConical, 
  BookOpen, 
  Atom, 
  TestTube, 
  Dna, 
  Code, 
  Landmark,
  ArrowRight
} from 'lucide-react';
import { mockSubjects } from '@/lib/data/mockSubjects';

const iconMap: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-6 h-6 text-navy-800" />,
  FlaskConical: <FlaskConical className="w-6 h-6 text-navy-800" />,
  BookOpen: <BookOpen className="w-6 h-6 text-navy-800" />,
  Atom: <Atom className="w-6 h-6 text-navy-800" />,
  TestTube: <TestTube className="w-6 h-6 text-navy-800" />,
  Dna: <Dna className="w-6 h-6 text-navy-800" />,
  Code: <Code className="w-6 h-6 text-navy-800" />,
  Landmark: <Landmark className="w-6 h-6 text-navy-800" />,
};

export function PopularSubjects() {
  return (
    <section className="py-16 lg:py-20 bg-white border-b border-gray-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">
              Curriculum Mastery
            </h2>
            <p className="text-3xl font-bold text-navy-800 tracking-tight">
              Popular Subjects
            </p>
            <p className="mt-2 text-charcoal-600 text-sm max-w-xl">
              From middle school fundamentals to advanced AP courses, our teachers personalize instruction for every grade level.
            </p>
          </div>
          <Link
            href="/subjects"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-navy-900 group"
          >
            <span>Browse all subjects & curriculum</span>
            <ArrowRight className="w-4 h-4 text-accent-500 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Subjects Grid (Focused 2 Core Tracks) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {mockSubjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/tutors?subject=${encodeURIComponent(subject.name)}`}
              className="group p-6 sm:p-7 rounded-2xl border border-gray-200/90 bg-white hover:border-navy-300 hover:shadow-card transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-softblue-100 flex items-center justify-center mb-5 group-hover:bg-navy-800 transition-colors">
                  <div className="group-hover:text-white transition-colors [&>svg]:group-hover:text-white">
                    {iconMap[subject.iconName] || <Calculator className="w-6 h-6 text-navy-800" />}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xl font-bold text-navy-800 group-hover:text-navy-900">
                    {subject.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-accent-700 bg-accent-50 px-2.5 py-0.5 rounded-full border border-accent-200">
                    Grades 5 – 12
                  </span>
                </div>
                
                <p className="text-xs text-charcoal-600 leading-relaxed mb-4">
                  {subject.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-charcoal-500">
                <span className="font-semibold text-navy-800">1-on-1 & Small Group Classes</span>
                <span className="text-navy-800 group-hover:text-accent-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Explore Track</span>
                  <span>&rarr;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

