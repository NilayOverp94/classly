import React from 'react';
import Link from 'next/link';
import { Search, CalendarCheck, Video, ArrowRight } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Find your teacher',
      description: 'Search vetted educators by subject, grade level, price, and schedule. Read authentic student reviews and teaching methodologies to find the perfect fit.',
      icon: <Search className="w-6 h-6 text-navy-800" />,
    },
    {
      number: '02',
      title: 'Book your lesson',
      description: 'Choose between personalized 1-on-1 tutoring or interactive small-group classes. Select a time slot that matches your student’s local US timezone.',
      icon: <CalendarCheck className="w-6 h-6 text-accent-500" />,
    },
    {
      number: '03',
      title: 'Learn live online',
      description: 'Join our dedicated, secure browser-based classroom with live video, dual digital whiteboards, screen sharing, and instant file exchange.',
      icon: <Video className="w-6 h-6 text-navy-800" />,
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-gray-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">
            Simple, Transparent Process
          </h2>
          <p className="text-3xl font-bold text-navy-800 tracking-tight">
            How Classly Works
          </p>
          <p className="mt-3 text-sm text-charcoal-600 leading-relaxed">
            From search to live instruction in three straightforward steps. Designed for busy parents and motivated students.
          </p>
        </div>

        {/* Steps: Horizontal on Desktop, Vertical on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="relative flex flex-col items-start p-6 rounded-xl border border-gray-200/80 bg-offwhite/40 hover:bg-white hover:shadow-card transition duration-200"
            >
              {/* Step indicator top row */}
              <div className="flex items-center justify-between w-full mb-6">
                <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 shadow-subtle flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-3xl font-extrabold text-gray-200 tracking-tighter">
                  {step.number}
                </span>
              </div>

              <h3 className="text-lg font-bold text-navy-800 mb-2">
                {step.title}
              </h3>
              
              <p className="text-sm text-charcoal-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}

        </div>

        {/* Action Link */}
        <div className="mt-12 text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-accent-500 transition-colors"
          >
            <span>Read full platform guidelines, safety standards & parent guarantees</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

