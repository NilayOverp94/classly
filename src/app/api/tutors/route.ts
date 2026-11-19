import { NextResponse } from 'next/server';
import { getSupabaseAdminConfig } from '@/lib/supabase/admin';

export async function GET() {
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
      return NextResponse.json({ tutors: [] });
    }

    const data = await res.json();
    const allUsers = data.users || [];

    const approvedTutors = allUsers
      .filter((u: any) => {
        const meta = u.user_metadata || {};
        const isApproved = meta.teacher_status === 'approved';
        return isApproved;
      })
      .map((u: any) => {
        const meta = u.user_metadata || {};
        const fullName = meta.full_name || meta.name || 'Verified Educator';
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0B121E&color=ffffff&size=256&bold=true`;
        return {
          id: u.id,
          user_id: u.id,
          full_name: fullName,
          avatar_url: meta.avatar_url || meta.picture || defaultAvatar,
          headline: meta.headline || 'Verified Classly Educator',
          bio: meta.bio || '',
          years_experience: Number(meta.years_experience) || 3,
          hourly_rate: Number(meta.hourly_rate) || 25,
          teaching_format: meta.teaching_format || 'both',
          status: 'approved',
          qualifications: [],
          education: meta.education || meta.qualifications || 'University Degree',
          teaching_methodology: '',
          rating: 5.0,
          review_count: 0,
          total_hours_taught: 0,
          city: meta.city || 'India',
          country: meta.country || 'India',
          subjects: meta.teaching_subjects || meta.subjects || ['Mathematics'],
          grades: meta.teaching_grades || meta.grades || ['Grade 8', 'Grade 9', 'Grade 10'],
          languages: ['English'],
        };
      });

    return NextResponse.json({ tutors: approvedTutors });

  } catch (err: any) {
    return NextResponse.json({ tutors: [] });
  }
}
