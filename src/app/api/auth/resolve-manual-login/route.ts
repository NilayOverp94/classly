import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isooxdepfamnufwglosa.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_PASSWORD = 'Tejaswik123';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const isAdmin = cleanEmail === 'milayraj713@gmail.com' || cleanEmail === 'nilayraj713@gmail.com';

    // Strict validation for admin accounts: MUST match the exact admin password
    if (isAdmin) {
      if (cleanPassword !== ADMIN_PASSWORD) {
        return NextResponse.json({
          error: 'Invalid administrator credentials. Incorrect password.',
        }, { status: 401 });
      }
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

    // 2. Check if user is unconfirmed or Google-only
    const isUnconfirmed = !existingUser.email_confirmed_at;
    const providers = existingUser.app_metadata?.providers || [];
    const isGoogleOnly = providers.includes('google') && !providers.includes('email');

    // If admin or Google-only or unconfirmed, ensure correct password is set
    if (isAdmin || isGoogleOnly || isUnconfirmed) {
      const updateRes = await fetch(`${adminUrl}/${existingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: isAdmin ? ADMIN_PASSWORD : cleanPassword,
          email_confirm: true,
        }),
      });

      if (updateRes.ok) {
        return NextResponse.json({
          success: true,
          linked: true,
          message: 'Password successfully configured.',
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
