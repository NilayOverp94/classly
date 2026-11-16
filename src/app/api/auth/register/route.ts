import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isooxdepfamnufwglosa.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, role, studentName, studentGrade, learningGoals } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanName = (fullName || studentName || 'Learner').trim();
    const userRole = role === 'teacher' ? 'teacher' : 'student';

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const isAdmin = cleanEmail === 'milayraj713@gmail.com' || cleanEmail === 'nilayraj713@gmail.com';

    if (isAdmin) {
      return NextResponse.json({
        error: 'This email is reserved for platform administration. Please switch to Sign In.',
      }, { status: 403 });
    }

    // 1. Check if user already exists
    const adminUrl = `${SUPABASE_URL}/auth/v1/admin/users`;
    const checkRes = await fetch(adminUrl, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      cache: 'no-store',
    });

    if (checkRes.ok) {
      const data = await checkRes.json();
      const existingUser = (data.users || []).find((u: any) => (u.email || '').toLowerCase() === cleanEmail);
      
      if (existingUser) {
        // If user already exists through Google OAuth and has no password, link their password now!
        const providers = existingUser.app_metadata?.providers || [];
        if (providers.includes('google') && !providers.includes('email')) {
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
              user_metadata: {
                ...existingUser.user_metadata,
                full_name: cleanName,
                role: isAdmin ? 'admin' : userRole,
                onboarding_completed: true,
              },
            }),
          });

          if (updateRes.ok) {
            return NextResponse.json({ 
              success: true, 
              message: 'Account updated with password. You can now log in.' 
            });
          }
        }

        return NextResponse.json({ 
          error: 'An account with this email already exists. Please switch to Sign In.' 
        }, { status: 409 });
      }
    }

    // 2. Create the user with auto-confirmed email
    const createRes = await fetch(adminUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        password: cleanPassword,
        email_confirm: true,
        user_metadata: {
          full_name: cleanName,
          name: cleanName,
          role: isAdmin ? 'admin' : userRole,
          student_name: studentName || cleanName,
          student_grade: studentGrade || 'Grade 8',
          learning_goals: learningGoals || '',
          onboarding_completed: true,
        },
      }),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      return NextResponse.json({ 
        error: createData.msg || createData.error || 'Failed to create account.' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: createData.id,
        email: createData.email,
        role: isAdmin ? 'admin' : userRole,
      },
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error during registration.' }, { status: 500 });
  }
}
