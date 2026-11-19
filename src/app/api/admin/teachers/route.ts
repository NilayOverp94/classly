import { NextResponse } from 'next/server';
import { sendTeacherApplicationStatusEmail } from '@/lib/resend/client';
import { getSupabaseAdminConfig, isAdminEmail } from '@/lib/supabase/admin';

// GET: Fetch all educator applications (pending and approved)
export async function GET(request: Request) {
  try {
    const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();
    const adminUrl = `${supabaseUrl}/auth/v1/admin/users`;
    const res = await fetch(adminUrl, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: 'Failed to fetch users from database.', details: err }, { status: 500 });
    }

    const data = await res.json();
    const allUsers = data.users || [];

    const pending: any[] = [];
    const approved: any[] = [];

    for (const u of allUsers) {
      const meta = u.user_metadata || {};
      const email = (u.email || '').toLowerCase().trim();

      // Skip platform administrators
      if (isAdminEmail(email)) {
        continue;
      }

      // Check if user is an educator / applicant
      const isTeacher = meta.role === 'teacher' || 
                        meta.teaching_subjects || 
                        meta.hourly_rate || 
                        meta.application_id || 
                        meta.teacher_status;

      if (!isTeacher) continue;

      const applicantName = meta.full_name || meta.name || 'Educator Applicant';
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(applicantName)}&background=0B121E&color=ffffff&size=256&bold=true`;

      const teacherObj = {
        id: u.id,
        user_id: u.id,
        name: applicantName,
        full_name: applicantName,
        email: u.email,
        avatar_url: meta.avatar_url || meta.picture || defaultAvatar,
        headline: meta.headline || 'Verified Educator',
        bio: meta.bio || 'Experienced educator focused on mastery of Mathematics and Computer Science.',
        subjects: meta.teaching_subjects || meta.subjects || ['Mathematics'],
        grades: meta.teaching_grades || meta.grades || ['Grade 8', 'Grade 9', 'Grade 10'],
        education: meta.education || meta.qualifications || 'Master of Science / Degree',
        experience: `${meta.years_experience || 3} years teaching`,
        years_experience: Number(meta.years_experience) || 3,
        hourlyRate: Number(meta.hourly_rate) || 25,
        hourly_rate: Number(meta.hourly_rate) || 25,
        teachingFormat: meta.teaching_format || 'both',
        teaching_format: meta.teaching_format || 'both',
        city: meta.city || 'India',
        country: meta.country || 'India',
        submittedAt: new Date(meta.applied_at || u.created_at).toLocaleDateString(),
        created_at: meta.applied_at || u.created_at,
        applicationId: meta.application_id || `TUT-${u.id.slice(0, 4).toUpperCase()}`,
        status: meta.teacher_status || 'pending',
        rating: 5.0,
        review_count: 0,
        total_hours_taught: 0,
        languages: ['English'],
      };

      if (meta.teacher_status === 'approved') {
        approved.push(teacherObj);
      } else {
        pending.push(teacherObj);
      }
    }

    return NextResponse.json({
      success: true,
      pending,
      approved,
      counts: {
        pending: pending.length,
        approved: approved.length,
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error loading admin data.' }, { status: 500 });
  }
}

// POST: Approve or reject teacher application
export async function POST(request: Request) {
  try {
    const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();
    const body = await request.json();
    const { userId, action, notes } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action are required.' }, { status: 400 });
    }

    const adminUrl = `${supabaseUrl}/auth/v1/admin/users/${userId}`;

    // 1. Fetch current user metadata
    const userRes = await fetch(adminUrl, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
      cache: 'no-store',
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
    }

    const userData = await userRes.json();
    const currentMeta = userData.user_metadata || {};
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // 2. Update user metadata with new teacher_status
    const updateRes = await fetch(adminUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_metadata: {
          ...currentMeta,
          role: 'teacher',
          teacher_status: newStatus,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes || '',
        },
      }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      return NextResponse.json({ error: 'Failed to update user status.', details: err }, { status: 500 });
    }

    // 3. Dispatch automated notification email via Resend
    try {
      if (userData.email) {
        await sendTeacherApplicationStatusEmail({
          to: userData.email,
          teacherName: currentMeta.full_name || 'Educator',
          status: newStatus as 'approved' | 'rejected',
          notes: notes,
        });
      }
    } catch (e) {
      console.warn('Resend notification dispatch failed:', e);
    }

    return NextResponse.json({
      success: true,
      userId,
      status: newStatus,
      message: `Educator application successfully ${newStatus}.`,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error processing action.' }, { status: 500 });
  }
}
