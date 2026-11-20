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
  Lock,
  Gift,
  Tag,
  Sparkles,
  Check,
  Percent,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TeacherProfile, PackageTier, StudentPrepaidPackage } from '@/lib/types';
import { AlertModal } from '@/components/ui/AlertModal';
import { FadeIn } from '@/components/ui/MotionComponents';
import { CalendarSyncDropdown } from '@/components/calendar/CalendarSyncDropdown';
import { PackageSelector } from '@/components/packages/PackageSelector';
import { calculatePackagePricing, LESSON_PACKAGES } from '@/lib/packages/lessonPackages';
import { REFERRAL_CREDIT_AMOUNT_USD } from '@/lib/referrals/referralService';

function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tutorId = params?.id as string;
  const initialFormat = searchParams.get('format') || 'one_on_one';
  const initialDay = searchParams.get('day') || 'Monday';
  const rawPackage = Number(searchParams.get('package'));
  const initialPackageTier: PackageTier = (rawPackage === 5 || rawPackage === 10 || rawPackage === 20) ? rawPackage : 1;
  const initialRefCode = searchParams.get('ref') || '';

  const [tutor, setTutor] = useState<TeacherProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Booking selections
  const [selectedFormat, setSelectedFormat] = useState<string>(initialFormat);
  const [selectedPackageTier, setSelectedPackageTier] = useState<PackageTier>(initialPackageTier);
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-20');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('05:00 PM EST');
  const [userTimezone, setUserTimezone] = useState<string>('America/New_York');
  const [studentNotes, setStudentNotes] = useState<string>('');
  
  // Referral & Promo Credit State
  const [referralCodeInput, setReferralCodeInput] = useState<string>(initialRefCode);
  const [appliedReferral, setAppliedReferral] = useState<{
    code: string;
    amount: number;
    referrerName: string;
    message: string;
  } | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Existing Prepaid Package Credit State
  const [matchingPrepaidPackage, setMatchingPrepaidPackage] = useState<StudentPrepaidPackage | null>(null);
  const [usePrepaidCredit, setUsePrepaidCredit] = useState(false);

  // Payment state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [confirmedPackageDetails, setConfirmedPackageDetails] = useState<any | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchAuthUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);

        // Check for existing prepaid packages for this educator
        const existingPackages: StudentPrepaidPackage[] = user.user_metadata?.prepaid_packages || [];
        const match = existingPackages.find(
          (p) => (p.teacherId === tutorId || p.teacherId === tutor?.user_id) && p.remainingLessons > 0
        );
        if (match) {
          setMatchingPrepaidPackage(match);
        }

        // If user already has earned referral credits in account, pre-apply
        const availableCredits = Number(user.user_metadata?.available_credits_usd) || 0;
        if (availableCredits >= 20 && !appliedReferral) {
          setAppliedReferral({
            code: 'ACCOUNT-CREDIT',
            amount: Math.min(availableCredits, 20),
            referrerName: 'Your Referral Rewards',
            message: `$20.00 referral credit from your account applied!`,
          });
        }
      }
    }
    fetchAuthUser();
  }, [tutorId, tutor?.user_id]);

  // Auto-validate initial referral code from URL query parameter
  useEffect(() => {
    if (initialRefCode && !appliedReferral) {
      handleApplyReferralCode(initialRefCode);
    }
  }, [initialRefCode]);

  const handleApplyReferralCode = async (codeToTest?: string) => {
    const code = (codeToTest || referralCodeInput).trim().toUpperCase();
    if (!code) {
      setCodeFeedback({ type: 'error', text: 'Please enter a referral or promo code.' });
      return;
    }

    setValidatingCode(true);
    setCodeFeedback(null);

    try {
      const res = await fetch(`/api/referrals?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (res.ok && data.valid) {
        setAppliedReferral({
          code,
          amount: data.creditAmount || REFERRAL_CREDIT_AMOUNT_USD,
          referrerName: data.referrerName || 'Parent Ambassador',
          message: data.message || `$${data.creditAmount || 20} welcome discount applied!`,
        });
        setCodeFeedback({
          type: 'success',
          text: `🎉 Code verified! $${data.creditAmount || 20} discount applied courtesy of ${data.referrerName || 'Classly Partner'}.`,
        });
      } else {
        setCodeFeedback({
          type: 'error',
          text: data.error || 'Invalid referral code. Please check spelling.',
        });
      }
    } catch (err) {
      setCodeFeedback({
        type: 'error',
        text: 'Could not verify code right now. Please try again.',
      });
    } finally {
      setValidatingCode(false);
    }
  };

  const handleRemoveReferral = () => {
    setAppliedReferral(null);
    setReferralCodeInput('');
    setCodeFeedback(null);
  };

  useEffect(() => {
    async function loadTutor() {
      if (!tutorId) {
        setLoading(false);
        return;
      }

      try {
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

  // Pricing Calculations with Packages and Referral Credits
  const hourlyRate = tutor.hourly_rate;
  const pricing = calculatePackagePricing(hourlyRate, selectedPackageTier);
  const referralDiscountUSD = appliedReferral ? Math.min(appliedReferral.amount, pricing.discountedLessonTotal) : 0;
  const platformFee = usePrepaidCredit ? 0 : 4.50;
  
  const finalTotalDue = usePrepaidCredit 
    ? 0 
    : Math.max(0, Math.round((pricing.discountedLessonTotal + platformFee - referralDiscountUSD) * 100) / 100);

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
          packageTier: usePrepaidCredit ? 1 : selectedPackageTier,
          appliedReferralCode: appliedReferral ? appliedReferral.code : '',
          referralDiscountUSD: usePrepaidCredit ? 0 : referralDiscountUSD,
          usingPrepaidCredit: usePrepaidCredit,
          packageIdToDeduct: matchingPrepaidPackage?.id || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete booking reservation.');
      }

      setConfirmedBookingId(data.booking.id);
      setConfirmedPackageDetails({
        tier: selectedPackageTier,
        isBundle: !usePrepaidCredit && selectedPackageTier > 1,
        usedCredit: usePrepaidCredit,
        remainingCredits: usePrepaidCredit 
          ? Math.max(0, (matchingPrepaidPackage?.remainingLessons || 1) - 1)
          : selectedPackageTier - 1,
      });
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
              {confirmedPackageDetails?.isBundle 
                ? `${confirmedPackageDetails.tier}-Lesson Bundle Confirmed!`
                : confirmedPackageDetails?.usedCredit 
                ? 'Lesson Booked with Prepaid Credit!' 
                : 'Lesson Confirmed!'}
            </h1>
            
            <p className="text-xs text-charcoal-600 dark:text-slate-300 max-w-md mx-auto mb-6">
              {confirmedPackageDetails?.isBundle ? (
                <>
                  Your first session with <strong>{tutor.full_name}</strong> is scheduled, and <strong>{confirmedPackageDetails.remainingCredits} prepaid lesson credits</strong> have been added to your student account for future scheduling.
                </>
              ) : confirmedPackageDetails?.usedCredit ? (
                <>
                  You redeemed 1 prepaid lesson credit. Your session with <strong>{tutor.full_name}</strong> is confirmed. You have <strong>{confirmedPackageDetails.remainingCredits} credits</strong> remaining.
                </>
              ) : (
                <>
                  Your session with <strong>{tutor.full_name}</strong> is scheduled and paid. A confirmation email has been dispatched to your parent inbox.
                </>
              )}
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
                <span className="text-charcoal-500 dark:text-slate-400">Lesson Format</span>
                <span className="font-bold text-navy-800 dark:text-white">
                  {confirmedPackageDetails?.isBundle ? `${confirmedPackageDetails.tier}-Lesson Prepaid Bundle` : '1-on-1 Private Lesson (60 mins)'}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-[#2D3B4F]">
                <span className="text-charcoal-500 dark:text-slate-400">Amount Charged</span>
                <span className="font-bold text-navy-800 dark:text-emerald-400">
                  {confirmedPackageDetails?.usedCredit ? '$0.00 (Prepaid Credit)' : `$${finalTotalDue.toFixed(2)} USD`}
                </span>
              </div>
            </div>

            {/* 1-Click Calendar Sync Button */}
            <div className="mb-6 flex justify-center">
              <CalendarSyncDropdown
                event={{
                  title: `${tutor.subjects?.[0] || 'Mathematics'} Tutoring with ${tutor.full_name}`,
                  subject: tutor.subjects?.[0] || 'Mathematics',
                  teacherName: tutor.full_name,
                  dateStr: selectedDate,
                  timeSlotStr: selectedTimeSlot,
                  durationMinutes: 60,
                  meetingUrl: `/classroom/room-${confirmedBookingId}?subject=${encodeURIComponent(tutor.subjects?.[0] || 'Mathematics')}`,
                  notes: studentNotes,
                }}
                variant="primary"
                label="Add Lesson to Calendar (Google / Apple / Outlook)"
              />
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
                  Choose a lesson bundle to lock in savings, pick your first time slot, and confirm.
                </p>
              </div>

              {/* Existing Prepaid Package Alert */}
              {matchingPrepaidPackage && (
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-start justify-between gap-3 shadow-subtle">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900 dark:text-emerald-300">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>You have {matchingPrepaidPackage.remainingLessons} Prepaid Credits with {tutor.full_name}</span>
                    </div>
                    <p className="text-[11px] text-charcoal-600 dark:text-slate-300 mt-0.5">
                      You can schedule this session using your existing prepaid credits with $0.00 due today.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUsePrepaidCredit(!usePrepaidCredit)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                      usePrepaidCredit
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-[#162032] border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    {usePrepaidCredit ? '✓ Using Credit' : 'Use 1 Credit'}
                  </button>
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-6 text-xs">
                
                {/* 1. Bulk Package Selector (Hidden if redeeming an existing prepaid credit) */}
                {!usePrepaidCredit ? (
                  <div>
                    <PackageSelector
                      hourlyRate={hourlyRate}
                      selectedTier={selectedPackageTier}
                      onSelectTier={(tier) => setSelectedPackageTier(tier)}
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-[#162032] rounded-xl border border-gray-200 dark:border-[#2D3B4F]">
                    <span className="text-[11px] font-bold text-charcoal-400 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Payment Method
                    </span>
                    <span className="font-bold text-xs text-navy-800 dark:text-white">
                      Redeeming 1 Prepaid Bundle Credit (0.00 USD)
                    </span>
                  </div>
                )}

                {/* 2. Date Selection */}
                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Select First Session Date
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#162032] border border-gray-200 dark:border-[#2D3B4F] rounded-lg px-3 py-2.5 text-xs font-medium text-navy-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#1C283F]"
                  />
                  {selectedPackageTier > 1 && !usePrepaidCredit && (
                    <p className="text-[11px] text-charcoal-400 dark:text-slate-400 mt-1">
                      You are picking the time for lesson #1. Your remaining {selectedPackageTier - 1} prepaid credits can be scheduled whenever you're ready from your dashboard.
                    </p>
                  )}
                </div>

                {/* 3. Time Slot */}
                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Select Time Slot (US Eastern Time)
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
                    Student Goals or Topics for this Lesson (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Preparing for upcoming AP Calculus test, homework assistance, specific textbook chapters..."
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#162032] border border-gray-200 dark:border-[#2D3B4F] rounded-lg p-3 text-xs text-navy-800 dark:text-white placeholder-charcoal-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-600 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#1C283F]"
                  />
                </div>

                {/* 5. "Give $20, Get $20" Referral & Promo Code Box */}
                {!usePrepaidCredit && (
                  <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-navy-800 dark:text-amber-300 text-xs">
                        <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Have a Referral or Promo Code?</span>
                      </div>
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800/60">
                        -$20 Welcome Gift
                      </span>
                    </div>

                    {appliedReferral ? (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
                              {appliedReferral.code}
                            </span>
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block">
                              ${appliedReferral.amount.toFixed(2)} discount applied
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveReferral}
                          className="text-[11px] text-red-600 dark:text-red-400 hover:underline font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. CLASSLY-NILAY20 or GIVE20"
                            value={referralCodeInput}
                            onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                            className="flex-1 bg-white dark:bg-[#162032] border border-gray-200 dark:border-[#2D3B4F] rounded-lg px-3 py-2 text-xs font-mono uppercase text-navy-800 dark:text-white placeholder-charcoal-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            disabled={validatingCode || !referralCodeInput.trim()}
                            onClick={() => handleApplyReferralCode()}
                            className="px-4 py-2 bg-navy-800 hover:bg-navy-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          >
                            {validatingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Apply</span>}
                          </button>
                        </div>
                        {codeFeedback && (
                          <p className={`text-[11px] ${codeFeedback.type === 'success' ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-red-600 dark:text-red-400'}`}>
                            {codeFeedback.text}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Submit / Pay CTA */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-navy-800 hover:bg-navy-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-subtle transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Reservation...</span>
                    </div>
                  ) : usePrepaidCredit ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Confirm Lesson with 1 Prepaid Credit ($0.00 Due)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Authorize Payment (${finalTotalDue.toFixed(2)} USD)</span>
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

              {/* Package & Price Breakdown */}
              <div className="space-y-2.5 text-charcoal-600 dark:text-slate-300">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-navy-800 dark:text-white block">
                      {usePrepaidCredit 
                        ? '1-on-1 Lesson (Prepaid)' 
                        : `${LESSON_PACKAGES.find(p => p.tier === selectedPackageTier)?.label}`}
                    </span>
                    <span className="text-[11px] text-charcoal-400 dark:text-slate-400">
                      {usePrepaidCredit ? '60 mins' : `${selectedPackageTier} session${selectedPackageTier > 1 ? 's' : ''} @ $${hourlyRate}/hr`}
                    </span>
                  </div>
                  <span className="font-bold text-navy-800 dark:text-white">
                    {usePrepaidCredit ? '$0.00' : `$${pricing.fullTotalPrice.toFixed(2)}`}
                  </span>
                </div>

                {/* Bundle Savings line */}
                {!usePrepaidCredit && pricing.totalSaved > 0 && (
                  <div className="flex justify-between items-center text-accent-700 dark:text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Package Bundle Savings ({pricing.discountPercent}%)</span>
                    </span>
                    <span>-${pricing.totalSaved.toFixed(2)}</span>
                  </div>
                )}

                {/* Referral Welcome Credit line */}
                {!usePrepaidCredit && referralDiscountUSD > 0 && (
                  <div className="flex justify-between items-center text-amber-700 dark:text-amber-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      <span>Referral Welcome Credit</span>
                    </span>
                    <span>-${referralDiscountUSD.toFixed(2)}</span>
                  </div>
                )}

                {/* Tech Fee */}
                <div className="flex justify-between">
                  <span>Platform & Classroom Tech Fee</span>
                  <span className="font-bold text-navy-800 dark:text-white">
                    {usePrepaidCredit ? '$0.00' : `$${platformFee.toFixed(2)}`}
                  </span>
                </div>

                {/* Total */}
                <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-[#1E293B] text-sm font-bold text-navy-800 dark:text-emerald-400">
                  <span>Total Due Today</span>
                  <span>${finalTotalDue.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Total Savings Callout if discount was applied */}
              {!usePrepaidCredit && (pricing.totalSaved > 0 || referralDiscountUSD > 0) && (
                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center justify-between">
                  <span>Total Savings on this order:</span>
                  <span className="font-bold text-xs">${(pricing.totalSaved + referralDiscountUSD).toFixed(2)} USD</span>
                </div>
              )}

              <div className="p-3 bg-gray-50 dark:bg-[#162032] rounded-lg border border-gray-200 dark:border-[#2D3B4F] space-y-1.5 text-[11px] text-charcoal-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-semibold text-accent-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-500 dark:text-emerald-400" />
                  <span>Classly Parent Protection</span>
                </div>
                <div>• Zero recurring subscription charges</div>
                <div>• Free cancellation up to 24 hours prior</div>
                <div>• Prepaid bundle credits never expire</div>
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
