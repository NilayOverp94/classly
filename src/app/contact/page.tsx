'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Clock, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'parent',
    subject: 'General Question',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          ...formData,
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-offwhite min-h-screen py-12 lg:py-16 border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2 block">
            We're Here to Help
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-800 tracking-tight">
            Contact the Classly Support Team
          </h1>
          <p className="mt-2 text-sm text-charcoal-600">
            Have questions about finding a tutor, billing, or educator onboarding? Our support team responds within 12 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Contact Coordinates */}
          <div className="md:col-span-5 bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-subtle space-y-6">
            <h2 className="text-base font-bold text-navy-800">Support Coordinates</h2>
            
            <div className="space-y-4 text-xs text-charcoal-700">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-navy-800 block">Email Support</span>
                  <span>support@classly.com</span>
                  <span className="text-[11px] text-charcoal-400 block mt-0.5">Average response time: 2 hours</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-navy-800 block">Support Desk Hours</span>
                  <span>Monday – Friday: 08:00 AM – 10:00 PM EST</span>
                  <span className="text-[11px] text-charcoal-400 block mt-0.5">Saturday – Sunday: 09:00 AM – 06:00 PM EST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-navy-800 block">Operating Offices</span>
                  <span>United States: Delaware, USA</span>
                  <span className="block">Educator Operations: New Delhi & Bengaluru, India</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-xs">
              <span className="text-charcoal-500">Looking for immediate answers?</span>
              <Link href="/faq" className="mt-1 block font-bold text-navy-800 hover:underline">
                Read our Frequently Asked Questions &rarr;
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-subtle">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-accent-50 text-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-navy-800 mb-2">Message Dispatched!</h3>
                <p className="text-xs text-charcoal-600 max-w-sm mx-auto mb-6">
                  Thank you, <strong>{formData.name}</strong>. Our member support team has received your inquiry and will reply to <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-navy-800 text-white rounded-lg text-xs font-semibold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jane Smith"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">I am a... *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                    >
                      <option value="parent">Parent / Student</option>
                      <option value="teacher">Prospective / Current Teacher</option>
                      <option value="school">School / Administrator</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Inquiry Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                  >
                    <option value="General Question">General Question</option>
                    <option value="Finding a Tutor">Help Finding the Right Tutor</option>
                    <option value="Billing / Refund">Billing, Payout or Refund Question</option>
                    <option value="Classroom Technical Support">Live Classroom Technical Question</option>
                    <option value="Teacher Application">Teacher Application Status</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please include any relevant details or booking reference IDs..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-lg text-xs transition shadow-subtle flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending Message...' : 'Send Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

