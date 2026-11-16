import React from 'react';
import Link from 'next/link';
import { Search, CalendarCheck, Video, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Choose your educator',
      description: 'Filter vetted teachers by subject track (Mathematics or Computer Science), grade level, and hourly rate. Watch video intros and review academic credentials.',
      icon: <Search className="w-6 h-6 text-navy-900" />,
      badge: 'Step 1 • Discovery',
    },
    {
      number: '02',
      title: 'Schedule a time slot',
      description: 'Book personalized 1-on-1 sessions or small group classes. All times automatically sync to your local US timezone (Eastern, Central, Mountain, Pacific).',
      icon: <CalendarCheck className="w-6 h-6 text-accent-500" />,
      badge: 'Step 2 • Scheduling',
    },
    {
      number: '03',
      title: 'Learn live in browser',
      description: 'Join our interactive classroom with one click. Work together on dual-user whiteboards, share code files, and receive lesson notes right in your dashboard.',
      icon: <Video className="w-6 h-6 text-navy-900" />,
      badge: 'Step 3 • Live Lesson',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#FAFAF8] border-b border-gray-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 border border-accent-200 text-xs font-bold text-accent-700 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span>Simple, Transparent Learning</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-navy-950 tracking-tight">
            How Classly Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 leading-relaxed">
            From discovering the perfect tutor to conducting live interactive lessons in three straightforward steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col justify-between p-7 sm:p-8 rounded-3xl border border-gray-200/90 bg-white shadow-card hover:shadow-lift hover:border-navy-300 transition-all duration-300"
            >
              <div>
                {/* Step indicator top row */}
                <div className="flex items-center justify-between w-full mb-6">
                  <div className="w-13 h-13 p-3 rounded-2xl bg-softblue-50 border border-softblue-100 flex items-center justify-center shadow-subtle">
                    {step.icon}
                  </div>
                  <span className="text-3xl font-black text-gray-200 tracking-tighter">
                    {step.number}
                  </span>
                </div>

                <div className="text-xs font-bold text-accent-600 uppercase tracking-wider mb-1.5">
                  {step.badge}
                </div>

                <h3 className="text-xl font-black text-navy-950 mb-3 tracking-tight">
                  {step.title}
                </h3>
                
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-bold text-navy-800 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-accent-500" />
                <span>Protected by First Lesson Guarantee</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Link */}
        <div className="mt-14 text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-sm font-bold text-navy-800 hover:text-accent-600 transition-colors group"
          >
            <span>Learn more about our classroom tools, safety protocols & parent guarantees</span>
            <ArrowRight className="w-4 h-4 text-accent-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
