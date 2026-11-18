import { NextResponse } from 'next/server';
import { sendBookingConfirmationEmail, sendTeacherBookingNotificationEmail } from '@/lib/resend/client';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isooxdepfamnufwglosa.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzb294ZGVwZmFtbnVmd2dsb3NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDU5MTQ1MSwiZXhwIjoyMTEwMTY3NDUxfQ.0Tgs5rBFTtsAoFjEqlzLxSbJMJ3IXv3Xiol3G78zobo';

// POST: Create a new booking, update teacher and student records, and send email notifications
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tutorId,
      format = 'one_on_one',
      date = '2026-11-20',
      timeSlot = '05:00 PM EST',
      studentNotes = '',
      studentName = 'Student',
      studentEmail = '',
      studentId = '',
    } = body;

    if (!tutorId) {
      return NextResponse.json({ error: 'Educator ID is required.' }, { status: 400 });
    }

    // 1. Fetch users from Supabase Auth Admin
    const adminUrl = `${SUPABASE_URL}/auth/v1/admin/users`;
    const res = await fetch(adminUrl, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to access authentication database.' }, { status: 500 });
    }

    const data = await res.json();
    const allUsers: any[] = data.users || [];

    // 2. Find the teacher
    const teacherUser = allUsers.find(
      (u: any) => u.id === tutorId || (u.user_metadata?.application_id && u.user_metadata.application_id === tutorId)
    );

    if (!teacherUser) {
      return NextResponse.json({ error: 'Educator not found.' }, { status: 404 });
    }

    const teacherMeta = teacherUser.user_metadata || {};
    const teacherName = teacherMeta.full_name || teacherMeta.name || 'Verified Educator';
    const teacherEmail = teacherUser.email;
    const hourlyRate = Number(teacherMeta.hourly_rate) || 25;
    const platformFee = 4.50;
    const totalAmount = hourlyRate + platformFee;
    const subject = teacherMeta.teaching_subjects?.[0] || 'Mathematics';

    const bookingId = `book-${Math.floor(100000 + Math.random() * 900000)}`;
    const meetingUrl = `/classroom/room-${bookingId}`;
    const formattedTime = `${date} at ${timeSlot}`;

    const newBooking = {
      id: bookingId,
      bookingId: bookingId,
      teacher_id: teacherUser.id,
      teacher_name: teacherName,
      teacher_email: teacherEmail,
      teacher_avatar: teacherMeta.avatar_url || teacherMeta.picture || '',
      student_id: studentId || '',
      student_name: studentName,
      student_email: studentEmail,
      subject: subject,
      format: format,
      date: date,
      time_slot: timeSlot,
      formatted_time: formattedTime,
      duration_minutes: 60,
      hourly_rate: hourlyRate,
      platform_fee: platformFee,
      total_amount: totalAmount,
      notes: studentNotes,
      status: 'confirmed',
      meeting_url: meetingUrl,
      created_at: new Date().toISOString(),
      viewed_by_teacher: false,
    };

    // 3. Save to Teacher's Account in Supabase Auth
    const existingTeacherBookings: any[] = Array.isArray(teacherMeta.bookings) ? teacherMeta.bookings : [];
    const updatedTeacherBookings = [newBooking, ...existingTeacherBookings];

    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${teacherUser.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_metadata: {
          ...teacherMeta,
          bookings: updatedTeacherBookings,
          total_hours_taught: (Number(teacherMeta.total_hours_taught) || 0) + 1,
        },
      }),
    });

    // 4. Save to Student's Account if student is registered/logged in
    if (studentId) {
      const studentUser = allUsers.find((u: any) => u.id === studentId);
      if (studentUser) {
        const studentMeta = studentUser.user_metadata || {};
        const existingStudentBookings: any[] = Array.isArray(studentMeta.bookings) ? studentMeta.bookings : [];
        const updatedStudentBookings = [newBooking, ...existingStudentBookings];

        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${studentId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'apikey': SERVICE_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_metadata: {
              ...studentMeta,
              bookings: updatedStudentBookings,
            },
          }),
        });
      }
    }

    // 5. Send Email Notifications
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://classly-doomsday23.vercel.app';
    const absoluteMeetingUrl = `${appUrl}${meetingUrl}`;

    // Send alert to teacher
    if (teacherEmail) {
      sendTeacherBookingNotificationEmail({
        to: teacherEmail,
        teacherName: teacherName,
        studentName: studentName,
        subject: subject,
        startTime: formattedTime,
        hourlyRate: hourlyRate,
        meetingUrl: absoluteMeetingUrl,
        notes: studentNotes,
      }).catch((e) => console.error('Teacher email error:', e));
    }

    // Send confirmation to student
    if (studentEmail) {
      sendBookingConfirmationEmail({
        to: studentEmail,
        studentName: studentName,
        teacherName: teacherName,
        subject: subject,
        startTime: formattedTime,
        meetingUrl: absoluteMeetingUrl,
      }).catch((e) => console.error('Student email error:', e));
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
      message: 'Booking confirmed and educator notified.',
    });

  } catch (err: any) {
    console.error('Booking creation error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}

// GET: Retrieve bookings for a specific user (role: teacher | student)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role') || 'teacher';

    if (!userId) {
      return NextResponse.json({ bookings: [] });
    }

    const adminUrl = `${SUPABASE_URL}/auth/v1/admin/users`;
    const res = await fetch(adminUrl, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ bookings: [] });
    }

    const data = await res.json();
    const allUsers: any[] = data.users || [];

    const currentUser = allUsers.find((u: any) => u.id === userId);
    if (!currentUser) {
      return NextResponse.json({ bookings: [] });
    }

    const meta = currentUser.user_metadata || {};
    let userBookings: any[] = Array.isArray(meta.bookings) ? meta.bookings : [];

    // Also scan all other users to pick up bookings where teacher_id === userId or student_id === userId
    for (const otherUser of allUsers) {
      if (otherUser.id === userId) continue;
      const otherMeta = otherUser.user_metadata || {};
      const otherBookings: any[] = Array.isArray(otherMeta.bookings) ? otherMeta.bookings : [];
      for (const b of otherBookings) {
        if (role === 'teacher' && b.teacher_id === userId) {
          if (!userBookings.some((ub: any) => ub.id === b.id)) {
            userBookings.push(b);
          }
        } else if (role === 'student' && (b.student_id === userId || (currentUser.email && b.student_email === currentUser.email))) {
          if (!userBookings.some((ub: any) => ub.id === b.id)) {
            userBookings.push(b);
          }
        }
      }
    }

    // Sort by created_at descending (newest first)
    userBookings.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return NextResponse.json({
      success: true,
      bookings: userBookings,
    });

  } catch (err: any) {
    return NextResponse.json({ bookings: [] });
  }
}
