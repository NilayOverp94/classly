export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';
export type TeacherStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type TeachingFormat = 'one_on_one' | 'group' | 'both';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  created_at?: string;
}

export interface TeacherProfile {
  id: string;
  user_id?: string;
  full_name: string;
  avatar_url: string;
  headline: string;
  bio: string;
  years_experience: number;
  hourly_rate: number;
  teaching_format: TeachingFormat;
  status: TeacherStatus;
  video_intro_url?: string;
  qualifications: string[];
  education: string;
  teaching_methodology: string;
  rating: number;
  review_count: number;
  total_hours_taught: number;
  city: string;
  country: string;
  subjects: string[];
  grades: string[];
  languages: string[];
  availability?: {
    day: string;
    slots: string[];
  }[];
}

export interface SubjectItem {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  tutorCount: number;
}

export interface Booking {
  id: string;
  student_id: string;
  student_name: string;
  student_avatar?: string;
  teacher_id: string;
  teacher_name: string;
  teacher_avatar?: string;
  subject: string;
  booking_format: TeachingFormat;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  hourly_rate: number;
  total_amount: number;
  platform_fee: number;
  teacher_payout: number;
  status: BookingStatus;
  meeting_room_id: string;
  notes?: string;
  created_at: string;
}

export interface ReviewItem {
  id: string;
  booking_id?: string;
  teacher_id?: string;
  student_id?: string;
  student_name: string;
  student_avatar?: string;
  student_grade: string;
  date: string;
  rating: number;
  comment: string;
  subject: string;
  tags?: string[];
  created_at?: string;
}

export interface GroupClass {
  id: string;
  teacher_id: string;
  teacher_name: string;
  teacher_avatar: string;
  title: string;
  subject: string;
  grade_level: string;
  class_type: 'group' | 'workshop';
  price: number;
  start_time: string;
  duration_minutes: number;
  max_students: number;
  enrolled_count: number;
  description: string;
}

export interface SessionRecording {
  id: string;
  session_id: string;
  booking_id?: string;
  title: string;
  subject: string;
  teacher_id: string;
  teacher_name: string;
  teacher_avatar?: string;
  student_id?: string;
  student_name: string;
  student_avatar?: string;
  duration: string;
  duration_seconds: number;
  video_url: string;
  thumbnail_url?: string;
  file_size?: string;
  date: string;
  created_at: string;
  chapters?: { time: string; title: string }[];
}

export type PackageTier = 1 | 5 | 10 | 20;

export interface LessonPackage {
  tier: PackageTier;
  lessonsCount: number;
  discountPercent: number;
  label: string;
  tagline: string;
  popular?: boolean;
  bestValue?: boolean;
}

export interface StudentPrepaidPackage {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  subject: string;
  packageTier: PackageTier;
  tier?: PackageTier;
  totalLessons: number;
  usedLessons: number;
  remainingLessons: number;
  totalPaid: number;
  hourlyRateEquivalent: number;
  purchasedAt: string;
}

export interface ReferralProfile {
  referralCode: string;
  referralLink: string;
  totalInvited: number;
  successfulReferrals: number;
  earnedCreditsUSD: number;
  availableCreditsUSD: number;
  history: {
    referredUserName: string;
    referredUserEmail?: string;
    date: string;
    creditAmount: number;
    status: 'rewarded' | 'pending';
  }[];
}


