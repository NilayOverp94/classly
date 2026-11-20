import { LessonPackage, PackageTier } from '@/lib/types';

export const LESSON_PACKAGES: LessonPackage[] = [
  {
    tier: 1,
    lessonsCount: 1,
    discountPercent: 0,
    label: 'Single Lesson',
    tagline: 'Standard 60-min session with zero upfront commitment',
  },
  {
    tier: 5,
    lessonsCount: 5,
    discountPercent: 5,
    label: '5-Lesson Starter Pack',
    tagline: 'Ideal for target test prep & exam review (Save 5%)',
  },
  {
    tier: 10,
    lessonsCount: 10,
    discountPercent: 10,
    label: '10-Lesson Mastery Pack',
    tagline: 'Most Popular for ongoing weekly grade mastery (Save 10%)',
    popular: true,
  },
  {
    tier: 20,
    lessonsCount: 20,
    discountPercent: 15,
    label: '20-Lesson Semester Bundle',
    tagline: 'Best Value for comprehensive term-long tutoring (Save 15%)',
    bestValue: true,
  },
];

export interface PackagePricingResult {
  tier: PackageTier;
  lessonsCount: number;
  discountPercent: number;
  baseHourlyRate: number;
  fullTotalPrice: number;
  discountedLessonTotal: number;
  effectiveHourlyRate: number;
  totalSaved: number;
  platformFee: number;
  finalTotalDue: number;
}

export function calculatePackagePricing(
  hourlyRate: number,
  tier: PackageTier = 1,
  platformFee: number = 4.50
): PackagePricingResult {
  const pkg = LESSON_PACKAGES.find((p) => p.tier === tier) || LESSON_PACKAGES[0];
  const lessonsCount = pkg.lessonsCount;
  const discountPercent = pkg.discountPercent;

  const fullTotalPrice = hourlyRate * lessonsCount;
  const discountMultiplier = 1 - discountPercent / 100;
  const discountedLessonTotal = Math.round(fullTotalPrice * discountMultiplier * 100) / 100;
  const effectiveHourlyRate = Math.round((discountedLessonTotal / lessonsCount) * 100) / 100;
  const totalSaved = Math.max(0, Math.round((fullTotalPrice - discountedLessonTotal) * 100) / 100);
  const finalTotalDue = Math.round((discountedLessonTotal + platformFee) * 100) / 100;

  return {
    tier,
    lessonsCount,
    discountPercent,
    baseHourlyRate: hourlyRate,
    fullTotalPrice,
    discountedLessonTotal,
    effectiveHourlyRate,
    totalSaved,
    platformFee,
    finalTotalDue,
  };
}
