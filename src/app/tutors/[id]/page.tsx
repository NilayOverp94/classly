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
  BookOpen
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TeacherProfile } from '@/lib/types';

export default function TutorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const tutorId = params?.id as string;

  const [tutor, setTutor] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingMode, setBookingMode] = useState<'one_on_one' | 'group'>('one_on_one');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

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
          .eq('id', tutorId)
          .single();

        if (!error && data) {
          const rawProfiles: any = data.profiles;
          const userProfile = Array.isArray(rawProfiles) ? rawProfiles[0] : rawProfiles;
          const profile: TeacherProfile = {
            id: data.id,
            user_id: data.user_id,
            full_name: userProfile?.full_name || 'Verified Educator',
            avatar_url: userProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
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
          setTutor(null);
        }
      } catch (err) {
        setTutor(null);
      } finally {
        setLoading(false);
      }
    }

    loadTutor();
  }, [tutorId]);

  if (loading) {
    return (
      <div className="bg-offwhite min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-navy-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-charcoal-500">Loading educator profile...</p>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="bg-offwhite min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="bg-white p-8 max-w-md w-full rounded-2xl border border-gray-200 text-center shadow-card">
          <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-navy-800 mb-1">Educator Profile Not Found</h1>
          <p className="text-xs text-charcoal-600 mb-6">
            This educator profile is not active, currently undergoing compliance review, or does not exist.
          </p>
          <Link
            href="/tutors"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-800 text-white rounded-lg text-xs font-bold hover:bg-navy-900 transition"
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
    <div className="bg-offwhite min-h-screen py-8 lg:py-12 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-charcoal-500">
          <Link href="/" className="hover:text-navy-800">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/tutors" className="hover:text-navy-800">Find a Tutor</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-navy-800">{tutor.full_name}</span>
        </div>

        {/* Profile Grid: Main Content (8 cols) + Sticky Booking Card (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-subtle">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-subtle flex-shrink-0">
                  <Image
                    src={tutor.avatar_url}
                    alt={tutor.full_name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-navy-800">
                      {tutor.full_name}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 bg-accent-50 px-2.5 py-0.5 rounded-full border border-accent-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
                      <span>Verified Educator</span>
                    </span>
                  </div>

                  <p className="text-sm font-medium text-charcoal-600 mb-3">
                    {tutor.headline}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-600 mb-4">
                    <div className="flex items-center gap-1 font-bold text-navy-900">
                      {tutor.review_count > 0 ? (
                        <>
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{tutor.rating.toFixed(2)}</span>
                          <span className="font-normal text-charcoal-400">({tutor.review_count} reviews)</span>
                        </>
                      ) : (
                        <span className="text-[11px] text-accent-700 bg-accent-50 px-2 py-0.5 rounded font-semibold border border-accent-200">
                          New Verified Educator
                        </span>
                      )}
                    </div>
                    {tutor.total_hours_taught > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-charcoal-400" />
                          <span>{tutor.total_hours_taught}+ hours taught</span>
                        </div>
                      </>
                    )}
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-charcoal-400" />
                      <span>{tutor.city}, {tutor.country}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {tutor.subjects.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded bg-softblue-100 text-navy-800 text-xs font-semibold border border-softblue-200"
                      >
                        {s}
                      </span>
                    ))}
                    {tutor.languages.map((l) => (
                      <span
                        key={l}
                        className="px-2.5 py-1 rounded bg-gray-50 text-charcoal-600 text-xs font-medium border border-gray-200"
                      >
                        Speaks {l}
                      </span>
                    ))}
                  </div>

                </div>

              </div>
            </div>

            {/* Biography & Teaching Methodology */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-subtle space-y-6">
              <div>
                <h2 className="text-base font-bold text-navy-800 mb-2">
                  About {tutor.full_name}
                </h2>
                <p className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
                  {tutor.bio || 'Accredited educator specialized in tailored curriculum instruction.'}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h2 className="text-base font-bold text-navy-800 mb-2">
                  Teaching Methodology
                </h2>
                <p className="text-sm text-charcoal-700 leading-relaxed">
                  {tutor.teaching_methodology}
                </p>
              </div>

              {/* Education & Verified Credentials */}
              {tutor.education && (
                <div className="pt-6 border-t border-gray-100">
                  <h2 className="text-base font-bold text-navy-800 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-accent-500" />
                    <span>Verified Qualifications & Degrees</span>
                  </h2>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                    <span className="font-bold text-navy-800 block">{tutor.education}</span>
                    <span className="text-charcoal-500">Degree verified by Classly Compliance Team</span>
                  </div>
                </div>
              )}
            </div>

            {/* Student Reviews Section */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-subtle">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-navy-800">
                    Student & Parent Reviews
                  </h2>
                  <p className="text-xs text-charcoal-500">
                    Feedback from verified lessons booked through Classly
                  </p>
                </div>
              </div>

              <div className="p-8 text-center text-xs text-charcoal-500 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                No student reviews submitted yet. Reviews appear automatically after students complete verified lessons.
              </div>
            </div>

          </div>

          {/* Sticky Booking Sidebar (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lift">
              
              {/* Hourly rate display */}
              <div className="pb-4 mb-4 border-b border-gray-100 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-navy-800">${tutor.hourly_rate}</span>
                  <span className="text-xs text-charcoal-500 ml-1">/ hour</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                    100% money-back guarantee
                  </span>
                </div>
              </div>

              {/* Booking Mode Selector: 1-on-1 */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                  Select Format
                </label>
                <div className="p-1 bg-gray-100 rounded-lg text-xs font-semibold">
                  <div className="py-2 text-center bg-white text-navy-800 rounded-md shadow-subtle">
                    1-on-1 Private Lesson
                  </div>
                </div>
              </div>

              {/* Availability Day Picker */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                  Available Days (US Eastern Time)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tutor.availability?.map((a) => (
                    <button
                      key={a.day}
                      type="button"
                      onClick={() => setSelectedDay(a.day)}
                      className={`px-3 py-1.5 rounded text-xs font-medium border transition ${
                        selectedDay === a.day
                          ? 'bg-navy-800 text-white border-navy-800'
                          : 'bg-gray-50 text-charcoal-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {a.day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Time Slots */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                  Available Time Slots
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {activeAvailability?.slots.map((slot) => (
                    <div
                      key={slot}
                      className="p-2 text-center rounded bg-softblue-50 border border-softblue-200 text-navy-800 font-medium"
                    >
                      {slot}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-charcoal-400">
                  Times auto-adjust to your local timezone during checkout.
                </p>
              </div>

              {/* Primary CTA */}
              <Link
                href={`/booking/${tutor.id}?format=one_on_one&day=${encodeURIComponent(selectedDay)}`}
                className="w-full block text-center py-3 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-sm font-bold shadow-subtle transition"
              >
                Book 1-on-1 Lesson
              </Link>

              {/* Safety & Guarantee Points */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-[11px] text-charcoal-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                  <span>Free cancellation up to 24 hours in advance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                  <span>Secure browser-based classroom</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                  <span>Direct parent monitoring & attendance records</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
