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
            href="/tutors"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-navy-900 group"
          >
            <span>Browse all subjects</span>
            <ArrowRight className="w-4 h-4 text-accent-500 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Subjects Grid (8 categories) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mockSubjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/tutors?subject=${encodeURIComponent(subject.name)}`}
              className="group p-5 rounded-xl border border-gray-200/80 bg-offwhite/50 hover:bg-white hover:border-navy-200 hover:shadow-lift transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-softblue-100 flex items-center justify-center mb-4 group-hover:bg-navy-800 transition-colors">
                  <div className="group-hover:text-white transition-colors [&>svg]:group-hover:text-white">
                    {iconMap[subject.iconName] || <Calculator className="w-6 h-6 text-navy-800" />}
                  </div>
                </div>

                <h3 className="text-base font-bold text-navy-800 group-hover:text-navy-900 mb-1">
                  {subject.name}
                </h3>
                
                <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed">
                  {subject.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-charcoal-500">
                <span>{subject.tutorCount} verified tutors</span>
                <span className="text-navy-800 group-hover:text-accent-600 font-semibold group-hover:underline">
                  Explore &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

