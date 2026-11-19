'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Video,
  Calculator,
  Code2,
  Users,
  ChevronDown
} from 'lucide-react';
import { FadeIn, Float } from '@/components/ui/MotionComponents';

export function Hero() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedGrade, setSelectedGrade] = useState('Grade 8');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/tutors?subject=${encodeURIComponent(selectedSubject)}&grade=${encodeURIComponent(selectedGrade)}`);
  };

  const quickTopics = [
    { label: 'AP Calculus', subject: 'Mathematics' },
    { label: 'Python Coding', subject: 'Computer Science' },
    { label: 'Algebra I & II', subject: 'Mathematics' },
    { label: 'AP Computer Science A', subject: 'Computer Science' },
    { label: 'Geometry', subject: 'Mathematics' },
  ];

  return (
    <section className="relative bg-[#FAFAF8] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-gray-200/70 overflow-hidden">
      
      {/* Subtle ambient light gradient in background */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 -ml-20 w-80 h-80 bg-accent-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Bold Confident Headline & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Reassurance pill */}
            <FadeIn direction="down" delay={0.05} duration={0.45}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 w-fit text-xs font-semibold text-amber-900 mb-6 shadow-subtle hover:bg-amber-100/60 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>100% FREE First Demo Class • Audited US K-12 Curriculum</span>
              </div>
            </FadeIn>

            {/* Main Headline with organic curve accent */}
            <FadeIn direction="up" delay={0.12} duration={0.55}>
              <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black text-navy-950 tracking-tight leading-[1.08]">
                Build the Education<br />
                <span className="relative inline-block text-navy-900 mt-1">
                  your Child Deserves.
                  {/* Hand-drawn organic underline curve */}
                  <svg 
                    className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4 text-accent-400" 
                    viewBox="0 0 340 14" 
                    fill="none" 
                    preserveAspectRatio="none"
                  >
                    <path 
                      d="M3 10C65 3.5 190 2 337 7.5" 
                      stroke="currentColor" 
                      strokeWidth="5" 
                      strokeLinecap="round" 
                    />
                  </svg>
                </span>
              </h1>
            </FadeIn>

            {/* Subheadline */}
            <FadeIn direction="up" delay={0.2} duration={0.5}>
              <p className="mt-6 text-base sm:text-lg text-charcoal-600 max-w-xl leading-relaxed">
                Connect with vetted, degree-holding educators for personalized 1-on-1 tutoring and interactive classes in <strong className="text-navy-900 font-semibold">Mathematics</strong> and <strong className="text-navy-900 font-semibold">Computer Science</strong> — tailored to your student's school curriculum and academic pace.
              </p>
            </FadeIn>

            {/* Search and Discovery Filter Box */}
            <FadeIn direction="up" delay={0.28} duration={0.55}>
              <div className="mt-8 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-card hover:shadow-lift transition-shadow duration-300 max-w-2xl">
                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-3.5 sm:items-end">
                  
                  {/* Subject Selector */}
                  <div className="sm:col-span-5">
                    <label htmlFor="hero-subject" className="block text-[11px] font-bold text-charcoal-500 uppercase tracking-wider mb-1.5">
                      Subject Track
                    </label>
                    <div className="relative">
                      <select
                        id="hero-subject"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full h-11 appearance-none bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-xl pl-3.5 pr-9 text-sm font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-800 focus:bg-white transition cursor-pointer"
                      >
                        <option value="Mathematics">Mathematics</option>
                        <option value="Computer Science">Computer Science</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-charcoal-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Grade Selector */}
                  <div className="sm:col-span-4">
                    <label htmlFor="hero-grade" className="block text-[11px] font-bold text-charcoal-500 uppercase tracking-wider mb-1.5">
                      Grade Level
                    </label>
                    <div className="relative">
                      <select
                        id="hero-grade"
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="w-full h-11 appearance-none bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-xl pl-3.5 pr-9 text-sm font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-800 focus:bg-white transition cursor-pointer"
                      >
                        <option value="Grade 5">Grade 5 (Middle)</option>
                        <option value="Grade 6">Grade 6 (Middle)</option>
                        <option value="Grade 7">Grade 7 (Middle)</option>
                        <option value="Grade 8">Grade 8 (Middle)</option>
                        <option value="Grade 9">Grade 9 (Freshman)</option>
                        <option value="Grade 10">Grade 10 (Sophomore)</option>
                        <option value="Grade 11">Grade 11 (Junior)</option>
                        <option value="Grade 12">Grade 12 (Senior)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-charcoal-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full h-11 inline-flex items-center justify-center gap-2 px-4 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98] text-sm whitespace-nowrap"
                    >
                      <Search className="w-4 h-4 flex-shrink-0" />
                      <span>Find Tutor</span>
                    </button>
                  </div>

                </form>

                {/* Quick Topic Chips */}
                <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-semibold text-charcoal-400 mr-1">Popular:</span>
                  {quickTopics.map((topic) => (
                    <button
                      key={topic.label}
                      type="button"
                      onClick={() => router.push(`/tutors?subject=${encodeURIComponent(topic.subject)}`)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-navy-50 hover:text-navy-900 text-charcoal-600 font-medium transition active:scale-95"
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Secondary CTA row */}
            <FadeIn direction="up" delay={0.35} duration={0.45}>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-charcoal-600">
                <span className="text-xs uppercase tracking-wider font-bold text-gray-400">Are you an educator?</span>
                <Link
                  href="/become-a-tutor"
                  className="inline-flex items-center gap-1.5 font-bold text-navy-800 hover:text-accent-600 transition-colors group"
                >
                  <span>Apply to Teach on Classly</span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent-500 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </FadeIn>

            {/* Real Product Guarantees (No fake stats) */}
            <FadeIn direction="up" delay={0.42} duration={0.5}>
              <div className="mt-8 pt-6 border-t border-gray-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-navy-900 block">Verified Degree Audits</span>
                    <span className="text-charcoal-500">Every teacher's academic credentials manually verified</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Video className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-navy-900 block">Live HD Classrooms</span>
                    <span className="text-charcoal-500">Dual digital whiteboards, screen sharing & live code editor</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-navy-900 block">Pay Per Lesson</span>
                    <span className="text-charcoal-500">Zero subscriptions or mandatory monthly packages</span>
                  </div>
                </div>
              </div>
            </FadeIn>

          </div>

          {/* Right Column: Dynamic Kids & Teachers Collage */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <FadeIn direction="left" delay={0.2} duration={0.6}>
              <div className="relative mx-auto w-full max-w-[480px] lg:max-w-none h-[490px] sm:h-[530px] lg:h-[540px]">
                
                {/* Playful Dashed Golden Connector Curve */}
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none -z-0" 
                  viewBox="0 0 500 540" 
                  fill="none"
                >
                  <path 
                    d="M 380 40 C 470 120 440 240 370 270 C 300 300 130 260 120 360 C 110 440 220 500 330 490" 
                    stroke="#F59E0B" 
                    strokeWidth="2.5" 
                    strokeDasharray="6 8" 
                    strokeLinecap="round" 
                  />
                  
                  {/* Playful Accent Sparkles */}
                  <path d="M 430 70 L 434 78 L 442 82 L 434 86 L 430 94 L 426 86 L 418 82 L 426 78 Z" fill="#F59E0B" />
                  <path d="M 70 280 L 73 286 L 79 289 L 73 292 L 70 298 L 67 292 L 61 289 L 67 286 Z" fill="#F59E0B" />
                  <circle cx="370" cy="270" r="3.5" fill="#F59E0B" />
                  <circle cx="120" cy="360" r="3.5" fill="#F59E0B" />
                </svg>

                {/* Capsule 1 (Top-Left): Focused Student with Mathematics Curriculum Workbook */}
                <div className="absolute top-0 left-0 sm:left-4 w-[250px] sm:w-[280px] h-[180px] sm:h-[200px] rounded-[32px] overflow-hidden border-2 border-white shadow-lift bg-navy-100 z-10 transition-transform duration-300 hover:scale-[1.02]">
                  <Image
                    src="/images/hero-student-curriculum.jpg"
                    alt="Student focused on Mathematics curriculum workbook"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>

                {/* Floating Badge Pill 1 */}
                <div className="absolute top-[162px] sm:top-[178px] left-1 sm:left-6 z-30">
                  <Float amplitude={4} duration={3.8} delay={0.2}>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-navy-950 font-bold text-[11px] sm:text-xs shadow-md border border-amber-300">
                      <Calculator className="w-3.5 h-3.5 text-navy-900" />
                      <span>Academic Curriculum</span>
                    </span>
                  </Float>
                </div>

                {/* Capsule 2 (Center-Right): Enthusiastic Young Student Breakthrough */}
                <div className="absolute top-[135px] sm:top-[145px] right-0 sm:right-2 w-[220px] sm:w-[250px] h-[170px] sm:h-[190px] rounded-[32px] overflow-hidden border-2 border-white shadow-lift bg-accent-50 z-20 transition-transform duration-300 hover:scale-[1.02]">
                  <Image
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"
                    alt="Happy student celebrating learning breakthrough"
                    fill
                    className="object-cover"
                  />
                  {/* Floating Badge Pill 2 */}
                  <div className="absolute -bottom-2 -left-2 sm:bottom-3 sm:-left-3">
                    <Float amplitude={4.5} duration={4.2} delay={0.5}>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500 text-white font-bold text-[11px] sm:text-xs shadow-md border border-accent-400">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>1-on-1 Tutoring</span>
                      </span>
                    </Float>
                  </div>
                </div>

                {/* Capsule 3 (Bottom-Left): Student in Live Online Video Lesson with Teacher */}
                <div className="absolute bottom-0 left-2 sm:left-6 w-[270px] sm:w-[310px] h-[180px] sm:h-[205px] rounded-[32px] overflow-hidden border-2 border-white shadow-lift bg-softblue-100 z-10 transition-transform duration-300 hover:scale-[1.02]">
                  <Image
                    src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80"
                    alt="Student engaged in live interactive video class with educator"
                    fill
                    className="object-cover"
                  />
                  {/* Floating Badge Pill 3 (Coding track) */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900 text-white font-bold text-[11px] sm:text-xs shadow-md border border-navy-700">
                      <Code2 className="w-3.5 h-3.5 text-accent-400" />
                      <span>Python & Coding</span>
                    </span>
                  </div>
                  {/* Live Video Classroom Callout Bar */}
                  <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-200/90 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[11px] font-bold text-navy-900">Live Video Classroom</span>
                    </div>
                    <span className="text-[10px] font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                      HD Video
                    </span>
                  </div>
                </div>

                {/* Floating Reassurance Badge 4: Parent Supervised */}
                <div className="absolute -bottom-2 right-2 sm:right-6 z-30">
                  <Float amplitude={4} duration={3.6} delay={0.8}>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-navy-900 font-bold text-xs shadow-card border border-gray-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
                      <span>COPPA Compliant</span>
                    </span>
                  </Float>
                </div>

              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}
