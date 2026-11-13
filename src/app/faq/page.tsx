'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
  category: 'parents' | 'teachers' | 'billing' | 'classroom';
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      category: 'parents',
      q: 'How does Classly vet and verify teachers?',
      a: 'Every teacher on Classly completes a 4-step verification audit. We verify government identification, authenticate university degree transcripts (e.g. IIT, BITS Pilani, Delhi University), review prior teaching experience, and assess subject pedagogy before approving their account.',
    },
    {
      category: 'parents',
      q: 'What is the Classly First Lesson Guarantee?',
      a: 'We want every family to feel 100% confident. If you or your student are unsatisfied with your first lesson with any educator for any reason, let us know within 24 hours and we will provide a full refund or a complimentary credit to book with another tutor.',
    },
    {
      category: 'parents',
      q: 'How do time zones work between the US and teachers in India?',
      a: 'Our scheduling system handles all timezone conversions automatically. Sessions are scheduled in your local US time (EST, CST, MST, PST). Afternoon and evening times in the US (4:00 PM – 9:00 PM) align conveniently with morning or evening teaching hours in India.',
    },
    {
      category: 'teachers',
      q: 'How and when do teachers receive payouts?',
      a: 'Teachers earn 85% of their hourly booking rate (Classly retains 15% to cover platform hosting, WebRTC classroom infrastructure, and payment processing). Earnings accrue in your dashboard and are automatically transferred directly to your local bank account via secure bank transfers.',
    },
    {
      category: 'teachers',
      q: 'Can I set my own hourly rate and teaching availability?',
      a: 'Yes. Every teacher maintains full control over their hourly rate and weekly schedule. You can open and close slots anytime through your Teacher Dashboard.',
    },
    {
      category: 'billing',
      q: 'Are there any subscriptions or hidden fees?',
      a: 'No subscriptions. You only pay for lessons you schedule. Each booking clearly shows the tutor hourly rate, small platform infrastructure fee, and total before payment authorization.',
    },
    {
      category: 'billing',
      q: 'What is the lesson cancellation and rescheduling policy?',
      a: 'Lessons can be rescheduled or cancelled free of charge up to 24 hours prior to the scheduled start time. Cancellations with less than 24 hours notice are compensated to the tutor to respect their reserved calendar slot.',
    },
    {
      category: 'classroom',
      q: 'Do I need to download Zoom or other software?',
      a: 'No software downloads are required. The Classly Live Classroom runs natively inside modern web browsers (Chrome, Edge, Safari, Firefox) on desktop, laptop, or tablet. It includes HD video, interactive digital whiteboards, screen sharing, and chat.',
    },
  ];

  const filteredFaqs = activeCategory === 'all'
    ? faqs
    : faqs.filter((f) => f.category === activeCategory);

  return (
    <div className="bg-offwhite min-h-screen py-12 lg:py-16 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2 block">
            Got Questions?
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-800 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-sm text-charcoal-600">
            Everything you need to know about learning, teaching, and payments on Classly.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'parents', label: 'For Parents & Students' },
            { id: 'teachers', label: 'For Teachers' },
            { id: 'billing', label: 'Payments & Guarantees' },
            { id: 'classroom', label: 'Online Classroom' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
              className={`px-4 py-2 rounded-lg border transition ${
                activeCategory === cat.id
                  ? 'bg-navy-800 text-white border-navy-800 shadow-subtle'
                  : 'bg-white text-charcoal-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-200 shadow-subtle overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-bold text-navy-800">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-navy-800 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-charcoal-600 leading-relaxed border-t border-gray-50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions card */}
        <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200 shadow-subtle text-center text-xs">
          <span className="font-bold text-navy-800 block text-sm mb-1">Still have questions?</span>
          <p className="text-charcoal-600 mb-4">Our family support team is available 7 days a week.</p>
          <Link
            href="/contact"
            className="inline-block px-5 py-2.5 bg-navy-800 hover:bg-navy-900 text-white font-semibold rounded-lg shadow-subtle transition"
          >
            Contact Support Team
          </Link>
        </div>

      </div>
    </div>
  );
}

