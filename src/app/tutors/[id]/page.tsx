'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, 
  ShieldCheck, 
  Award, 
  BookOpen, 
  Clock, 
  MapPin, 
  Calendar, 
  Video, 
  CheckCircle, 
  ArrowLeft,
  Users,
  ChevronRight,
  MessageSquare,
  Play
} from 'lucide-react';
import { mockTutors } from '@/lib/data/mockTutors';
import { mockReviews, mockGroupClasses } from '@/lib/data/mockBookings';

export default function TutorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const tutorId = (params?.id as string) || 'tutor-1';

  const tutor = mockTutors.find((t) => t.id === tutorId) || mockTutors[0];
  const reviews = mockReviews[tutor.id] || mockReviews['tutor-1'] || [];
  const groupClasses = mockGroupClasses.filter((c) => c.teacher_id === tutor.id);

  const [bookingMode, setBookingMode] = useState<'one_on_one' | 'group'>('one_on_one');
  const [selectedDay, setSelectedDay] = useState<string>(tutor.availability?.[0]?.day || 'Monday');

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
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{tutor.rating.toFixed(2)}</span>
                      <span className="font-normal text-charcoal-400">({tutor.review_count} reviews)</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-charcoal-400" />
                      <span>{tutor.total_hours_taught}+ hours taught</span>
                    </div>
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

            {/* Video Introduction Placeholder */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-subtle">
              <h2 className="text-base font-bold text-navy-800 mb-3 flex items-center gap-2">
                <Video className="w-4 h-4 text-navy-800" />
                <span>Video Introduction</span>
              </h2>
              <div className="relative aspect-video w-full rounded-lg bg-navy-950 flex flex-col items-center justify-center text-white overflow-hidden border border-gray-200 shadow-inner group cursor-pointer">
                <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${tutor.avatar_url})` }}></div>
                <div className="relative z-10 w-14 h-14 rounded-full bg-white/90 text-navy-800 flex items-center justify-center transition-transform group-hover:scale-110 shadow-lift">
                  <Play className="w-6 h-6 fill-navy-800 ml-1" />
                </div>
                <div className="relative z-10 mt-3 text-xs font-semibold tracking-wide text-gray-200">
                  Watch {tutor.full_name.split(' ')[0]}'s 90-Second Introduction
                </div>
                <div className="absolute bottom-3 right-3 text-[11px] bg-black/60 px-2 py-0.5 rounded text-gray-300">
                  1:28
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
                  {tutor.bio}
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
              <div className="pt-6 border-t border-gray-100">
                <h2 className="text-base font-bold text-navy-800 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent-500" />
                  <span>Verified Qualifications & Degrees</span>
                </h2>
                <div className="space-y-2.5">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                    <span className="font-bold text-navy-800 block">{tutor.education}</span>
                    <span className="text-charcoal-500">Degree verified by Classly Compliance Team</span>
                  </div>
                  {tutor.qualifications.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-charcoal-700">
                      <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grades & Subjects breakdown */}
              <div className="pt-6 border-t border-gray-100">
                <h2 className="text-base font-bold text-navy-800 mb-3">
                  Curriculum & Grades Taught
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tutor.grades.map((grade) => (
                    <span
                      key={grade}
                      className="px-3 py-1 bg-softblue-50 text-navy-800 rounded-md text-xs font-semibold border border-softblue-200"
                    >
                      {grade}
                    </span>
                  ))}
                </div>
              </div>

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
                <div className="text-right">
                  <div className="flex items-center gap-1 text-base font-bold text-navy-800">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{tutor.rating.toFixed(2)}</span>
                  </div>
                  <span className="text-[11px] text-charcoal-400">Based on {tutor.review_count} ratings</span>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-gray-50/60 rounded-lg border border-gray-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-semibold text-xs text-navy-800">{rev.student_name}</div>
                      <div className="text-[11px] text-charcoal-400">{rev.date}</div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium text-charcoal-500">• {rev.subject}</span>
                    </div>
                    <p className="text-xs text-charcoal-700 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
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
                    Money-back guarantee
                  </span>
                </div>
              </div>

              {/* Booking Mode Selector: 1-on-1 vs Group Classes */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                  Select Format
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setBookingMode('one_on_one')}
                    className={`py-2 rounded-md transition ${
                      bookingMode === 'one_on_one'
                        ? 'bg-white text-navy-800 shadow-subtle'
                        : 'text-charcoal-600 hover:text-navy-800'
                    }`}
                  >
                    1-on-1 Private
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingMode('group')}
                    className={`py-2 rounded-md transition ${
                      bookingMode === 'group'
                        ? 'bg-white text-navy-800 shadow-subtle'
                        : 'text-charcoal-600 hover:text-navy-800'
                    }`}
                  >
                    Group Classes
                  </button>
                </div>
              </div>

              {bookingMode === 'one_on_one' ? (
                <>
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
                </>
              ) : (
                /* Group Classes Preview */
                <div className="space-y-3 mb-6">
                  {groupClasses.length > 0 ? (
                    groupClasses.map((gc) => (
                      <div key={gc.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                        <div className="font-bold text-navy-800 mb-1">{gc.title}</div>
                        <div className="text-[11px] text-charcoal-500 mb-2">
                          Max {gc.max_students} students • {gc.duration_minutes} mins
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="font-bold text-navy-800">${gc.price} / student</span>
                          <Link
                            href={`/booking/${tutor.id}?classId=${gc.id}&format=group`}
                            className="px-2.5 py-1 bg-accent-500 hover:bg-accent-600 text-white rounded font-semibold text-[11px]"
                          >
                            Enroll
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-charcoal-500">
                      No group classes currently scheduled. You can book a 1-on-1 private lesson above.
                    </div>
                  )}
                </div>
              )}

              {/* Safety & Guarantee Points */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-[11px] text-charcoal-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                  <span>Free cancellation up to 24 hours in advance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                  <span>Secure browser-based classroom (no software download)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                  <span>Direct parent monitoring & attendance records</span>
                </div>
              </div>

            </div>

            {/* Contact Tutor Note */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle text-xs text-center">
              <span className="text-charcoal-600">Have questions about syllabus or scheduling?</span>
              <Link
                href={`/contact?inquiry=tutor&tutorId=${tutor.id}`}
                className="mt-1 block font-semibold text-navy-800 hover:text-navy-900"
              >
                Send a question to {tutor.full_name}
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

