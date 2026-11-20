'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  CalendarCheck, 
  Video, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export function InteractiveHowItWorks() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      number: '01',
      title: 'Filter by Subject, Syllabus & Timezone',
      description: 'Select your exact course track (e.g. AP Calculus BC or Python OOP). Review verified university credentials, student review histories, and watch 60-second video introductions.',
      tag: 'Step 1 • Discovery',
      highlight: 'Full transparency: View hourly rates, verified degrees, and verified student feedback upfront.',
    },
    {
      id: 2,
      number: '02',
      title: 'Book a Single Lesson with Zero Lock-in',
      description: 'Pick convenient afternoon or weekend slots synced automatically to your student’s local US timezone. No mandatory recurring monthly packages, ever.',
      tag: 'Step 2 • Flexible Scheduling',
      highlight: '100% Satisfaction Guarantee: If your first lesson isn’t transformative, you receive a full refund.',
    },
    {
      id: 3,
      number: '03',
      title: 'Enter Live Interactive Browser Studio',
      description: 'Jump right into your lesson with 1-click. Solve problems on dual-pen whiteboards, compile live code, and receive automatic timestamped video recordings.',
      tag: 'Step 3 • Live Mastery',
      highlight: 'Zero downloads: Everything runs smoothly in Google Chrome, Safari, or Edge with HD audio/video.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-[#070B14] border-b border-gray-200/80 dark:border-[#1E293B] relative overflow-hidden transition-colors duration-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 dark:bg-[#162032] border border-navy-200 dark:border-slate-700 text-xs font-mono font-bold text-navy-900 dark:text-emerald-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span>FRICTIONLESS ACADEMIC ONBOARDING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy-950 dark:text-white tracking-tight">
            How Classly Operates.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-charcoal-600 dark:text-slate-300">
            From discovering the ideal educator to your first live lesson in three straightforward steps.
          </p>
        </div>

        {/* 3 Step Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            return (
              <div
                key={step.id}
                onMouseEnter={() => setActiveStep(step.id)}
                className={`p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#0D1322] border-navy-900 dark:border-emerald-500 shadow-xl -translate-y-1.5'
                    : 'bg-gray-50/80 dark:bg-[#0A0F1D] border-gray-200/80 dark:border-[#1E293B] hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-3xl font-black text-gray-300 dark:text-slate-700">
                      {step.number}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                        : 'bg-gray-100 dark:bg-[#162032] text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-800'
                    }`}>
                      {step.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-navy-950 dark:text-white mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 dark:text-slate-300 leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-[#1E293B] text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                  <span>{step.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Row */}
        <div className="mt-14 text-center">
          <Link
            href="/tutors"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-navy-950 hover:bg-navy-900 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-navy-950 font-bold text-sm shadow-lift transition-all hover:scale-105 active:scale-95"
          >
            <span>Browse All Verified Educators</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

    </section>
  );
}
