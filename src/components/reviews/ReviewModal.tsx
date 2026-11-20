'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, X, CheckCircle2, AlertCircle, Sparkles, ThumbsUp } from 'lucide-react';
import { ReviewItem } from '@/lib/types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (review: ReviewItem) => void;
  tutorId: string;
  tutorName: string;
  tutorAvatar?: string;
  subject?: string;
  bookingId?: string;
  studentId?: string;
  studentName?: string;
  studentGrade?: string;
}

const QUICK_TAGS = [
  'Patient & Encouraging',
  'Clear Explanations',
  'Solved Difficult Problems',
  'Great Exam Prep',
  'Engaging & Friendly',
  'Homework Help Champion',
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  5: 'Exceptional Educator! Highly recommend.',
  4: 'Very Good — learned a lot.',
  3: 'Good session, covered key topics.',
  2: 'Fair — needed more clarity.',
  1: 'Did not meet expectations.',
};

export function ReviewModal({
  isOpen,
  onClose,
  onSuccess,
  tutorId,
  tutorName,
  tutorAvatar,
  subject = 'Tutoring Session',
  bookingId,
  studentId,
  studentName = 'Verified Student',
  studentGrade = 'K-12 Student',
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Patient & Encouraging']);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorId) {
      setError('Educator ID missing.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          tutorId,
          studentId,
          studentName,
          studentGrade,
          rating,
          comment,
          subject,
          tags: selectedTags,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      setIsSuccess(true);
      if (onSuccess && data.review) {
        onSuccess(data.review);
      }

      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Unable to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-[#1E293B] shadow-2xl p-6 sm:p-7 overflow-hidden transition-all text-charcoal-800 dark:text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#162032] transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="py-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-300 dark:border-emerald-700">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-2">
              Review Published!
            </h3>
            <p className="text-xs text-charcoal-600 dark:text-slate-300 max-w-xs mx-auto">
              Thank you for sharing your feedback. Your review will help students and parents find great educators on Classly.
            </p>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 rounded-md bg-accent-50 dark:bg-emerald-950/40 text-accent-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700 dark:text-emerald-400">
                Post-Lesson Review
              </span>
            </div>

            <h2 className="text-lg font-bold text-navy-800 dark:text-white mb-1">
              Rate Your Session with {tutorName}
            </h2>
            <p className="text-xs text-charcoal-500 dark:text-slate-400 mb-5">
              Verified review for <strong>{subject}</strong>
            </p>

            {/* Error notice */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Interactive Star Rating */}
            <div className="mb-5 p-4 rounded-xl bg-gray-50 dark:bg-[#162032] border border-gray-200/80 dark:border-[#1E293B] text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeStar = hoverRating > 0 ? star <= hoverRating : star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          activeStar
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-semibold text-navy-800 dark:text-amber-300">
                {RATING_DESCRIPTIONS[hoverRating || rating]}
              </p>
            </div>

            {/* Quick Praise Tags */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-slate-300 mb-2">
                What went well? (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                        isSelected
                          ? 'bg-navy-800 text-white border-navy-800 dark:bg-emerald-600 dark:border-emerald-600'
                          : 'bg-white dark:bg-[#162032] text-charcoal-600 dark:text-slate-300 border-gray-200 dark:border-[#2D3B4F] hover:bg-gray-100 dark:hover:bg-[#1E293B]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Comment */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-slate-300 mb-1.5">
                Share details of your experience (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How did your tutor explain the concepts? What did they help you achieve or solve during the lesson?"
                rows={3}
                maxLength={600}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#1E293B] bg-white dark:bg-[#162032] text-charcoal-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-emerald-500"
              />
              <div className="text-right text-[10px] text-gray-400 mt-1">
                {comment.length}/600 characters
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-[#1E293B]">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-charcoal-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#162032] transition"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-navy-800 hover:bg-navy-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 text-white transition flex items-center gap-1.5 shadow-sm"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Publish Verified Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
