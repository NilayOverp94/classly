import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isooxdepfamnufwglosa.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzb294ZGVwZmFtbnVmd2dsb3NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDU5MTQ1MSwiZXhwIjoyMTEwMTY3NDUxfQ.0Tgs5rBFTtsAoFjEqlzLxSbJMJ3IXv3Xiol3G78zobo';

export async function GET() {
  try {
    const adminUrl = `${SUPABASE_URL}/auth/v1/admin/users`;
    const res = await fetch(adminUrl, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
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
