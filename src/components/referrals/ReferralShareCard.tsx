'use client';

import React, { useState } from 'react';
import { 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  Mail, 
  Sparkles, 
  Users, 
  DollarSign, 
  ArrowRight 
} from 'lucide-react';
import { ReferralProfile } from '@/lib/types';
import { getReferralShareData, REFERRAL_CREDIT_AMOUNT_USD } from '@/lib/referrals/referralService';

interface ReferralShareCardProps {
  profile: ReferralProfile;
  parentName?: string;
  className?: string;
}

export function ReferralShareCard({
  profile,
  parentName,
  className = '',
}: ReferralShareCardProps) {
  const [copied, setCopied] = useState(false);
  const { referralLink, whatsappUrl, emailUrl } = getReferralShareData(profile.referralCode, parentName);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: '$20 Classly Tutoring Credit',
          text: `Use my link to claim a $20 welcome discount toward your child's first 1-on-1 tutoring lesson on Classly!`,
          url: referralLink,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className={`bg-gradient-to-br from-white via-white to-amber-50/30 dark:from-[#121215] dark:via-[#121215] dark:to-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-800/40 p-6 sm:p-7 shadow-subtle relative overflow-hidden ${className}`}>
      
      {/* Decorative ambient background blur */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-400/10 dark:bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                Give ${REFERRAL_CREDIT_AMOUNT_USD}, Get ${REFERRAL_CREDIT_AMOUNT_USD}
              </span>
              <span className="text-xs text-charcoal-400 dark:text-zinc-400">• Parent Referral Program</span>
            </div>
            <h3 className="text-lg font-bold text-navy-800 dark:text-white mt-1">
              Invite Fellow Parents & Earn Lesson Credits
            </h3>
            <p className="text-xs text-charcoal-600 dark:text-zinc-300 mt-0.5 max-w-lg">
              Share your personal link with school parent groups. When a family books their first lesson, <strong>they save ${REFERRAL_CREDIT_AMOUNT_USD}</strong>, and you get <strong>${REFERRAL_CREDIT_AMOUNT_USD}</strong> in lesson credits.
            </p>
          </div>
        </div>

        {/* Available Credits Pill */}
        <div className="bg-white dark:bg-[#18181c] p-3.5 rounded-xl border border-gray-200 dark:border-[#323238] shadow-sm flex-shrink-0 text-center sm:text-right min-w-[150px]">
          <span className="text-[10px] font-bold text-charcoal-400 dark:text-zinc-400 uppercase tracking-wider block">
            Your Credit Balance
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-amber-400">
            ${profile.availableCreditsUSD.toFixed(2)}
          </span>
          <span className="text-[10px] text-charcoal-500 dark:text-zinc-400 block mt-0.5">
            Auto-applied at checkout
          </span>
        </div>
      </div>

      {/* Share Link Row & 1-Click Buttons */}
      <div className="space-y-3 relative z-10">
        <label className="block text-xs font-semibold text-charcoal-700 dark:text-zinc-300">
          Your Exclusive Family Referral Link
        </label>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Link Box */}
          <div className="flex-1 flex items-center bg-gray-50 dark:bg-[#18181c] border border-gray-200 dark:border-[#323238] rounded-xl px-3.5 py-2 overflow-hidden">
            <span className="text-xs font-mono font-medium text-navy-800 dark:text-zinc-200 truncate select-all">
              {referralLink}
            </span>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-navy-800 hover:bg-navy-900 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-zinc-950 font-bold text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* 1-Click Direct Share Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] text-xs font-bold border border-[#25D366]/30 transition"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Share to School WhatsApp</span>
          </a>

          {/* Email Button */}
          <a
            href={emailUrl}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-softblue-50 dark:bg-[#18181c] hover:bg-softblue-100 dark:hover:bg-[#27272a] text-navy-800 dark:text-zinc-200 text-xs font-semibold border border-softblue-200 dark:border-[#323238] transition"
          >
            <Mail className="w-4 h-4 text-accent-600 dark:text-amber-400" />
            <span>Email to Friends</span>
          </a>

          {/* Native Mobile Share if supported */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-[#18181c] dark:hover:bg-[#27272a] text-charcoal-700 dark:text-zinc-300 text-xs font-medium border border-gray-200 dark:border-[#323238] transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>More Options</span>
          </button>
        </div>
      </div>

      {/* Referral Mini Ledger / Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-5 mt-5 border-t border-gray-100 dark:border-[#27272a] relative z-10 text-xs">
        <div className="p-2.5 rounded-lg bg-white/70 dark:bg-[#18181c]/60 border border-gray-100 dark:border-[#323238]">
          <span className="text-[10px] text-charcoal-400 dark:text-zinc-400 uppercase font-semibold block">
            Referral Code
          </span>
          <span className="font-mono font-bold text-navy-800 dark:text-white">
            {profile.referralCode}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/70 dark:bg-[#18181c]/60 border border-gray-100 dark:border-[#323238]">
          <span className="text-[10px] text-charcoal-400 dark:text-zinc-400 uppercase font-semibold block">
            Families Joined
          </span>
          <span className="font-bold text-navy-800 dark:text-white">
            {profile.successfulReferrals} Families
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-white/70 dark:bg-[#18181c]/60 border border-gray-100 dark:border-[#323238]">
          <span className="text-[10px] text-charcoal-400 dark:text-zinc-400 uppercase font-semibold block">
            Lifetime Credits Earned
          </span>
          <span className="font-bold text-emerald-600 dark:text-amber-400">
            ${profile.earnedCreditsUSD.toFixed(2)} USD
          </span>
        </div>
      </div>

    </div>
  );
}
