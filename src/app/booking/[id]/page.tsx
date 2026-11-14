'use client';

import React, { useState, Suspense } from 'react';
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
import { mockTutors } from '@/lib/data/mockTutors';

function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tutorId = (params?.id as string) || 'tutor-1';
  const initialFormat = searchParams.get('format') || 'one_on_one';
  const initialDay = searchParams.get('day') || 'Monday';

  const tutor = mockTutors.find((t) => t.id === tutorId) || mockTutors[0];

  // Booking selections
  const [selectedFormat, setSelectedFormat] = useState<string>(initialFormat);
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-18');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('05:00 PM EST');
  const [userTimezone, setUserTimezone] = useState<string>('America/New_York');
  const [studentNotes, setStudentNotes] = useState<string>('');
  
  // Payment state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');

  // Calculations
  const hourlyRate = tutor.hourly_rate;
  const platformFee = 4.50; // Platform technology & classroom fee
  const totalAmount = hourlyRate + platformFee;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment authorization & double booking check
    setTimeout(() => {
      setIsProcessing(false);
      const bookingId = `book-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedBookingId(bookingId);
      setBookingConfirmed(true);
    }, 1200);
  };

  return (
    <div className="bg-offwhite min-h-screen py-8 lg:py-12 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/tutors/${tutor.id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-600 hover:text-navy-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {tutor.full_name}'s Profile</span>
          </Link>
        </div>

        {bookingConfirmed ? (
          /* Confirmation Screen */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lift p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-accent-50 text-accent-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-accent-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-navy-800 mb-2">
              Lesson Confirmed!
            </h1>
            <p className="text-xs text-charcoal-600 max-w-md mx-auto mb-8">
              Your session with <strong>{tutor.full_name}</strong> is scheduled and paid. A confirmation email has been dispatched to your parent inbox.
            </p>

            {/* Session Card */}
            <div className="bg-offwhite/80 p-6 rounded-xl border border-gray-200 text-left max-w-lg mx-auto mb-8 space-y-3 text-xs">
              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-charcoal-500">Booking Reference</span>
                <span className="font-bold text-navy-800">#{confirmedBookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Subject</span>
                <span className="font-bold text-navy-800">{tutor.subjects[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Date & Time</span>
                <span className="font-bold text-navy-800">{selectedDate} at {selectedTimeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Duration</span>
                <span className="font-bold text-navy-800">60 Minutes</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-charcoal-500">Amount Paid</span>
                <span className="font-bold text-navy-800">${totalAmount.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/classroom/room-${confirmedBookingId}`}
                className="w-full sm:w-auto px-8 py-3 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-bold shadow-subtle transition flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Enter Live Classroom</span>
              </Link>
              <Link
                href="/dashboard/student"
                className="w-full sm:w-auto px-6 py-3 bg-gray-50 hover:bg-gray-100 text-charcoal-700 rounded-lg text-xs font-semibold border border-gray-200 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Step-by-Step Booking Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-subtle space-y-6">
              <div>
                <h1 className="text-xl font-bold text-navy-800">
                  Schedule Lesson & Checkout
                </h1>
                <p className="text-xs text-charcoal-500 mt-1">
                  Select your preferred lesson time and confirm booking details.
                </p>
              </div>

              <form onSubmit={handleCheckout} className="space-y-5 text-xs">
                
                {/* 1. Format Selection */}
                <div>
                  <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                    1. Select Teaching Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedFormat('one_on_one')}
                      className={`p-3 text-left rounded-lg border text-xs transition ${
                        selectedFormat === 'one_on_one'
                          ? 'border-navy-800 bg-softblue-50 font-bold text-navy-800'
                          : 'border-gray-200 text-charcoal-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-bold">1-on-1 Private Tutoring</div>
                      <div className="text-[11px] text-charcoal-500 font-normal mt-0.5">Dedicated individualized attention</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFormat('group')}
                      className={`p-3 text-left rounded-lg border text-xs transition ${
                        selectedFormat === 'group'
                          ? 'border-navy-800 bg-softblue-50 font-bold text-navy-800'
                          : 'border-gray-200 text-charcoal-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-bold">Small Group Workshop</div>
                      <div className="text-[11px] text-charcoal-500 font-normal mt-0.5">Interactive cohort with peers</div>
                    </button>
                  </div>
                </div>

                {/* 2. Date Selection */}
                <div>
                  <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                    2. Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    min="2026-11-15"
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800 font-medium"
                  />
                </div>

                {/* 3. Time Slot & Timezone */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-semibold text-charcoal-700 uppercase tracking-wider">
                      3. Select Time Slot
                    </label>
                    <select
                      value={userTimezone}
                      onChange={(e) => setUserTimezone(e.target.value)}
                      className="text-[11px] bg-gray-50 border border-gray-200 rounded px-2 py-1 text-navy-800"
                    >
                      <option value="America/New_York">US Eastern (EST)</option>
                      <option value="America/Chicago">US Central (CST)</option>
                      <option value="America/Denver">US Mountain (MST)</option>
                      <option value="America/Los_Angeles">US Pacific (PST)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['07:00 AM EST', '08:30 AM EST', '05:00 PM EST', '06:30 PM EST', '08:00 PM EST'].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-2 rounded text-center border font-medium transition ${
                          selectedTimeSlot === slot
                            ? 'bg-navy-800 text-white border-navy-800 font-bold'
                            : 'bg-gray-50 border-gray-200 text-charcoal-700 hover:bg-gray-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Student Notes / Focus Topics */}
                <div>
                  <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    4. Student Learning Goals / Homework Topics
                  </label>
                  <textarea
                    rows={2}
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    placeholder="e.g. Preparing for upcoming chapter test on polynomial derivatives..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800 focus:bg-white"
                  />
                </div>

                {/* 5. Payment Details Card */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                    5. Payment Method
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-navy-800" />
                      <span className="font-semibold text-navy-800">Secure Payment Gateway (Card / NetBanking)</span>
                    </div>
                    <span className="text-[11px] text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                      256-bit Encrypted
                    </span>
                  </div>
                </div>

                {/* Submit / Confirm */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-lg transition shadow-subtle flex items-center justify-center gap-2 text-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessing ? 'Processing Payment...' : `Authorize & Confirm Booking ($${totalAmount.toFixed(2)})`}
                  </span>
                </button>

                <p className="text-[11px] text-charcoal-400 text-center">
                  Protected by Classly's 100% money-back first lesson guarantee.
                </p>

              </form>
            </div>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-gray-200 shadow-subtle space-y-4">
              <h2 className="text-base font-bold text-navy-800 pb-3 border-b border-gray-100">
                Booking Summary
              </h2>

              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                  <Image src={tutor.avatar_url} alt={tutor.full_name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-navy-800">{tutor.full_name}</h3>
                  <p className="text-[11px] text-charcoal-500">{tutor.headline}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subject</span>
                  <span className="font-semibold text-navy-800">{tutor.subjects[0]}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Session Type</span>
                  <span className="font-semibold text-navy-800">
                    {selectedFormat === 'one_on_one' ? '1-on-1 Tutoring' : 'Group Workshop'}
                  </span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Scheduled Time</span>
                  <span className="font-semibold text-navy-800">{selectedTimeSlot}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Tutor Hourly Rate</span>
                  <span className="font-semibold text-navy-800">${hourlyRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Classroom & Platform Fee</span>
                  <span className="font-semibold text-navy-800">${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 text-sm font-bold text-navy-800">
                  <span>Total Due</span>
                  <span>${totalAmount.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="p-3 bg-softblue-50 border border-softblue-200 rounded-lg text-[11px] text-charcoal-600">
                <strong>Double-booking prevention:</strong> This time slot is reserved for 10 minutes while you complete checkout.
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function BookingCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-charcoal-500">Loading booking interface...</div>}>
      <BookingContent />
    </Suspense>
  );
}
