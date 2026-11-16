import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  CalendarCheck, 
  Video, 
  ShieldCheck, 
  CheckCircle, 
  Users, 
  Lock, 
  CreditCard,
  ArrowRight
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="bg-offwhite min-h-screen py-12 lg:py-16 border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2 block">
            The Classly Experience
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-800 tracking-tight">
            How Classly Works for Families & Educators
          </h1>
          <p className="mt-3 text-sm text-charcoal-600 leading-relaxed">
            A safe, transparent international marketplace connecting US K-12 students with top-tier educators through modern video classrooms.
          </p>
        </div>

        {/* 3 Step Flow for Students & Parents */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-subtle p-8 sm:p-10 mb-12 space-y-10">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-navy-800">For Students & Parents</h2>
            <p className="text-xs text-charcoal-500">From discovery to the first lesson in three clear steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-softblue-100 text-navy-800 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-base text-navy-800">1. Search & Filter Tutors</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Filter by subject track (e.g. Pre-Algebra, AP Calculus, Python, AP Computer Science A), grade level, price range, and student reviews. Watch video introductions and review teaching methodologies before booking.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-softblue-100 text-navy-800 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-base text-navy-800">2. Book a Time Slot</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Choose between private 1-on-1 sessions or small group classes. Select a date and time in your local US timezone (Eastern, Central, Mountain, or Pacific). Pay securely with transparent hourly rates.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-softblue-100 text-navy-800 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-base text-navy-800">3. Learn Live in Browser</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Enter your live, private classroom with one click. Use interactive dual whiteboards, share homework worksheets, and receive session notes directly in your student dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Trust & Safety */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-subtle">
            <ShieldCheck className="w-6 h-6 text-accent-500 mb-3" />
            <h3 className="font-bold text-sm text-navy-800 mb-1">Rigorously Vetted Educators</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              We verify university degrees from premier institutions (such as IITs, BITS Pilani, Delhi University), subject mastery, and identity credentials before any educator can publish classes.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-subtle">
            <Lock className="w-6 h-6 text-accent-500 mb-3" />
            <h3 className="font-bold text-sm text-navy-800 mb-1">Parent Supervised Accounts (COPPA)</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Parents retain full oversight of student accounts, payment authorizations, and classroom bookings. Children cannot independently initiate unmonitored contacts.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-subtle">
            <CheckCircle className="w-6 h-6 text-accent-500 mb-3" />
            <h3 className="font-bold text-sm text-navy-800 mb-1">100% First Lesson Guarantee</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              If your student is not completely satisfied with their first lesson with any tutor, Classly will promptly refund your payment or credit a new session with an alternate teacher.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-subtle">
            <CreditCard className="w-6 h-6 text-accent-500 mb-3" />
            <h3 className="font-bold text-sm text-navy-800 mb-1">Transparent Pay-As-You-Go</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              No locked-in annual subscriptions or surprise fees. You only pay for lessons you schedule, with easy cancellation up to 24 hours prior to class.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 bg-navy-800 text-white rounded-2xl text-center space-y-4">
          <h3 className="text-2xl font-bold">Ready to find the ideal tutor for your student?</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Browse verified educators across mathematics, physics, chemistry, biology, coding, and language arts.
          </p>
          <div className="pt-2">
            <Link
              href="/tutors"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-800 rounded-lg text-xs font-bold hover:bg-gray-100 transition shadow-subtle"
            >
              <span>Explore Tutors Now</span>
              <ArrowRight className="w-4 h-4 text-navy-800" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

