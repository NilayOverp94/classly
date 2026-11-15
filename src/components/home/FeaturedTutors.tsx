'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShieldCheck, ArrowRight, GraduationCap, CheckCircle2, Award, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TeacherProfile } from '@/lib/types';

export function FeaturedTutors() {
  const [featured, setFeatured] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadFeaturedTutors() {
      try {
        const { data, error } = await supabase
          .from('teacher_profiles')
          .select(`
            id,
            user_id,
            headline,
            bio,
            years_experience,
            hourly_rate,
            teaching_format,
            status,
            education,
            rating,
            review_count,
            total_hours_taught,
            city,
            country,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('status', 'approved')
          .limit(4);

        if (!error && data && data.length > 0) {
          const mapped: TeacherProfile[] = data.map((t: any) => ({
            id: t.id,
            user_id: t.user_id,
            full_name: t.profiles?.full_name || 'Educator',
            avatar_url: t.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            headline: t.headline || 'Verified Educator',
            bio: t.bio || '',
            years_experience: t.years_experience || 0,
            hourly_rate: Number(t.hourly_rate) || 25,
            teaching_format: t.teaching_format || 'both',
            status: t.status,
            qualifications: [],
            education: t.education || '',
            teaching_methodology: '',
            rating: Number(t.rating) || 5.0,
            review_count: Number(t.review_count) || 0,
            total_hours_taught: Number(t.total_hours_taught) || 0,
            city: t.city || 'US',
            country: t.country || 'US',
            subjects: [],
            grades: [],
            languages: ['English'],
          }));
          setFeatured(mapped);
        } else {
          setFeatured([]);
        }
      } catch (err) {
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedTutors();
  }, []);

  // When no educators are approved yet, showcase the rigorous educator accreditation standard
  if (!loading && featured.length === 0) {
    return (
      <section className="py-16 lg:py-20 bg-offwhite/60 border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Rigorous Educator Accreditation</span>
              </div>
              <h2 className="text-3xl font-bold text-navy-800 tracking-tight">
                Our Educator Standards
              </h2>
              <p className="mt-2 text-charcoal-600 text-sm max-w-xl">
                Every educator on Classly undergoes an audit before conducting lessons. Learn about our verification criteria.
              </p>
            </div>
            <Link
              href="/become-a-tutor"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-navy-900 group"
            >
              <span>Apply to teach on Classly</span>
              <ArrowRight className="w-4 h-4 text-accent-500 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200/90 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-softblue-100 flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5 text-navy-800" />
                </div>
                <h3 className="font-bold text-base text-navy-800 mb-2">Degree Verification</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Direct audit of undergraduate and master's degree transcripts from recognized universities and institutions.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-semibold text-accent-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Audited Transcripts</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200/90 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-softblue-100 flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5 text-navy-800" />
                </div>
                <h3 className="font-bold text-base text-navy-800 mb-2">Curriculum Mastery</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Specialized evaluation in US Common Core, College Board AP course rubrics, and state standardized test frameworks.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-semibold text-accent-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AP & K-12 Aligned</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200/90 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-softblue-100 flex items-center justify-center mb-4">
                  <Award className="w-5 h-5 text-navy-800" />
                </div>
                <h3 className="font-bold text-base text-navy-800 mb-2">Pedagogical Demo</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Live digital whiteboard mock teaching sessions assessed for clarity, student patience, and conceptual explanation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-semibold text-accent-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simulated Instruction</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200/90 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-softblue-100 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5 text-accent-500" />
                </div>
                <h3 className="font-bold text-base text-navy-800 mb-2">Identity & Safety</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Government ID verification, COPPA compliant parent controls, and secure monitored classroom access.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-semibold text-accent-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>COPPA Safe Environment</span>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/tutors"
              className="inline-flex items-center gap-2 px-6 py-3 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-bold transition shadow-subtle"
            >
              <span>Explore Educator Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>
    );
  }

  // When real approved educators exist in the database:
  return (
    <section className="py-16 lg:py-20 bg-offwhite/60 border-b border-gray-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Rigorous Vetting • Verified Credentials</span>
            </div>
            <h2 className="text-3xl font-bold text-navy-800 tracking-tight">
              Featured Educators
            </h2>
            <p className="mt-2 text-charcoal-600 text-sm max-w-xl">
              Meet some of our accredited instructors with university degrees and specialized AP subject expertise.
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white rounded-xl border border-gray-200/90 shadow-subtle hover:shadow-lift transition-all duration-200 flex flex-col overflow-hidden"
            >
              <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                <Image
                  src={tutor.avatar_url}
                  alt={tutor.full_name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
                
                <div className="absolute top-3 right-3 bg-navy-900/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-subtle">
                  ${tutor.hourly_rate} / hr
                </div>

                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-semibold text-navy-800 flex items-center gap-1 shadow-subtle">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
                  <span>Verified</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-base font-bold text-navy-800 truncate">
                      {tutor.full_name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-semibold text-navy-900">
                      {tutor.review_count > 0 ? (
                        <>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{tutor.rating.toFixed(2)}</span>
                          <span className="text-gray-400 text-[11px]">({tutor.review_count})</span>
                        </>
                      ) : (
                        <span className="text-[11px] text-accent-700 bg-accent-50 px-1.5 py-0.5 rounded font-semibold border border-accent-200">
                          New Educator
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-charcoal-500 line-clamp-2 mb-3 leading-relaxed">
                    {tutor.headline}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tutor.years_experience > 0 && (
                      <span className="px-2 py-0.5 rounded bg-gray-50 text-charcoal-600 text-[11px] font-medium border border-gray-200">
                        {tutor.years_experience}+ yrs exp
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-charcoal-600 line-clamp-3 leading-relaxed mb-4">
                    {tutor.bio}
                  </p>
                </div>

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

      </div>
    </section>
  );
}
