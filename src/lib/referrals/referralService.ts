import { ReferralProfile } from '@/lib/types';

export const REFERRAL_CREDIT_AMOUNT_USD = 20;

/**
 * Generate a clean, branded, readable referral code from the user's name or email.
 * E.g. "CLASSLY-NILAY20" or "CLASSLY-JANE20"
 */
export function generateReferralCode(user: any): string {
  if (user?.user_metadata?.referral_code) {
    return user.user_metadata.referral_code;
  }

  const rawName = 
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    user?.email?.split('@')[0] || 
    'FAMILY';

  const cleanName = rawName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'STUDY';
  const salt = user?.id ? user.id.slice(0, 3).toUpperCase() : '20';
  return `CLASSLY-${cleanName}${salt}`;
}

/**
 * Build share URLs for WhatsApp, Email, and direct link
 */
export function getReferralShareData(referralCode: string, parentName?: string) {
  const baseUrl = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || 'https://classly-edu.vercel.app');

  const referralLink = `${baseUrl}/register/student?ref=${encodeURIComponent(referralCode)}`;
  const sender = parentName ? `${parentName} via Classly` : 'Classly';

  const whatsappMessage = 
    `Hi! I found amazing verified 1-on-1 K-12 tutors on Classly for math and science. ` +
    `Use my link to claim a $20 welcome credit toward your child's first lesson: ${referralLink}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  const emailSubject = `$20 Tutoring Gift Credit from ${sender} on Classly`;
  const emailBody = 
    `Hi there,\n\n` +
    `I wanted to share Classly with you — it's an online tutoring marketplace with rigorously verified educators from IITs and top universities for K-12 and AP classes.\n\n` +
    `Here is a $20 credit towards your child's first live lesson:\n` +
    `${referralLink}\n\n` +
    `Your $20 welcome discount will apply automatically when you sign up.\n\n` +
    `Best regards,\n${sender}`;

  const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return {
    referralLink,
    whatsappUrl,
    whatsappMessage,
    emailUrl,
    emailSubject,
    emailBody,
  };
}

/**
 * Format fallback referral profile if user doesn't have metadata yet
 */
export function getInitialReferralProfile(user: any): ReferralProfile {
  const code = generateReferralCode(user);
  const { referralLink } = getReferralShareData(code, user?.user_metadata?.full_name);

  const existingMeta = user?.user_metadata?.referral_profile;
  if (existingMeta) {
    return {
      ...existingMeta,
      referralCode: existingMeta.referralCode || code,
      referralLink: existingMeta.referralLink || referralLink,
    };
  }

  // Check if user has received a welcome referral credit
  const receivedWelcomeCredit = user?.user_metadata?.applied_referral_code ? 20 : 0;

  return {
    referralCode: code,
    referralLink,
    totalInvited: 0,
    successfulReferrals: 0,
    earnedCreditsUSD: receivedWelcomeCredit,
    availableCreditsUSD: receivedWelcomeCredit,
    history: receivedWelcomeCredit > 0 ? [
      {
        referredUserName: 'Welcome Referral Bonus',
        date: 'Account Creation',
        creditAmount: 20,
        status: 'rewarded',
      }
    ] : [],
  };
}
