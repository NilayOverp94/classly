import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="bg-offwhite dark:bg-[#09090b] min-h-screen py-12 lg:py-16 border-b border-gray-200 dark:border-[#27272a] transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-navy-800 dark:text-white tracking-tight">
            Terms of Service & Platform Guidelines
          </h1>
          <p className="mt-2 text-xs text-charcoal-500 dark:text-zinc-400">
            Last Updated: November 14, 2026 • Please read carefully before using Classly
          </p>
        </div>

        <div className="bg-white dark:bg-[#121215] rounded-2xl border border-gray-200 dark:border-[#27272a] shadow-subtle p-8 sm:p-10 space-y-8 text-xs text-charcoal-700 dark:text-zinc-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-800 dark:text-white">1. Acceptance of Marketplace Terms</h2>
            <p>
              By creating an account, scheduling a lesson, or applying as an educator on Classly ("Platform"), you agree to be bound by these Terms of Service. If you are registering on behalf of a minor student, you affirm that you are the student’s parent or legal guardian.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-800 dark:text-white">2. Marketplace Relationship</h2>
            <p>
              Classly operates an online educational technology marketplace that connects independent tutors ("Educators") with students and parents ("Learners"). Educators are independent contractors and are not employees, agents, or partners of Classly. Classly provides scheduling, WebRTC video classrooms, identity verification auditing, and payment processing services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-800 dark:text-white">3. Booking, Rescheduling & Cancellation Policy</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-charcoal-600 dark:text-zinc-400">
              <li><strong className="text-navy-800 dark:text-zinc-200">Free Cancellation:</strong> Learners may cancel or reschedule a scheduled lesson at no charge up to twenty-four (24) hours prior to the session start time.</li>
              <li><strong className="text-navy-800 dark:text-zinc-200">Late Cancellations:</strong> Cancellations made within twenty-four (24) hours of the scheduled lesson start time are non-refundable and will be compensated to the educator to protect their reserved calendar commitment.</li>
              <li><strong className="text-navy-800 dark:text-zinc-200">Educator Cancellations:</strong> If an educator must cancel an upcoming lesson due to unforeseen technical or personal circumstances, the learner will receive an immediate full refund or account credit.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-800 dark:text-white">4. First Lesson Money-Back Guarantee</h2>
            <p>
              If a parent or student is not completely satisfied with their very first lesson with any newly booked educator, the parent must notify Classly member support within twenty-four (24) hours of the session conclusion. Classly will issue a full refund to the original payment method.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-800 dark:text-white">5. Platform Commission & Educator Payouts</h2>
            <p>
              Classly collects the total lesson fee from the learner at the time of booking confirmation. The platform retains a standard fifteen percent (15%) service commission to cover platform software operations, video classroom servers, customer support, and financial processing fees. Eighty-five percent (85%) of the educator's hourly fee is disbursed to the educator's designated bank account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-800 dark:text-white">6. Educator Code of Conduct & Child Protection</h2>
            <p>
              All interactions between educators and minor students must remain strictly educational, professional, and courteous. Educators agree never to solicit private off-platform payments, request personal off-platform contact details from minors, or engage in inappropriate communications. Violations result in immediate permanent account termination and referral to appropriate legal authorities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-800 dark:text-white">7. Inquiries and Legal Notices</h2>
            <p>
              For legal inquiries or notices regarding these terms, please contact:
            </p>
            <p className="font-semibold text-navy-800 dark:text-amber-400">
              legal@classly.com • Classly Inc. Legal Affairs
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}

