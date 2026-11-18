import { NextResponse } from 'next/server';
import { sendTeacherApplicationStatusEmail } from '@/lib/resend/client';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isooxdepfamnufwglosa.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzb294ZGVwZmFtbnVmd2dsb3NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDU5MTQ1MSwiZXhwIjoyMTEwMTY3NDUxfQ.0Tgs5rBFTtsAoFjEqlzLxSbJMJ3IXv3Xiol3G78zobo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      fullName, 
      phone,
      city,
      country,
      subjects,
      grades,
      experienceYears,
      education,
      hourlyRate,
      teachingFormat,
      bio
    } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanName = (fullName || 'Educator Applicant').trim();

    if (!cleanEmail) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const isAdmin = cleanEmail === 'milayraj713@gmail.com' || cleanEmail === 'nilayraj713@gmail.com';
    if (isAdmin) {
      return NextResponse.json({
        error: 'This email is reserved for platform administration. Please use an educator email.',
      }, { status: 403 });
    }

    const adminUrl = `${SUPABASE_URL}/auth/v1/admin/users`;
    const applicationId = `TUT-${Math.floor(1000 + Math.random() * 9000)}`;

    const applicationMeta = {
      role: 'teacher',
      teacher_status: 'pending',
      application_id: applicationId,
      full_name: cleanName,
      name: cleanName,
      phone: phone || '',
      city: city || 'India',
      country: country || 'India',
      teaching_subjects: Array.isArray(subjects) ? subjects : [subjects || 'Mathematics'],
      teaching_grades: Array.isArray(grades) ? grades : [grades || 'Grade 8'],
      years_experience: Number(experienceYears) || 3,
      education: education || 'University Degree',
      bio: bio || '',
      hourly_rate: Number(hourlyRate) || 25,
      teaching_format: teachingFormat || 'both',
      applied_at: new Date().toISOString(),
      onboarding_completed: true,
    };

    // 1. Check if user already exists in Supabase
    const listRes = await fetch(adminUrl, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      cache: 'no-store',
    });

    let existingUserId: string | null = null;
    let existingMeta: any = {};

    if (listRes.ok) {
      const listData = await listRes.json();
      const existingUser = (listData.users || []).find((u: any) => (u.email || '').toLowerCase() === cleanEmail);
      if (existingUser) {
        existingUserId = existingUser.id;
        existingMeta = existingUser.user_metadata || {};
      }
    }

    let finalUserId: string;

    if (existingUserId) {
      // 2a. Update existing user's record with the teacher application details
      const updatePayload: any = {
        user_metadata: {
          ...existingMeta,
          ...applicationMeta,
        },
      };

      if (cleanPassword && cleanPassword.length >= 6) {
        updatePayload.password = cleanPassword;
        updatePayload.email_confirm = true;
      }

      const updateRes = await fetch(`${adminUrl}/${existingUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!updateRes.ok) {
        const err = await updateRes.text();
        return NextResponse.json({ error: 'Failed to update existing teacher application.', details: err }, { status: 500 });
      }

      finalUserId = existingUserId;

    } else {
      // 2b. Create brand new educator account with password
      if (!cleanPassword || cleanPassword.length < 6) {
        return NextResponse.json({ error: 'A password of at least 6 characters is required.' }, { status: 400 });
      }

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
          user_metadata: applicationMeta,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        return NextResponse.json({ error: createData.msg || createData.error || 'Failed to create teacher application.' }, { status: 400 });
      }

      finalUserId = createData.id;
    }

    // 3. Dispatch application received email via Resend
    try {
      await sendTeacherApplicationStatusEmail({
        to: cleanEmail,
        teacherName: cleanName,
        status: 'received',
      });
    } catch (e) {
      console.warn('Failed to send application confirmation email:', e);
    }

    return NextResponse.json({
      success: true,
      applicationId,
      userId: finalUserId,
      email: cleanEmail,
      message: 'Teacher application registered successfully.',
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error processing application.' }, { status: 500 });
  }
}
