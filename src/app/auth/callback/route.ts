import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const role = searchParams.get('role');
  const next = searchParams.get('next');

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const email = (data.user.email || '').toLowerCase().trim();

      // Automatic Admin detection
      if (email === 'milayraj713@gmail.com' || email === 'nilayraj713@gmail.com') {
        return NextResponse.redirect(`${origin}/admin`);
      }

      // Check if user has completed required profile setup
      const hasCompletedOnboarding = Boolean(data.user.user_metadata?.onboarding_completed);
      if (!hasCompletedOnboarding) {
        return NextResponse.redirect(`${origin}/onboarding?role=${role || 'student'}`);
      }

      // Check role
      if (role === 'teacher' || data.user.user_metadata?.role === 'teacher') {
        return NextResponse.redirect(`${origin}/dashboard/teacher`);
      }

      return NextResponse.redirect(`${origin}/dashboard/student`);
    }
  }

  // Fallback redirection
  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/dashboard/student`);
}
