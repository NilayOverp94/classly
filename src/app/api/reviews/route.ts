import { NextResponse } from 'next/server';
import { getSupabaseAdminConfig, createAdminClient } from '@/lib/supabase/admin';
import { ReviewItem } from '@/lib/types';

function getAdminAuth() {
  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();
  return {
    adminUrl: `${supabaseUrl}/auth/v1/admin/users`,
    supabaseUrl,
    serviceRoleKey,
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
    },
  };
}

// GET: Fetch reviews for a specific tutor, booking, or student
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');
    const bookingId = searchParams.get('bookingId');
    const studentId = searchParams.get('studentId');

    const { adminUrl, headers } = getAdminAuth();
    const res = await fetch(adminUrl, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ 
        success: false, 
        reviews: [], 
        stats: { total: 0, averageRating: 5.0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } } 
      });
    }

    const data = await res.json();
    const allUsers: any[] = data.users || [];

    // 1. Check if a specific booking has been reviewed
    if (bookingId) {
      for (const u of allUsers) {
        const meta = u.user_metadata || {};
        const reviews: ReviewItem[] = Array.isArray(meta.reviews) ? meta.reviews : [];
        const match = reviews.find((r) => r.booking_id === bookingId);
        if (match) {
          return NextResponse.json({ success: true, reviewed: true, review: match });
        }
        const bookings: any[] = Array.isArray(meta.bookings) ? meta.bookings : [];
        const booked = bookings.find((b) => b.id === bookingId || b.bookingId === bookingId);
        if (booked?.reviewed) {
          return NextResponse.json({ success: true, reviewed: true, review: null });
        }
      }
      return NextResponse.json({ success: true, reviewed: false, review: null });
    }

    // 2. Query reviews for a specific teacher
    if (tutorId) {
      const teacherUser = allUsers.find((u: any) => u.id === tutorId || u.user_metadata?.application_id === tutorId);
      const meta = teacherUser?.user_metadata || {};
      const reviews: ReviewItem[] = Array.isArray(meta.reviews) ? meta.reviews : [];

      // Sort newest first
      reviews.sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime());

      const total = reviews.length;
      const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let sum = 0;

      reviews.forEach((r) => {
        const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
        distribution[star] = (distribution[star] || 0) + 1;
        sum += star;
      });

      const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 5.0;

      return NextResponse.json({
        success: true,
        reviews,
        stats: {
          total,
          averageRating,
          distribution,
        },
      });
    }

    // 3. Query reviews submitted by a student
    if (studentId) {
      const studentReviews: ReviewItem[] = [];
      for (const u of allUsers) {
        const meta = u.user_metadata || {};
        const reviews: ReviewItem[] = Array.isArray(meta.reviews) ? meta.reviews : [];
        reviews.forEach((r) => {
          if (r.student_id === studentId) {
            studentReviews.push(r);
          }
        });
      }
      return NextResponse.json({ success: true, reviews: studentReviews });
    }

    return NextResponse.json({ success: true, reviews: [] });
  } catch (err: any) {
    console.error('Error fetching reviews:', err);
    return NextResponse.json({ 
      success: false, 
      reviews: [], 
      stats: { total: 0, averageRating: 5.0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } } 
    });
  }
}

// POST: Submit a verified post-lesson student review
export async function POST(request: Request) {
  try {
    const { adminUrl, supabaseUrl, serviceRoleKey, headers } = getAdminAuth();
    const body = await request.json();

    const {
      bookingId,
      tutorId,
      studentId,
      studentName = 'Verified Student',
      studentGrade = 'K-12 Student',
      studentAvatar = '',
      rating = 5,
      comment = '',
      subject = 'General Tutoring',
      tags = [],
    } = body;

    if (!tutorId) {
      return NextResponse.json({ error: 'Educator ID is required.' }, { status: 400 });
    }

    const cleanRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    const cleanComment = (comment || '').trim();

    // 1. Fetch users from Supabase Auth
    const res = await fetch(adminUrl, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to access user registry.' }, { status: 500 });
    }

    const data = await res.json();
    const allUsers: any[] = data.users || [];

    const teacherUser = allUsers.find((u: any) => u.id === tutorId || u.user_metadata?.application_id === tutorId);
    if (!teacherUser) {
      return NextResponse.json({ error: 'Educator not found.' }, { status: 404 });
    }

    const teacherMeta = teacherUser.user_metadata || {};
    const existingReviews: ReviewItem[] = Array.isArray(teacherMeta.reviews) ? teacherMeta.reviews : [];

    // Check if this booking was already reviewed
    if (bookingId && existingReviews.some((r) => r.booking_id === bookingId)) {
      return NextResponse.json({ error: 'This tutoring lesson has already been reviewed.' }, { status: 400 });
    }

    // 2. Build the new verified review
    const reviewId = `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const newReview: ReviewItem = {
      id: reviewId,
      booking_id: bookingId || undefined,
      teacher_id: teacherUser.id,
      student_id: studentId || undefined,
      student_name: studentName,
      student_avatar: studentAvatar,
      student_grade: studentGrade,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      rating: cleanRating,
      comment: cleanComment,
      subject: subject,
      tags: Array.isArray(tags) ? tags : [],
      created_at: new Date().toISOString(),
    };

    const updatedReviews = [newReview, ...existingReviews];
    const newCount = updatedReviews.length;
    const newRating = Number(
      (updatedReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / newCount).toFixed(1)
    );

    // 3. Update Teacher User Metadata in Supabase Auth
    await fetch(`${supabaseUrl}/auth/v1/admin/users/${teacherUser.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        user_metadata: {
          ...teacherMeta,
          reviews: updatedReviews,
          rating: newRating,
          review_count: newCount,
        },
      }),
    });

    // 4. Update Student Bookings Metadata if studentId is provided
    if (studentId) {
      const studentUser = allUsers.find((u: any) => u.id === studentId);
      if (studentUser) {
        const studentMeta = studentUser.user_metadata || {};
        const studentBookings: any[] = Array.isArray(studentMeta.bookings) ? studentMeta.bookings : [];
        let updated = false;

        const updatedStudentBookings = studentBookings.map((b) => {
          if (b.id === bookingId || b.bookingId === bookingId) {
            updated = true;
            return {
              ...b,
              reviewed: true,
              review_id: reviewId,
              review_rating: cleanRating,
            };
          }
          return b;
        });

        if (updated) {
          await fetch(`${supabaseUrl}/auth/v1/admin/users/${studentId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              user_metadata: {
                ...studentMeta,
                bookings: updatedStudentBookings,
              },
            }),
          });
        }
      }
    }

    // 5. Try inserting into public.reviews table in Supabase Postgres if present
    try {
      const adminClient = createAdminClient();
      await adminClient.from('reviews').insert({
        student_id: studentId || teacherUser.id,
        teacher_id: teacherUser.id,
        booking_id: bookingId || null,
        rating: cleanRating,
        comment: cleanComment,
        is_public: true,
      });
    } catch (e) {
      // Postgres table insert is non-fatal if table not migrated
    }

    return NextResponse.json({
      success: true,
      review: newReview,
      tutorStats: {
        rating: newRating,
        review_count: newCount,
      },
      message: 'Thank you! Your verified review has been published.',
    });
  } catch (err: any) {
    console.error('Review submission error:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit review.' }, { status: 500 });
  }
}
