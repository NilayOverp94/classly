'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Target, 
  Users, 
  Monitor, 
  DollarSign,
  Sparkles
} from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/MotionComponents';

export function WhyChooseUs() {
  const features = [
    {
      title: 'Audited Degree Credentials',
      description: 'Every educator undergoes a manual review of their university degree transcripts, teaching certifications, and identity before tutoring on Classly.',
      icon: <ShieldCheck className="w-5 h-5 text-accent-500" />,
      tag: 'Rigorous Vetting',
    },
    {
      title: 'Timezone-Synced Scheduling',
      description: 'Find convenient afternoon and weekend time slots that seamlessly adapt to your student’s local US timezone (Eastern, Central, Mountain, Pacific).',
      icon: <Clock className="w-5 h-5 text-navy-900" />,
      tag: 'Flexible Times',
    },
    {
      title: 'Aligned to US Syllabi',
      description: 'Curriculum instruction adapted to your child’s specific school coursework, textbooks, homework assignments, and AP/honors targets.',
      icon: <Target className="w-5 h-5 text-accent-500" />,
      tag: 'Custom Pace',
    },
    {
      title: '1-on-1 & Group Formats',
      description: 'Choose between highly focused private one-to-one tutoring or collaborative small-group classes with motivated peers.',
      icon: <Users className="w-5 h-5 text-navy-900" />,
      tag: 'Flexible Formats',
    },
    {
      title: 'Interactive HD Classrooms',
      description: 'Browser-based learning environment equipped with dual interactive whiteboards, screen sharing, syntax-highlighted code editors, and live video.',
      icon: <Monitor className="w-5 h-5 text-accent-500" />,
      tag: 'Native Tools',
    },
    {
      title: 'Pay-Per-Lesson Transparency',
      description: 'Zero lock-in subscriptions, zero hidden enrollment fees. Simply pay as you go per lesson, backed by our 100% first-lesson satisfaction guarantee.',
      icon: <DollarSign className="w-5 h-5 text-navy-900" />,
      tag: 'Zero Subscriptions',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-gray-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <FadeIn direction="up" delay={0.05} duration={0.5}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-softblue-50 border border-softblue-200 text-xs font-bold text-navy-900 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-accent-500" />
              <span>The Classly Difference</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-950 tracking-tight">
              Why Families Choose Classly
            </h2>
            <p className="mt-3 text-sm sm:text-base text-charcoal-600 leading-relaxed">
              We combine high-caliber educators with modern technology to deliver accountable, measurable academic confidence.
            </p>
          </div>
        </FadeIn>

        {/* Feature Grid */}
        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <StaggerItem key={feature.title} distance={18} duration={0.5}>
              <div
                className="bg-[#FAFAF8] p-7 rounded-3xl border border-gray-200/80 shadow-subtle hover:shadow-card hover:bg-white hover:border-navy-300 transition-all duration-300 flex flex-col justify-between h-full group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-gray-200/90 shadow-subtle flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      {feature.icon}
                    </div>
                    <span className="text-[11px] font-bold text-charcoal-500 bg-white px-2.5 py-1 rounded-full border border-gray-200/80 shadow-subtle">
                      {feature.tag}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-black text-navy-950 mb-2.5 tracking-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-200/50 text-[11px] font-bold text-accent-700 flex items-center gap-1">
                  <span>Verified Quality Standard</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  );
}
