import { NextResponse } from 'next/server';
import { getSupabaseAdminConfig } from '@/lib/supabase/admin';

// Helper for admin config
function getAdminAuth() {
  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();
  return {
    SUPABASE_URL: supabaseUrl,
    SERVICE_KEY: serviceRoleKey,
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
    },
  };
}

// GET: Fetch teacher's published classes or all published classes
export async function GET(request: Request) {
  try {
    const { SUPABASE_URL, SERVICE_KEY } = getAdminAuth();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    const adminUrl = `${SUPABASE_URL}/auth/v1/admin/users`;
    const res = await fetch(adminUrl, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ classes: [] });
    }

    const data = await res.json();
    const allUsers: any[] = data.users || [];

    if (teacherId) {
      const teacher = allUsers.find((u: any) => u.id === teacherId);
      const classes = teacher?.user_metadata?.teacher_classes || [];
      return NextResponse.json({ success: true, classes });
    }

    // Otherwise collect all published classes across approved teachers
    const allClasses: any[] = [];
    allUsers.forEach((u: any) => {
      const meta = u.user_metadata || {};
      if (Array.isArray(meta.teacher_classes)) {
        meta.teacher_classes.forEach((cls: any) => {
          allClasses.push({
            ...cls,
            teacher_id: u.id,
            teacher_name: meta.full_name || meta.name || 'Verified Educator',
            teacher_avatar: meta.avatar_url || meta.picture || '',
          });
        });
      }
    });

    return NextResponse.json({ success: true, classes: allClasses });
  } catch (err: any) {
    console.error('Fetch classes error:', err);
    return NextResponse.json({ classes: [] });
  }
}

// POST: Publish a new class for a teacher and save to Supabase
export async function POST(request: Request) {
  try {
    const { SUPABASE_URL, SERVICE_KEY } = getAdminAuth();
    const body = await request.json();
    const {
      teacherId,
      title,
      subject = 'Mathematics',
      gradeLevel = 'Grade 10',
      price = 25,
      dateTime = 'Tomorrow at 05:00 PM EST',
      durationMinutes = 60,
      maxStudents = 6,
      description = '',
    } = body;

    if (!teacherId || !title) {
      return NextResponse.json({ error: 'Teacher ID and class title are required.' }, { status: 400 });
    }

    // 1. Fetch current teacher user
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${teacherId}`, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      cache: 'no-store',
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: 'Educator account not found.' }, { status: 404 });
    }

    const teacherUser = await userRes.json();
    const meta = teacherUser.user_metadata || {};
    const existingClasses: any[] = Array.isArray(meta.teacher_classes) ? meta.teacher_classes : [];

    const newClassItem = {
      id: `cls-${Date.now()}`,
      teacher_id: teacherId,
      title: title.trim(),
      subject: subject.trim(),
      gradeLevel: gradeLevel.trim(),
      price: Number(price) || 25,
      dateTime: dateTime.trim(),
      durationMinutes: Number(durationMinutes) || 60,
      maxStudents: Number(maxStudents) || 6,
      enrolledCount: 0,
      description: description.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedClasses = [newClassItem, ...existingClasses];

    // 2. Persist updated classes array in teacher's Supabase metadata
    const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${teacherId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_metadata: {
          ...meta,
          teacher_classes: updatedClasses,
        },
      }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.json();
      throw new Error(err.message || 'Failed to update educator profile.');
    }

    return NextResponse.json({
      success: true,
      class: newClassItem,
      classes: updatedClasses,
      message: 'Class successfully published and saved to account.',
    });

  } catch (err: any) {
    console.error('Create class error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}

// DELETE: Remove a class from teacher's schedule
export async function DELETE(request: Request) {
  try {
    const { SUPABASE_URL, SERVICE_KEY } = getAdminAuth();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const classId = searchParams.get('classId');

    if (!teacherId || !classId) {
      return NextResponse.json({ error: 'teacherId and classId are required.' }, { status: 400 });
    }

    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${teacherId}`, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      cache: 'no-store',
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: 'Educator not found.' }, { status: 404 });
    }

    const teacherUser = await userRes.json();
    const meta = teacherUser.user_metadata || {};
    const existingClasses: any[] = Array.isArray(meta.teacher_classes) ? meta.teacher_classes : [];

    const updatedClasses = existingClasses.filter((c: any) => c.id !== classId);

    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${teacherId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_metadata: {
          ...meta,
          teacher_classes: updatedClasses,
        },
      }),
    });

    return NextResponse.json({
      success: true,
      classes: updatedClasses,
      message: 'Class successfully removed.',
    });

  } catch (err: any) {
    console.error('Delete class error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
