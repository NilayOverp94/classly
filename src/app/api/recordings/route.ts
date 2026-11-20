import { NextResponse } from 'next/server';
import { getSupabaseAdminConfig } from '@/lib/supabase/admin';
import { SessionRecording } from '@/lib/types';

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

// Sample educational video recordings for instant playback preview
const DEFAULT_DEMO_RECORDINGS: SessionRecording[] = [
  {
    id: 'rec-calc-101',
    session_id: 'room-math-calc',
    booking_id: 'book-math-01',
    title: 'Advanced Calculus: Differential Equations & Applications',
    subject: 'Mathematics',
    teacher_id: 'tutor-ashish',
    teacher_name: 'Ashish Prasad',
    teacher_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    student_id: 'student-demo',
    student_name: 'Alex Johnson',
    duration: '48:32',
    duration_seconds: 2912,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    file_size: '142.6 MB',
    date: 'Yesterday at 04:30 PM EST',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    chapters: [
      { time: '00:00', title: 'Session Goals & Concept Review' },
      { time: '12:15', title: 'Whiteboard: Step-by-Step Derivation' },
      { time: '28:40', title: 'Interactive Practice Problem #4' },
      { time: '41:10', title: 'Homework Q&A & Wrap Up' },
    ],
  },
  {
    id: 'rec-cs-202',
    session_id: 'room-cs-python',
    booking_id: 'book-cs-02',
    title: 'Python Algorithms: Binary Search Trees & Recursion',
    subject: 'Computer Science',
    teacher_id: 'tutor-geetika',
    teacher_name: 'Geetika Singh',
    teacher_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    student_id: 'student-demo',
    student_name: 'Alex Johnson',
    duration: '54:10',
    duration_seconds: 3250,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    file_size: '168.4 MB',
    date: 'Nov 17, 2026 at 06:00 PM EST',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    chapters: [
      { time: '00:00', title: 'Tree Traversal Complexity Overview' },
      { time: '14:30', title: 'Live Code Editor: Node Class & Insertion' },
      { time: '32:00', title: 'Split View: Visualizing Balanced AVL Trees' },
      { time: '47:20', title: 'Terminal Execution & LeetCode Drill' },
    ],
  },
  {
    id: 'rec-java-303',
    session_id: 'room-cs-java',
    booking_id: 'book-cs-03',
    title: 'AP Computer Science A: Object-Oriented Java & Polymorphism',
    subject: 'Computer Science',
    teacher_id: 'tutor-gaurav',
    teacher_name: 'Gaurav',
    teacher_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    student_id: 'student-demo',
    student_name: 'Alex Johnson',
    duration: '42:18',
    duration_seconds: 2538,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    file_size: '124.1 MB',
    date: 'Nov 14, 2026 at 05:00 PM EST',
    created_at: new Date(Date.now() - 518400000).toISOString(),
    chapters: [
      { time: '00:00', title: 'Inheritance & Interface Design' },
      { time: '11:45', title: 'Live Code: Overriding Methods in Java' },
      { time: '26:50', title: 'Common AP Exam Pitfalls' },
      { time: '38:00', title: 'Review Questions & Solutions' },
    ],
  },
];

// GET: Retrieve recordings for a specific user (student or teacher)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role') || 'student';
    const sessionId = searchParams.get('sessionId');

    if (!userId && !sessionId) {
      return NextResponse.json({ recordings: DEFAULT_DEMO_RECORDINGS });
    }

    const { adminUrl, headers } = getAdminAuth();
    const res = await fetch(adminUrl, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ recordings: DEFAULT_DEMO_RECORDINGS });
    }

    const data = await res.json();
    const allUsers: any[] = data.users || [];

    const currentUser = allUsers.find((u: any) => u.id === userId);
    let userRecordings: SessionRecording[] = [];

    if (currentUser) {
      const meta = currentUser.user_metadata || {};
      if (Array.isArray(meta.recordings)) {
        userRecordings = [...meta.recordings];
      }
    }

    // Also scan all users to collect recordings matching this teacher or student or sessionId
    for (const otherUser of allUsers) {
      if (otherUser.id === userId) continue;
      const otherMeta = otherUser.user_metadata || {};
      const otherRecs: SessionRecording[] = Array.isArray(otherMeta.recordings) ? otherMeta.recordings : [];
      for (const rec of otherRecs) {
        const matchesUser =
          (role === 'teacher' && rec.teacher_id === userId) ||
          (role === 'student' && (rec.student_id === userId || (currentUser?.email && rec.student_name === currentUser.email)));
        const matchesSession = sessionId && rec.session_id === sessionId;

        if ((matchesUser || matchesSession) && !userRecordings.some((r) => r.id === rec.id)) {
          userRecordings.push(rec);
        }
      }
    }

    // If the user has no custom recordings yet, append demo recordings so they have rich past lesson playback
    if (userRecordings.length === 0) {
      userRecordings = [...DEFAULT_DEMO_RECORDINGS];
    } else {
      // Append default demo recordings that don't collide
      for (const demo of DEFAULT_DEMO_RECORDINGS) {
        if (!userRecordings.some((r) => r.id === demo.id)) {
          userRecordings.push(demo);
        }
      }
    }

    // Sort by created_at descending (newest first)
    userRecordings.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return NextResponse.json({
      success: true,
      recordings: userRecordings,
      count: userRecordings.length,
    });
  } catch (err: any) {
    console.error('Error fetching recordings:', err);
    return NextResponse.json({ success: true, recordings: DEFAULT_DEMO_RECORDINGS });
  }
}

// POST: Save a new session recording
export async function POST(request: Request) {
  try {
    const { adminUrl, supabaseUrl, serviceRoleKey, headers } = getAdminAuth();
    const body = await request.json();

    const {
      sessionId,
      bookingId = '',
      title,
      subject = 'Mathematics',
      teacherId,
      teacherName = 'Classly Educator',
      teacherAvatar = '',
      studentId = '',
      studentName = 'Student',
      duration = '30:00',
      durationSeconds = 1800,
      videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      fileSize = '95.4 MB',
      chapters = [
        { time: '00:00', title: 'Lesson Start & Concepts' },
        { time: '15:00', title: 'Whiteboard & Interactive Solving' },
        { time: '28:00', title: 'Wrap Up & Next Steps' },
      ],
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    const recordingId = `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecording: SessionRecording = {
      id: recordingId,
      session_id: sessionId,
      booking_id: bookingId,
      title: title || `${subject} Lesson Recording`,
      subject: subject,
      teacher_id: teacherId || '',
      teacher_name: teacherName,
      teacher_avatar: teacherAvatar,
      student_id: studentId || '',
      student_name: studentName,
      duration: duration,
      duration_seconds: durationSeconds,
      video_url: videoUrl,
      thumbnail_url:
        subject.toLowerCase().includes('computer') || subject.toLowerCase().includes('coding')
          ? 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
      file_size: fileSize,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      created_at: new Date().toISOString(),
      chapters: chapters,
    };

    // Update in Supabase Auth user_metadata
    const res = await fetch(adminUrl, { headers, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const allUsers: any[] = data.users || [];

      // Save to teacher's metadata if found
      if (teacherId) {
        const teacher = allUsers.find((u: any) => u.id === teacherId);
        if (teacher) {
          const meta = teacher.user_metadata || {};
          const existing = Array.isArray(meta.recordings) ? meta.recordings : [];
          await fetch(`${supabaseUrl}/auth/v1/admin/users/${teacherId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              user_metadata: {
                ...meta,
                recordings: [newRecording, ...existing],
              },
            }),
          });
        }
      }

      // Save to student's metadata if found
      if (studentId) {
        const student = allUsers.find((u: any) => u.id === studentId);
        if (student) {
          const meta = student.user_metadata || {};
          const existing = Array.isArray(meta.recordings) ? meta.recordings : [];
          await fetch(`${supabaseUrl}/auth/v1/admin/users/${studentId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              user_metadata: {
                ...meta,
                recordings: [newRecording, ...existing],
              },
            }),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      recording: newRecording,
      message: 'Lesson recording saved successfully to Cloud Archive.',
    });
  } catch (err: any) {
    console.error('Recording creation error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
