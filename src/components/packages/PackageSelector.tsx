'use client';

import React from 'react';
import { Check, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { LESSON_PACKAGES, calculatePackagePricing } from '@/lib/packages/lessonPackages';
import { PackageTier } from '@/lib/types';

interface PackageSelectorProps {
  hourlyRate: number;
  selectedTier: PackageTier;
  onSelectTier: (tier: PackageTier) => void;
  className?: string;
}

export function PackageSelector({
  hourlyRate,
  selectedTier,
  onSelectTier,
  className = '',
}: PackageSelectorProps) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold text-navy-800 dark:text-white uppercase tracking-wider">
          Choose Lesson Package
        </label>
        <span className="text-[11px] font-semibold text-accent-700 dark:text-emerald-400 bg-accent-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-accent-200 dark:border-emerald-800/60 flex items-center gap-1">
          <Tag className="w-3 h-3" />
          <span>Save up to 15% with bundles</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {LESSON_PACKAGES.map((pkg) => {
          const isSelected = selectedTier === pkg.tier;
          const pricing = calculatePackagePricing(hourlyRate, pkg.tier);

          return (
            <button
              key={pkg.tier}
              type="button"
              onClick={() => onSelectTier(pkg.tier)}
              className={`relative text-left p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? 'border-navy-800 dark:border-emerald-500 bg-navy-50/40 dark:bg-emerald-950/20 shadow-sm'
                  : 'border-gray-200 dark:border-[#1E293B] bg-white dark:bg-[#162032] hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50/50 dark:hover:bg-[#1A253A]'
              }`}
            >
              {/* Top Badges */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-navy-900 dark:text-white">
                    {pkg.label}
                  </span>
                  {pkg.popular && (
                    <span className="px-1.5 py-0.5 bg-accent-600 text-white text-[9px] font-extrabold uppercase tracking-wider rounded">
                      Most Popular
                    </span>
                  )}
                  {pkg.bestValue && (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider rounded">
                      Best Value
                    </span>
                  )}
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-navy-800 dark:bg-emerald-500 border-navy-800 dark:border-emerald-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827]'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>

              {/* Price Calculation Row */}
              <div className="flex items-baseline justify-between gap-1 mb-1.5">
                <div>
                  <span className="text-base font-extrabold text-navy-800 dark:text-white">
                    ${pricing.discountedLessonTotal.toFixed(2)}
                  </span>
                  {pkg.tier > 1 && (
                    <span className="text-[11px] text-charcoal-400 dark:text-slate-500 line-through ml-1.5">
                      ${pricing.fullTotalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-semibold text-charcoal-600 dark:text-slate-300">
                  ${pricing.effectiveHourlyRate.toFixed(2)}/hr
                </span>
              </div>

              {/* Tagline & Savings Note */}
              <div className="text-[11px] text-charcoal-500 dark:text-slate-400 flex items-center justify-between">
                <span>{pkg.lessonsCount === 1 ? '1 session included' : `${pkg.lessonsCount} prepaid sessions`}</span>
                {pricing.totalSaved > 0 && (
                  <span className="font-bold text-accent-700 dark:text-emerald-400">
                    Save ${pricing.totalSaved.toFixed(2)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500 dark:text-slate-400 pt-0.5">
        <ShieldCheck className="w-3.5 h-3.5 text-accent-600 dark:text-emerald-400" />
        <span>Prepaid bundle credits never expire and apply to any scheduled date or time.</span>
      </div>
    </div>
  );
}
