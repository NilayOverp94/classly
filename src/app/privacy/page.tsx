import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-offwhite dark:bg-[#0A0F1D] min-h-screen py-12 lg:py-16 border-b border-gray-200 dark:border-[#1E293B] transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>K-12 Child Privacy & COPPA Standards</span>
          </div>
          <h1 className="text-3xl font-bold text-navy-800 dark:text-white tracking-tight">
            Privacy Policy & Child Safety Pledge
          </h1>
          <p className="mt-2 text-xs text-charcoal-500 dark:text-slate-400">
            Last Updated: November 14, 2026 • Effective Date: November 14, 2026
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-[#1E293B] shadow-subtle p-8 sm:p-10 space-y-8 text-xs text-charcoal-700 dark:text-slate-300 leading-relaxed">
          
          <div className="p-4 bg-softblue-50 dark:bg-[#162032] border border-softblue-200 dark:border-[#1E293B] rounded-lg">
            <h3 className="font-bold text-navy-800 dark:text-white text-sm mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent-500 dark:text-emerald-400" />
              <span>Our Core Commitment to Minor Safety</span>
            </h3>
            <p className="text-[11px] text-charcoal-600 dark:text-slate-400">
              Classly is built exclusively for K-12 education. Because our platform serves minors, our privacy architecture complies with the United States Children’s Online Privacy Protection Act (COPPA), the Family Educational Rights and Privacy Act (FERPA) guidelines, and standard child protection best practices.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-800 dark:text-white">1. Parent-Supervised Accounts (COPPA Compliance)</h2>
            <p>
              Students under the age of 18 are not permitted to create independent, unverified accounts on Classly. All student profiles must be initiated, authorized, and linked to a verified parent or legal guardian account.
            </p>
            <p>
              Parents maintain sole authority over:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-charcoal-600 dark:text-slate-400">
              <li>Lesson scheduling and tutor selections.</li>
              <li>Payment authorizations and transaction approvals.</li>
              <li>Reviewing lesson recordings and chat transcripts.</li>
              <li>Account modification or deletion at any time.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-800 dark:text-white">2. Information We Collect</h2>
            <p>
              We practice data minimization. We only collect the information strictly necessary to provide high-quality tutoring instruction:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-charcoal-600 dark:text-slate-400">
              <li><strong className="text-navy-800 dark:text-slate-200">Parent Data:</strong> Full legal name, email address, phone number, and billing details (tokenized securely via PCI-DSS compliant payment gateways).</li>
              <li><strong className="text-navy-800 dark:text-slate-200">Student Data:</strong> First name or initial, grade level, school curriculum (e.g. AP Calculus), and academic focus areas. We do not require or collect student home addresses or government identification numbers.</li>
              <li><strong className="text-navy-800 dark:text-slate-200">Educator Data:</strong> Full legal name, educational degrees, teaching certifications, government identification (strictly for identity verification), and payout banking coordinates.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-800 dark:text-white">3. Live Classroom Audio & Video Data</h2>
            <p>
              Our WebRTC live classroom sessions utilize end-to-end transport layer encryption. Class sessions may be recorded exclusively for student review and child safety auditing. Recordings are stored in private, encrypted cloud storage accessible only to the parent, the student, the instructor, and Classly safety compliance officers in the event of an reported incident.
            </p>
            <p>
              We never sell, rent, monetize, or use student video, audio, or classroom notes for advertising or commercial machine learning training.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-800 dark:text-white">4. Third-Party Service Providers</h2>
            <p>
              We share data only with trusted infrastructure providers required to operate our marketplace:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-charcoal-600 dark:text-slate-400">
              <li><strong className="text-navy-800 dark:text-slate-200">Supabase:</strong> Encrypted database hosting and session authentication with Row Level Security.</li>
              <li><strong className="text-navy-800 dark:text-slate-200">LiveKit:</strong> Secure WebRTC audio/video media routing.</li>
              <li><strong className="text-navy-800 dark:text-slate-200">Razorpay:</strong> Encrypted, PCI-DSS Level 1 compliant payment processing. Card data is never stored on Classly servers.</li>
              <li><strong className="text-navy-800 dark:text-slate-200">Resend:</strong> Secure transactional email dispatch for booking receipts and security notices.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-navy-800 dark:text-white">5. Contact Our Data Protection Officer</h2>
            <p>
              If you have any questions, wish to review the information stored about your child, or request immediate account data deletion, please contact our privacy compliance desk at:
            </p>
            <p className="font-semibold text-navy-800 dark:text-emerald-400">
              privacy@classly.com • Subject: Parental Data Inquiry
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}

