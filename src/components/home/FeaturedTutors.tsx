import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShieldCheck, Clock, Award, ArrowRight } from 'lucide-react';
import { mockTutors } from '@/lib/data/mockTutors';

export function FeaturedTutors() {
  // Show top 4 featured tutors on homepage
  const featured = mockTutors.slice(0, 4);

  return (
    <section className="py-16 lg:py-20 bg-offwhite/60 border-b border-gray-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Rigorous Vetting • Top 3% of Applicants</span>
            </div>
            <h2 className="text-3xl font-bold text-navy-800 tracking-tight">
              Featured Educators
            </h2>
            <p className="mt-2 text-charcoal-600 text-sm max-w-xl">
              Meet some of our highly rated instructors with advanced degrees, specialized AP subject expertise, and proven track records.
            </p>
          </div>
          <Link
            href="/tutors"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-navy-900 group"
          >
            <span>View all tutors</span>
            <ArrowRight className="w-4 h-4 text-accent-500 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Tutor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white rounded-xl border border-gray-200/90 shadow-subtle hover:shadow-lift transition-all duration-200 flex flex-col overflow-hidden"
            >
              {/* Tutor Photo & Rate Badge */}
              <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                <Image
                  src={tutor.avatar_url}
                  alt={tutor.full_name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
                
                {/* Hourly Rate Badge */}
                <div className="absolute top-3 right-3 bg-navy-900/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-subtle">
                  ${tutor.hourly_rate} / hr
                </div>

                {/* Verified Pill */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-semibold text-navy-800 flex items-center gap-1 shadow-subtle">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-base font-bold text-navy-800 truncate">
                      {tutor.full_name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-semibold text-navy-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{tutor.rating.toFixed(2)}</span>
                      <span className="text-gray-400 text-[11px]">({tutor.review_count})</span>
                    </div>
                  </div>

                  <p className="text-xs text-charcoal-500 line-clamp-2 mb-3 leading-relaxed">
                    {tutor.headline}
                  </p>

                  {/* Badges: Subjects & Experience */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tutor.subjects.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-softblue-50 text-navy-800 text-[11px] font-medium border border-softblue-200"
                      >
                        {s}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded bg-gray-50 text-charcoal-600 text-[11px] font-medium border border-gray-200">
                      {tutor.years_experience}+ yrs exp
                    </span>
                  </div>

                  <p className="text-xs text-charcoal-600 line-clamp-3 leading-relaxed mb-4">
                    {tutor.bio}
                  </p>
                </div>

                {/* View Profile Action */}
                <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                  <Link
                    href={`/tutors/${tutor.id}`}
                    className="flex-1 text-center py-2 px-3 rounded-md text-xs font-semibold text-navy-800 bg-gray-50 hover:bg-navy-800 hover:text-white border border-gray-200 hover:border-navy-800 transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/booking/${tutor.id}`}
                    className="py-2 px-3 rounded-md text-xs font-semibold text-white bg-accent-500 hover:bg-accent-600 transition-colors"
                  >
                    Book
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Trust badge */}
        <div className="mt-8 text-center">
          <p className="text-xs text-charcoal-500 font-medium">
            All teachers maintain verified university credentials and background checks before conducting lessons.
          </p>
        </div>

      </div>
    </section>
  );
}

