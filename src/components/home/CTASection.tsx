import React from 'react';
import Link from 'next/link';
import { Search, GraduationCap } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-16 lg:py-20 bg-navy-800 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl mx-auto">
          Your next great learning experience starts here.
        </h2>
        
        <p className="mt-4 text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
          Experience personalized, high-impact K-12 instruction tailored to your child's curriculum and academic pace.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/tutors"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-navy-800 hover:bg-gray-100 font-semibold rounded-md shadow-subtle transition text-sm"
          >
            <Search className="w-4 h-4 text-navy-800" />
            <span>Find a Tutor</span>
          </Link>
          
          <Link
            href="/become-a-tutor"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-700 hover:bg-navy-600 text-white font-semibold rounded-md border border-navy-600 transition text-sm"
          >
            <GraduationCap className="w-4 h-4 text-accent-400" />
            <span>Teach on Classly</span>
          </Link>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          No subscription commitments • 100% money-back first lesson guarantee
        </div>

      </div>
    </section>
  );
}

