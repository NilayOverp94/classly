'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  Video,
  Lock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TeacherProfile } from '@/lib/types';
import { AlertModal } from '@/components/ui/AlertModal';
import { FadeIn } from '@/components/ui/MotionComponents';

function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tutorId = params?.id as string;
  const initialFormat = searchParams.get('format') || 'one_on_one';
  const initialDay = searchParams.get('day') || 'Monday';

  const [tutor, setTutor] = useState<TeacherProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Booking selections
  const [selectedFormat, setSelectedFormat] = useState<string>(initialFormat);
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-20');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('05:00 PM EST');
  const [userTimezone, setUserTimezone] = useState<string>('America/New_York');
  const [studentNotes, setStudentNotes] = useState<string>('');
  
  // Payment state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchAuthUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }
    }
    fetchAuthUser();
  }, []);

  useEffect(() => {
    async function loadTutor() {
      if (!tutorId) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch from /api/tutors first (which queries Supabase auth and returns approved educators)
        const res = await fetch('/api/tutors', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const matched = (json.tutors || []).find(
            (t: any) => t.id === tutorId || t.user_id === tutorId
          );
          if (matched) {
            if (!matched.availability || matched.availability.length === 0) {
              matched.availability = [
                { day: 'Monday', slots: ['05:00 PM EST', '06:30 PM EST'] },
                { day: 'Wednesday', slots: ['05:00 PM EST', '07:00 PM EST'] },
                { day: 'Saturday', slots: ['10:00 AM EST', '01:00 PM EST'] },
              ];
            }
            setTutor(matched);
            setLoading(false);
            return;
          }
        }

        // 2. Fallback to teacher_profiles table if present
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
            teaching_methodology: '',
            rating: Number(data.rating) || 5.0,
            review_count: Number(data.review_count) || 0,
            total_hours_taught: Number(data.total_hours_taught) || 0,
            city: data.city || 'US',
            country: data.country || 'US',
            subjects: ['Mathematics'],
            grades: [],
            languages: ['English'],
            availability: [
              { day: 'Monday', slots: ['05:00 PM EST', '06:30 PM EST'] },
              { day: 'Wednesday', slots: ['05:00 PM EST', '07:00 PM EST'] },
              { day: 'Saturday', slots: ['10:00 AM EST', '01:00 PM EST'] },
            ],
          };
          setTutor(profile);
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
      <div className="bg-offwhite dark:bg-[#0A0F1D] min-h-[60vh] flex items-center justify-center py-16 px-4 transition-colors duration-200">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-navy-800 dark:border-emerald-400 border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-charcoal-500 dark:text-slate-400">Loading booking interface...</p>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="bg-offwhite dark:bg-[#0A0F1D] min-h-[60vh] flex items-center justify-center py-16 px-4 transition-colors duration-200">
        <div className="bg-white dark:bg-[#111827] p-8 max-w-md w-full rounded-2xl border border-gray-200 dark:border-[#1E293B] text-center shadow-card dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <ShieldCheck className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-navy-800 dark:text-white mb-1">Educator Not Found</h1>
          <p className="text-xs text-charcoal-600 dark:text-slate-300 mb-6">
            The educator you are attempting to book is not available or does not exist.
          </p>
          <Link
            href="/tutors"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-800 hover:bg-navy-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Educator Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculations
  const hourlyRate = tutor.hourly_rate;
  const platformFee = 4.50; // Platform technology & classroom fee
  const totalAmount = hourlyRate + platformFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutor) return;
    setIsProcessing(true);

    try {
      const studentName = 
        currentUser?.user_metadata?.student_name ||
        currentUser?.user_metadata?.full_name ||
        currentUser?.user_metadata?.name ||
        currentUser?.email?.split('@')[0] ||
        'Student / Parent';

      const studentEmail = currentUser?.email || 'student@classly.com';
      const studentId = currentUser?.id || '';

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: tutor.id,
          format: selectedFormat,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          studentNotes: studentNotes.trim(),
          studentName,
          studentEmail,
          studentId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete booking reservation.');
      }

      setConfirmedBookingId(data.booking.id);
      setBookingConfirmed(true);
    } catch (err: any) {
      console.error('Booking checkout error:', err);
      setCheckoutError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-offwhite dark:bg-[#0A0F1D] min-h-screen py-8 lg:py-12 border-b border-gray-200 dark:border-[#1E293B] transition-colors duration-200">
      <FadeIn className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/tutors/${tutor.id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-600 dark:text-slate-400 hover:text-navy-800 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {tutor.full_name}'s Profile</span>
          </Link>
        </div>

        {bookingConfirmed ? (
          /* Confirmation Screen */
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-[#1E293B] shadow-lift p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-accent-50 dark:bg-emerald-950/40 text-accent-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-accent-200 dark:border-emerald-800/60">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-navy-800 dark:text-white mb-2">
              Lesson Confirmed!
            </h1>
            <p className="text-xs text-charcoal-600 dark:text-slate-300 max-w-md mx-auto mb-8">
              Your session with <strong>{tutor.full_name}</strong> is scheduled and paid. A confirmation email has been dispatched to your parent inbox.
            </p>

            {/* Session Card */}
            <div className="bg-offwhite/80 dark:bg-[#162032] p-6 rounded-xl border border-gray-200 dark:border-[#2D3B4F] text-left max-w-lg mx-auto mb-8 space-y-3 text-xs">
              <div className="flex justify-between pb-3 border-b border-gray-200 dark:border-[#2D3B4F]">
                <span className="text-charcoal-500 dark:text-slate-400">Booking Reference</span>
                <span className="font-bold text-navy-800 dark:text-white">#{confirmedBookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 dark:text-slate-400">Educator</span>
                <span className="font-bold text-navy-800 dark:text-white">{tutor.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 dark:text-slate-400">Date & Time</span>
                <span className="font-bold text-navy-800 dark:text-white">{selectedDate} at {selectedTimeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 dark:text-slate-400">Duration</span>
                <span className="font-bold text-navy-800 dark:text-white">60 Minutes</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-[#2D3B4F]">
                <span className="text-charcoal-500 dark:text-slate-400">Amount Paid</span>
                <span className="font-bold text-navy-800 dark:text-emerald-400">${totalAmount.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/classroom/room-${confirmedBookingId}?subject=${encodeURIComponent(tutor.subjects?.[0] || 'Mathematics')}`}
                className="w-full sm:w-auto px-8 py-3 bg-navy-800 hover:bg-navy-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-subtle transition flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Enter Live Classroom</span>
              </Link>
              <Link
                href="/dashboard/student"
                className="w-full sm:w-auto px-6 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-[#162032] dark:hover:bg-[#1E293B] text-charcoal-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-gray-200 dark:border-[#2D3B4F] transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Step-by-Step Booking Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-[#1E293B] shadow-subtle space-y-6">
              <div>
                <h1 className="text-xl font-bold text-navy-800 dark:text-white">
                  Schedule Lesson & Checkout
                </h1>
                <p className="text-xs text-charcoal-500 dark:text-slate-400 mt-1">
                  Select your preferred lesson time and confirm booking details.
                </p>
              </div>

              <form onSubmit={handleCheckout} className="space-y-5 text-xs">
                
                {/* 1. Format Selection */}
                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    1. Select Teaching Format
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-[#162032] rounded-lg border border-gray-200 dark:border-[#2D3B4F]">
                    <span className="font-bold text-navy-800 dark:text-white block">1-on-1 Private Tutoring</span>
                    <span className="text-charcoal-500 dark:text-slate-400 text-[11px]">Dedicated 60-minute interactive live video lesson with dual whiteboard</span>
                  </div>
                </div>

                {/* 2. Date Selection */}
                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    2. Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#162032] border border-gray-200 dark:border-[#2D3B4F] rounded-lg px-3 py-2.5 text-xs font-medium text-navy-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#1C283F]"
                  />
                </div>

                {/* 3. Time Slot */}
                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    3. Select Time Slot
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#162032] border border-gray-200 dark:border-[#2D3B4F] rounded-lg px-3 py-2.5 text-xs font-medium text-navy-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#1C283F]"
                  >
                    <option value="05:00 PM EST">05:00 PM EST</option>
                    <option value="06:30 PM EST">06:30 PM EST</option>
                    <option value="08:00 PM EST">08:00 PM EST</option>
                  </select>
                </div>

                {/* 4. Parent / Student Notes */}
                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    4. Student Goals or Topics for this Lesson (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Preparing for upcoming AP test, homework assistance, specific textbook chapters..."
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#162032] border border-gray-200 dark:border-[#2D3B4F] rounded-lg p-3 text-xs text-navy-800 dark:text-white placeholder-charcoal-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#1C283F]"
                  />
                </div>

                {/* Submit / Pay CTA */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-navy-800 hover:bg-navy-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-subtle transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <span>Processing Payment Authorization...</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Authorize Payment (${totalAmount.toFixed(2)} USD)</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-charcoal-400 dark:text-slate-400 text-center">
                  Protected by 100% money-back satisfaction guarantee on your first lesson.
                </p>

              </form>
            </div>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#111827] p-6 rounded-xl border border-gray-200 dark:border-[#1E293B] shadow-subtle space-y-4 text-xs">
              <h2 className="font-bold text-navy-800 dark:text-white text-sm pb-3 border-b border-gray-100 dark:border-[#1E293B]">
                Booking Summary
              </h2>

              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-[#1E293B]">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-[#162032] flex-shrink-0">
                  <Image
                    src={tutor.avatar_url}
                    alt={tutor.full_name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                </div>
                <div>
                  <div className="font-bold text-navy-800 dark:text-white">{tutor.full_name}</div>
                  <div className="text-[11px] text-charcoal-500 dark:text-slate-400">{tutor.headline}</div>
                </div>
              </div>

              <div className="space-y-2 text-charcoal-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Lesson Rate (60 mins)</span>
                  <span className="font-bold text-navy-800 dark:text-white">${hourlyRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform & Classroom Tech Fee</span>
                  <span className="font-bold text-navy-800 dark:text-white">${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-[#1E293B] text-sm font-bold text-navy-800 dark:text-emerald-400">
                  <span>Total Due Today</span>
                  <span>${totalAmount.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#162032] rounded-lg border border-gray-200 dark:border-[#2D3B4F] space-y-1.5 text-[11px] text-charcoal-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-semibold text-accent-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-500 dark:text-emerald-400" />
                  <span>Classly Parent Protection</span>
                </div>
                <div>• Zero recurring subscription charges</div>
                <div>• Free cancellation up to 24 hours prior</div>
              </div>

            </div>

          </div>
        )}

      </FadeIn>

      {/* Checkout Error Alert Modal */}
      <AlertModal
        isOpen={!!checkoutError}
        theme="light"
        variant="error"
        title="Reservation Incomplete"
        message={checkoutError || ''}
        buttonText="Close"
        onClose={() => setCheckoutError(null)}
      />

    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-charcoal-500 dark:text-slate-400">Loading booking...</div>}>
      <BookingContent />
    </Suspense>
  );
}
