'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, GraduationCap, ShieldCheck, Star, Users } from 'lucide-react';

export function Hero() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedGrade, setSelectedGrade] = useState('Grade 8');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/tutors?subject=${encodeURIComponent(selectedSubject)}&grade=${encodeURIComponent(selectedGrade)}`);
  };

  return (
    <section className="relative bg-offwhite pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-gray-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Prop & Search Interface */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Trust pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-softblue-100 border border-softblue-200 w-fit text-xs font-semibold text-navy-800 mb-6 shadow-subtle">
              <ShieldCheck className="w-4 h-4 text-accent-500" />
              <span>Verified K-12 Educators • Rigorously Vetted</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-navy-800 tracking-tight leading-[1.12]">
              Find the right tutor.<br />
              <span className="text-navy-900">Make learning personal.</span>
            </h1>

            <p className="mt-5 text-lg text-charcoal-600 max-w-xl leading-relaxed">
              Connect with experienced teachers for personalized one-to-one tutoring and interactive online classes designed around your student's curriculum and pace.
            </p>

            {/* Prominent Search Interface Box */}
            <div className="mt-8 bg-white p-3 sm:p-4 rounded-xl border border-gray-200/90 shadow-card max-w-xl">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                
                {/* Subject Selector */}
                <div className="flex-1 min-w-0">
                  <label htmlFor="hero-subject" className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <select
                    id="hero-subject"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5 text-sm font-medium text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                  >
                    <option value="Mathematics">Mathematics (Pre-Algebra to AP Calculus)</option>
                    <option value="Physics">Physics (High School & AP)</option>
                    <option value="Chemistry">Chemistry (Honors & AP)</option>
                    <option value="Biology">Biology (AP & Life Sciences)</option>
                    <option value="English">English Language & Literature</option>
                    <option value="Computer Science">Computer Science & Python</option>
                    <option value="History">History & Social Studies</option>
                  </select>
                </div>

                {/* Grade Selector */}
                <div className="sm:w-40">
                  <label htmlFor="hero-grade" className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-1">
                    Grade Level
                  </label>
                  <select
                    id="hero-grade"
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5 text-sm font-medium text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                  >
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9 (Freshman)</option>
                    <option value="Grade 10">Grade 10 (Sophomore)</option>
                    <option value="Grade 11">Grade 11 (Junior)</option>
                    <option value="Grade 12">Grade 12 (Senior)</option>
                  </select>
                </div>

                {/* Search Button */}
                <div className="sm:self-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-navy-800 hover:bg-navy-900 text-white font-semibold rounded-md transition shadow-subtle text-sm"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>

              </form>
            </div>

            {/* Secondary CTA & Supporting Info */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-charcoal-600">
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Are you a teacher?</span>
              <Link
                href="/become-a-tutor"
                className="inline-flex items-center gap-1.5 font-semibold text-navy-800 hover:text-accent-500 transition-colors"
              >
                <span>Become a Tutor on Classly</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="mt-8 pt-6 border-t border-gray-200/80 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <span className="block text-2xl font-bold text-navy-800">4.95/5</span>
                <span className="text-xs text-charcoal-500">Average lesson rating</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-navy-800">100%</span>
                <span className="text-xs text-charcoal-500">Verified credentials</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-navy-800">$18–$35</span>
                <span className="text-xs text-charcoal-500">Fair transparent rates</span>
              </div>
            </div>

          </div>

          {/* Right Column: Realistic Photograph of teacher teaching online */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main photo container */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-200/90 shadow-lift bg-white aspect-[4/3] sm:aspect-[5/4]">
                <Image
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80"
                  alt="Dedicated teacher working with student in an interactive online learning session"
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Real-time session indicator card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-lg border border-gray-200 shadow-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                        alt="Dr. Aarav Sharma"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-navy-800">Dr. Aarav Sharma</div>
                      <div className="text-[11px] text-charcoal-500">AP Calculus AB • Live Session</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-50 border border-accent-200 rounded text-[11px] font-semibold text-accent-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></span>
                    <span>Active Now</span>
                  </div>
                </div>

              </div>

              {/* Verified badge floating card */}
              <div className="absolute -top-3 -right-3 hidden sm:flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-gray-200 shadow-card text-xs font-semibold text-navy-800">
                <ShieldCheck className="w-4 h-4 text-accent-500" />
                <span>Background & Degree Checked</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

