'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, 
  ShieldCheck, 
  Award, 
  Clock, 
  MapPin, 
  Video, 
  CheckCircle, 
  ArrowLeft,
  ChevronRight,
  BookOpen,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Sparkles,
  Gift,
  Percent
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TeacherProfile, ReviewItem, PackageTier } from '@/lib/types';
import { calculatePackagePricing, LESSON_PACKAGES } from '@/lib/packages/lessonPackages';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/MotionComponents';

export default function TutorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const tutorId = params?.id as string;

  const [tutor, setTutor] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingMode, setBookingMode] = useState<'one_on_one' | 'group'>('one_on_one');
  const [selectedPackage, setSelectedPackage] = useState<PackageTier>(1);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  // Reviews & Ratings State
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewStats, setReviewStats] = useState<{
    total: number;
    averageRating: number;
    distribution: Record<number, number>;
  }>({
    total: 0,
    averageRating: 5.0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadTutor() {
      if (!tutorId) {
        setLoading(false);
        return;
      }

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
            teaching_methodology,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .or(`id.eq.${tutorId},user_id.eq.${tutorId}`)
          .maybeSingle();

        if (!error && data) {
          const rawProfiles: any = data.profiles;
          const userProfile = Array.isArray(rawProfiles) ? rawProfiles[0] : rawProfiles;
          const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || 'Educator')}&background=0B121E&color=ffffff&size=256&bold=true`;
          const profile: TeacherProfile = {
            id: data.id,
            user_id: data.user_id,
            full_name: userProfile?.full_name || 'Verified Educator',
            avatar_url: userProfile?.avatar_url || defaultAvatar,
            headline: data.headline || 'Classly Verified Educator',
            bio: data.bio || '',
            years_experience: data.years_experience || 0,
            hourly_rate: Number(data.hourly_rate) || 25,
            teaching_format: data.teaching_format || 'both',
            status: data.status,
            qualifications: [],
            education: data.education || '',
            teaching_methodology: data.teaching_methodology || 'Socratic problem deconstruction, personalized homework review, and curriculum alignment.',
            rating: Number(data.rating) || 5.0,
            review_count: Number(data.review_count) || 0,
            total_hours_taught: Number(data.total_hours_taught) || 0,
            city: data.city || 'US',
            country: data.country || 'US',
            subjects: [],
            grades: [],
            languages: ['English'],
            availability: [
              { day: 'Monday', slots: ['05:00 PM EST', '06:30 PM EST'] },
              { day: 'Wednesday', slots: ['05:00 PM EST', '07:00 PM EST'] },
              { day: 'Saturday', slots: ['10:00 AM EST', '01:00 PM EST'] },
            ],
          };
          setTutor(profile);
          setSelectedDay('Monday');
        } else {
          // Fallback: check /api/tutors to find educator by ID
          const res = await fetch('/api/tutors', { cache: 'no-store' });
          if (res.ok) {
            const json = await res.json();
            const matched = (json.tutors || []).find((t: any) => t.id === tutorId || t.user_id === tutorId);
            if (matched) {
              setTutor(matched);
              setSelectedDay('Monday');
              setLoading(false);
              return;
            }
          }
          setTutor(null);
        }
      } catch (err) {
        setTutor(null);
      } finally {
        setLoading(false);
      }
    }

    async function loadReviews() {
      if (!tutorId) return;
      try {
        const res = await fetch(`/api/reviews?tutorId=${tutorId}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.reviews)) {
            setReviews(json.reviews);
            if (json.stats) {
              setReviewStats(json.stats);
              setTutor((prev) => prev ? {
                ...prev,
                rating: json.stats.averageRating || prev.rating,
                review_count: json.stats.total || prev.review_count,
              } : null);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      }
    }

    loadTutor();
    loadReviews();
  }, [tutorId]);

  if (loading) {
    return (
      <div className="bg-offwhite dark:bg-[#0A0F1D] min-h-[60vh] flex items-center justify-center py-16 px-4 transition-colors duration-200">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-navy-800 dark:border-emerald-400 border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-charcoal-500 dark:text-slate-400">Loading educator profile...</p>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="bg-offwhite dark:bg-[#0A0F1D] min-h-[60vh] flex items-center justify-center py-16 px-4 transition-colors duration-200">
        <div className="bg-white dark:bg-[#111827] p-8 max-w-md w-full rounded-2xl border border-gray-200 dark:border-[#1E293B] text-center shadow-card">
          <ShieldCheck className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-navy-800 dark:text-white mb-1">Educator Profile Not Found</h1>
          <p className="text-xs text-charcoal-600 dark:text-slate-300 mb-6">
            This educator profile is not active, currently undergoing compliance review, or does not exist.
          </p>
          <Link
            href="/tutors"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-800 hover:bg-navy-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Educator Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const activeAvailability = tutor.availability?.find((a) => a.day === selectedDay);

  return (
    <div className="bg-offwhite dark:bg-[#0A0F1D] min-h-screen py-8 lg:py-12 border-b border-gray-200 dark:border-[#1E293B] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-charcoal-500 dark:text-slate-400">
          <Link href="/" className="hover:text-navy-800 dark:hover:text-white">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/tutors" className="hover:text-navy-800 dark:hover:text-white">Find a Tutor</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-navy-800 dark:text-slate-200">{tutor.full_name}</span>
        </div>

        {/* Profile Grid: Main Content (8 cols) + Sticky Booking Card (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Info Column */}
          <div className="lg:col-span-8">
            <FadeIn direction="up" delay={0.05} duration={0.5} className="space-y-6">
              
              {/* Header Card */}
              <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-[#1E293B] shadow-subtle hover:shadow-card transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#162032] border border-gray-200 dark:border-[#1E293B] shadow-subtle flex-shrink-0">
                  <Image
                    src={tutor.avatar_url}
                    alt={tutor.full_name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                    priority
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-navy-800 dark:text-white">
                      {tutor.full_name}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 dark:text-emerald-300 bg-accent-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-accent-200 dark:border-emerald-800/60">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent-500 dark:text-emerald-400" />
                      <span>Verified Educator</span>
                    </span>
                  </div>

                  <p className="text-sm font-medium text-charcoal-600 dark:text-slate-300 mb-3">
                    {tutor.headline}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-600 dark:text-slate-300 mb-4">
                    <div className="flex items-center gap-1 font-bold text-navy-900 dark:text-white">
                      {tutor.review_count > 0 ? (
                        <>
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{tutor.rating.toFixed(2)}</span>
                          <span className="font-normal text-charcoal-400 dark:text-slate-400">({tutor.review_count} reviews)</span>
                        </>
                      ) : (
                        <span className="text-[11px] text-accent-700 dark:text-emerald-300 bg-accent-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-semibold border border-accent-200 dark:border-emerald-800/60">
                          New Verified Educator
                        </span>
                      )}
                    </div>
                    {tutor.total_hours_taught > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-charcoal-400 dark:text-slate-400" />
                          <span>{tutor.total_hours_taught}+ hours taught</span>
                        </div>
                      </>
                    )}
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-charcoal-400 dark:text-slate-400" />
                      <span>{tutor.city}, {tutor.country}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {tutor.subjects.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded bg-softblue-100 dark:bg-[#162032] text-navy-800 dark:text-emerald-400 text-xs font-semibold border border-softblue-200 dark:border-[#2D3B4F]"
                      >
                        {s}
                      </span>
                    ))}
                    {tutor.languages.map((l) => (
                      <span
                        key={l}
                        className="px-2.5 py-1 rounded bg-gray-50 dark:bg-[#162032] text-charcoal-600 dark:text-slate-300 text-xs font-medium border border-gray-200 dark:border-[#2D3B4F]"
                      >
                        Speaks {l}
                      </span>
                    ))}
                  </div>

                </div>

              </div>
            </div>

            {/* Biography & Teaching Methodology */}
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-[#1E293B] shadow-subtle space-y-6">
              <div>
                <h2 className="text-base font-bold text-navy-800 dark:text-white mb-2">
                  About {tutor.full_name}
                </h2>
                <p className="text-sm text-charcoal-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {tutor.bio || 'Accredited educator specialized in tailored curriculum instruction.'}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-[#1E293B]">
                <h2 className="text-base font-bold text-navy-800 dark:text-white mb-2">
                  Teaching Methodology
                </h2>
                <p className="text-sm text-charcoal-700 dark:text-slate-300 leading-relaxed">
                  {tutor.teaching_methodology}
                </p>
              </div>

              {/* Education & Verified Credentials */}
              {tutor.education && (
                <div className="pt-6 border-t border-gray-100 dark:border-[#1E293B]">
                  <h2 className="text-base font-bold text-navy-800 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-accent-500 dark:text-emerald-400" />
                    <span>Verified Qualifications & Degrees</span>
                  </h2>
                  <div className="p-3 bg-gray-50 dark:bg-[#162032] rounded-lg border border-gray-200 dark:border-[#2D3B4F] text-xs">
                    <span className="font-bold text-navy-800 dark:text-white block">{tutor.education}</span>
                    <span className="text-charcoal-500 dark:text-slate-400">Degree verified by Classly Compliance Team</span>
                  </div>
                </div>
              )}
            </div>

            {/* Student Reviews Section */}
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-[#1E293B] shadow-subtle space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-[#1E293B]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-navy-800 dark:text-white">
                      Student & Parent Reviews
                    </h2>
                    {reviewStats.total > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/60">
                        {reviewStats.total} Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-500 dark:text-slate-400 mt-0.5">
                    100% authentic feedback from verified 1-on-1 lessons on Classly
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 px-3 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-extrabold text-navy-900 dark:text-amber-300">
                      {reviewStats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-charcoal-500 dark:text-slate-400">
                      ({reviewStats.total})
                    </span>
                  </div>
                </div>
              </div>

              {reviews.length > 0 ? (
                <>
                  {/* Rating Breakdown Dashboard */}
                  <div className="p-5 bg-gray-50/70 dark:bg-[#162032]/60 rounded-xl border border-gray-200/80 dark:border-[#1E293B] flex flex-col md:flex-row items-center gap-6">
                    {/* Big Score Block */}
                    <div className="text-center md:border-r border-gray-200 dark:border-[#2D3B4F] md:pr-8 min-w-[140px]">
                      <div className="text-4xl font-extrabold text-navy-800 dark:text-white">
                        {reviewStats.averageRating.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center gap-1 my-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= Math.round(reviewStats.averageRating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-charcoal-500 dark:text-slate-400">
                        Based on {reviewStats.total} lesson{reviewStats.total === 1 ? '' : 's'}
                      </p>
                    </div>

                    {/* Distribution Bars */}
                    <div className="flex-1 w-full space-y-1.5 text-xs">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = reviewStats.distribution[stars] || 0;
                        const pct = reviewStats.total > 0 ? Math.round((count / reviewStats.total) * 100) : 0;
                        return (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="w-12 text-[11px] font-semibold text-charcoal-600 dark:text-slate-300 flex items-center gap-0.5">
                              <span>{stars}</span>
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-navy-950 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-9 text-right text-[11px] text-charcoal-400 dark:text-slate-400 font-mono">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review Cards */}
                  <div className="space-y-4 pt-2">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="p-5 rounded-xl border border-gray-100 dark:border-[#1E293B] bg-white dark:bg-[#111827] shadow-xs hover:border-gray-300 dark:hover:border-slate-700 transition"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-navy-800 dark:bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                              {r.student_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-navy-800 dark:text-white">
                                  {r.student_name}
                                </h4>
                                <span className="text-[10px] font-semibold text-accent-700 dark:text-emerald-400 bg-accent-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-accent-200 dark:border-emerald-800/60">
                                  {r.student_grade || 'Student'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-charcoal-400 dark:text-slate-400 mt-0.5">
                                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Verified Lesson</span>
                                </span>
                                <span>•</span>
                                <span>{r.date}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Subject Badge & Praise Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-[#162032] text-navy-800 dark:text-slate-300 text-[10px] font-semibold border border-gray-200 dark:border-[#2D3B4F]">
                            {r.subject}
                          </span>
                          {r.tags && r.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-full bg-softblue-50 dark:bg-[#162032] text-navy-800 dark:text-emerald-300 text-[10px] font-medium border border-blue-100 dark:border-[#2D3B4F]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Written feedback */}
                        {r.comment && (
                          <p className="text-xs text-charcoal-700 dark:text-slate-300 leading-relaxed">
                            "{r.comment}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-charcoal-500 dark:text-slate-400 bg-gray-50/50 dark:bg-[#162032]/40 rounded-xl border border-dashed border-gray-200 dark:border-[#2D3B4F]">
                  <MessageSquare className="w-8 h-8 text-gray-400 dark:text-slate-500 mx-auto mb-2 opacity-60" />
                  <h4 className="font-bold text-sm text-navy-800 dark:text-white mb-1">
                    No Reviews Yet for this Educator
                  </h4>
                  <p className="max-w-md mx-auto leading-relaxed">
                    Reviews on Classly are 100% verified — they can only be submitted by students who have booked and attended a live lesson with {tutor.full_name}.
                  </p>
                </div>
              )}
            </div>

            </FadeIn>
          </div>

          {/* Sticky Booking Sidebar (4 cols) */}
          <div className="lg:col-span-4 sticky top-24">
            <FadeIn direction="left" delay={0.15} duration={0.55} className="space-y-4">
              {(() => {
                const packagePricing = calculatePackagePricing(tutor.hourly_rate, selectedPackage);
                return (
                  <div className="bg-white dark:bg-[#111827] p-6 rounded-xl border border-gray-200 dark:border-[#1E293B] shadow-lift hover:shadow-lift-lg transition-shadow duration-300">
                    
                    {/* Hourly rate display */}
                    <div className="pb-4 mb-4 border-b border-gray-100 dark:border-[#1E293B] flex items-baseline justify-between">
                      <div>
                        {selectedPackage === 1 ? (
                          <>
                            <span className="text-3xl font-extrabold text-navy-800 dark:text-white">${tutor.hourly_rate}</span>
                            <span className="text-xs text-charcoal-500 dark:text-slate-400 ml-1">/ hour</span>
                          </>
                        ) : (
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-extrabold text-navy-800 dark:text-white">${packagePricing.effectiveHourlyRate}</span>
                              <span className="text-xs text-charcoal-500 dark:text-slate-400">/ lesson</span>
                              <span className="text-sm line-through text-charcoal-400 dark:text-slate-500">${tutor.hourly_rate}</span>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              Save ${packagePricing.totalSaved} on {selectedPackage} lessons
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-accent-700 dark:text-emerald-300 bg-accent-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-accent-200 dark:border-emerald-800/60">
                          100% money-back guarantee
                        </span>
                      </div>
                    </div>

                    {/* Lesson Package Tier Selector */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider">
                          Package Bundles
                        </label>
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                          Up to 15% off
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 dark:bg-[#162032] rounded-lg">
                        {LESSON_PACKAGES.map((pkg) => {
                          const isSelected = selectedPackage === pkg.tier;
                          return (
                            <button
                              key={pkg.tier}
                              type="button"
                              onClick={() => setSelectedPackage(pkg.tier)}
                              className={`p-2 rounded-md text-left transition flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-white dark:bg-[#1C283F] text-navy-900 dark:text-white shadow-subtle border border-navy-800/20 dark:border-emerald-500/50'
                                  : 'text-charcoal-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs">{pkg.tier === 1 ? '1 Lesson' : `${pkg.tier} Lessons`}</span>
                                {pkg.discountPercent > 0 && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                    -{pkg.discountPercent}%
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-charcoal-400 dark:text-slate-400 mt-0.5">
                                {pkg.tier === 1 ? 'Single session' : `$${calculatePackagePricing(tutor.hourly_rate, pkg.tier).effectiveHourlyRate}/hr`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Booking Mode Selector: 1-on-1 */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Format
                      </label>
                      <div className="p-1 bg-gray-100 dark:bg-[#162032] rounded-lg text-xs font-semibold">
                        <div className="py-1.5 text-center bg-white dark:bg-[#1C283F] text-navy-800 dark:text-white rounded-md shadow-subtle">
                          1-on-1 Private Live Instruction
                        </div>
                      </div>
                    </div>

                    {/* Availability Day Picker */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Select First Lesson Day (US Eastern)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {tutor.availability?.map((a) => (
                          <button
                            key={a.day}
                            type="button"
                            onClick={() => setSelectedDay(a.day)}
                            className={`px-3 py-1.5 rounded text-xs font-medium border transition ${
                              selectedDay === a.day
                                ? 'bg-navy-800 dark:bg-emerald-600 text-white border-navy-800 dark:border-emerald-600'
                                : 'bg-gray-50 dark:bg-[#162032] text-charcoal-700 dark:text-slate-300 border-gray-200 dark:border-[#2D3B4F] hover:bg-gray-100 dark:hover:bg-[#1E293B]'
                            }`}
                          >
                            {a.day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Available Time Slots */}
                    <div className="mb-5">
                      <label className="block text-xs font-semibold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Available Time Slots
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {activeAvailability?.slots.map((slot) => (
                          <div
                            key={slot}
                            className="p-2 text-center rounded bg-softblue-50 dark:bg-[#162032] border border-softblue-200 dark:border-[#2D3B4F] text-navy-800 dark:text-emerald-400 font-medium"
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-charcoal-400 dark:text-slate-400">
                        Times auto-adjust to your local timezone during checkout.
                      </p>
                    </div>

                    {/* Primary CTA */}
                    <Link
                      href={`/booking/${tutor.id}?format=one_on_one&day=${encodeURIComponent(selectedDay)}${selectedPackage > 1 ? `&package=${selectedPackage}` : ''}`}
                      className="w-full block text-center py-3 bg-navy-800 hover:bg-navy-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-subtle transition"
                    >
                      {selectedPackage === 1 
                        ? 'Book 1-on-1 Lesson' 
                        : `Book ${selectedPackage}-Lesson Bundle • $${packagePricing.discountedLessonTotal}`}
                    </Link>

                    {/* Referral Promo Teaser */}
                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5 font-medium">
                        <Gift className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>Have a friend referral? Enter it at checkout to get <strong>$20 off</strong></span>
                      </p>
                    </div>

                    {/* Safety & Guarantee Points */}
                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#1E293B] space-y-2 text-[11px] text-charcoal-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-accent-500 dark:text-emerald-400 flex-shrink-0" />
                        <span>Free cancellation up to 24 hours in advance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-accent-500 dark:text-emerald-400 flex-shrink-0" />
                        <span>Secure browser-based classroom</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-accent-500 dark:text-emerald-400 flex-shrink-0" />
                        <span>Direct parent monitoring & attendance records</span>
                      </div>
                    </div>

                  </div>
                );
              })()}
            </FadeIn>
          </div>

        </div>

      </div>
    </div>
  );
}
