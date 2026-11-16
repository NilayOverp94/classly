import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isooxdepfamnufwglosa.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // 1. Fetch user list from admin API
    const adminUrl = `${SUPABASE_URL}/auth/v1/admin/users`;
    const usersRes = await fetch(adminUrl, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      cache: 'no-store',
    });

    if (!usersRes.ok) {
      return NextResponse.json({ error: 'Auth service temporarily unavailable.' }, { status: 500 });
    }

    const { users } = await usersRes.json();
    const existingUser = (users || []).find((u: any) => (u.email || '').toLowerCase() === cleanEmail);

    if (!existingUser) {
      return NextResponse.json({
        notFound: true,
        message: 'No account is registered under this email address. Please create an account.',
      }, { status: 404 });
    }

    // 2. Check if user is unconfirmed (e.g. from a previous standard signup)
    const isUnconfirmed = !existingUser.email_confirmed_at;

    // 3. Check if user only has Google provider
    const providers = existingUser.app_metadata?.providers || [];
    const isGoogleOnly = providers.includes('google') && !providers.includes('email');

    // If user is Google-only OR unconfirmed, update their password and confirm them so manual login works immediately!
    if (isGoogleOnly || isUnconfirmed) {
      const updateRes = await fetch(`${adminUrl}/${existingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: cleanPassword,
          email_confirm: true,
        }),
      });

      if (updateRes.ok) {
        return NextResponse.json({
          success: true,
          linked: true,
          message: 'Password successfully configured for manual login.',
        });
      }
    }

    // If user has an established password and confirmation, but signInWithPassword failed,
    // it means the password they typed was incorrect!
    return NextResponse.json({
      error: 'Incorrect password. If you originally signed in with Google, please use the Google button above.',
    }, { status: 401 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error resolving authentication.' }, { status: 500 });
  }
}
