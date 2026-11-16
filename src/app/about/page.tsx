import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Target, Heart, Globe, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-offwhite min-h-screen py-12 lg:py-20 border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2 block">
            Our Mission & Story
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-navy-800 tracking-tight leading-tight">
            Connecting motivated students with world-class educators.
          </h1>
          <p className="mt-4 text-base text-charcoal-600 leading-relaxed">
            Classly was created to bridge a vital gap in K-12 education: giving American families access to deeply qualified, passionate subject matter specialists at fair, transparent rates.
          </p>
        </div>

        {/* Founding Philosophy */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-subtle p-8 sm:p-12 mb-12 space-y-6">
          <h2 className="text-2xl font-bold text-navy-800">
            Why We Started Classly
          </h2>
          <p className="text-sm text-charcoal-700 leading-relaxed">
            Every parent knows that when a student struggles with Algebra II, AP Calculus, or Python programming, standard classroom instruction often moves too fast to address individual learning hurdles. At the same time, finding reliable local tutoring in the US often costs $70 to $120 per hour — placing dedicated academic support out of reach for many hardworking families.
          </p>
          <p className="text-sm text-charcoal-700 leading-relaxed">
            Meanwhile, India is home to an extraordinary pool of brilliant educators: university medalists, IIT and BITS engineering graduates, and career senior secondary teachers who master STEM subjects with deep conceptual rigor.
          </p>
          <p className="text-sm text-charcoal-700 leading-relaxed font-semibold text-navy-800">
            Classly brings these two communities together through modern WebRTC browser classrooms — delivering personalized, high-accountability learning where students thrive and educators are fairly rewarded.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-subtle">
            <ShieldCheck className="w-6 h-6 text-accent-500 mb-3" />
            <h3 className="font-bold text-base text-navy-800 mb-2">Uncompromising Vetting</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              We never cut corners on verification. Every teacher undergoes academic transcript audits, identity checks, and pedagogical interviews before teaching.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-subtle">
            <Target className="w-6 h-6 text-accent-500 mb-3" />
            <h3 className="font-bold text-base text-navy-800 mb-2">Curriculum Alignment</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Our educators adapt specifically to the student's US school curriculum, whether it is Common Core, Honors, or College Board AP standards.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-subtle">
            <Heart className="w-6 h-6 text-accent-500 mb-3" />
            <h3 className="font-bold text-base text-navy-800 mb-2">Child Safety First</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Parent-managed accounts, COPPA privacy adherence, and recorded session security ensure peace of mind for every household.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 bg-navy-800 text-white rounded-2xl text-center space-y-4">
          <h3 className="text-2xl font-bold">Start your learning journey with Classly</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Explore verified tutor profiles or apply to join our global teaching faculty.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              href="/tutors"
              className="px-6 py-2.5 bg-white text-navy-800 rounded-lg text-xs font-bold hover:bg-gray-100 transition shadow-subtle"
            >
              Find a Tutor
            </Link>
            <Link
              href="/become-a-tutor"
              className="px-6 py-2.5 bg-navy-700 text-white border border-navy-600 rounded-lg text-xs font-semibold hover:bg-navy-600 transition"
            >
              Teach on Classly
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

