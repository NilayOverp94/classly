-- Classly Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/isooxdepfamnufwglosa/sql)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'parent', 'teacher', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE teacher_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE teaching_format AS ENUM ('one_on_one', 'group', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Users Profiles (Links to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    phone TEXT,
    country TEXT DEFAULT 'US',
    timezone TEXT DEFAULT 'America/New_York',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Parent Profiles
CREATE TABLE IF NOT EXISTS public.parent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    emergency_contact TEXT,
    preferred_communication TEXT DEFAULT 'email',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Student Profiles (Can be linked to a Parent)
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    grade_level TEXT NOT NULL, -- e.g. "Grade 8", "High School Senior"
    date_of_birth DATE,
    learning_goals TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Teacher Profiles
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    headline TEXT, -- e.g. "Certified AP Calculus & Algebra Expert"
    bio TEXT,
    years_experience INTEGER DEFAULT 1,
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 25.00,
    teaching_format teaching_format NOT NULL DEFAULT 'both',
    status teacher_status NOT NULL DEFAULT 'pending',
    video_intro_url TEXT,
    qualifications TEXT,
    teaching_methodology TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    review_count INTEGER DEFAULT 0,
    total_hours_taught NUMERIC(8, 1) DEFAULT 0,
    city TEXT,
    country TEXT DEFAULT 'IN',
    payout_account_id TEXT, -- Razorpay linked account / Route ID
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Teacher Verifications
CREATE TABLE IF NOT EXISTS public.teacher_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'government_id', 'degree_certificate', 'teaching_license'
    document_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    reviewer_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 7. Subjects Master Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL, -- 'Mathematics', 'Science', 'Languages', 'Coding', 'Humanities'
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Tutor Subjects Junction
CREATE TABLE IF NOT EXISTS public.tutor_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    grades_taught TEXT[], -- e.g. ARRAY['Grade 6', 'Grade 7', 'Grade 8']
    hourly_rate_override NUMERIC(10, 2),
    UNIQUE(teacher_id, subject_id)
);

-- 9. Group Classes
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id),
    title TEXT NOT NULL,
    description TEXT,
    grade_level TEXT NOT NULL,
    class_type TEXT NOT NULL DEFAULT 'group', -- 'group' or 'workshop'
    price NUMERIC(10, 2) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    max_students INTEGER NOT NULL DEFAULT 6,
    enrolled_count INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Teacher Availability Slots
CREATE TABLE IF NOT EXISTS public.teacher_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata'
);

-- 11. Bookings (Sessions)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id),
    subject_id UUID REFERENCES public.subjects(id),
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL, -- if group class
    booking_format teaching_format NOT NULL DEFAULT 'one_on_one',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    hourly_rate NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    teacher_payout NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status booking_status NOT NULL DEFAULT 'pending',
    meeting_room_id TEXT, -- LiveKit room name
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    provider TEXT NOT NULL DEFAULT 'razorpay', -- 'razorpay' or 'stripe'
    order_id TEXT,
    payment_id TEXT UNIQUE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    platform_fee NUMERIC(10, 2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Payouts (Teacher Earnings Distributions)
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id),
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    payout_id TEXT,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Reviews & Ratings
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) UNIQUE,
    student_id UUID NOT NULL REFERENCES public.profiles(id),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Messages (Restricted in-platform communication)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id),
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    receiver_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Learning Materials
CREATE TABLE IF NOT EXISTS public.learning_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    duration_seconds INTEGER
);

-- 19. Reports / Complaints
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id),
    reported_user_id UUID REFERENCES public.profiles(id),
    booking_id UUID REFERENCES public.bookings(id),
    category TEXT NOT NULL, -- 'behavior', 'technical', 'safety', 'refund'
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'dismissed'
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_student ON public.bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_teacher ON public.bookings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_teacher_status ON public.teacher_profiles(status);
CREATE INDEX IF NOT EXISTS idx_reviews_teacher ON public.reviews(teacher_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON public.messages(booking_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Basic Public / Authenticated RLS Policies
-- Profiles: Users can read public profile data, edit their own
CREATE POLICY "Public profiles are viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Teacher Profiles: Approved teachers visible to all, teachers can edit own
CREATE POLICY "Approved teachers are public" ON public.teacher_profiles FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Teachers can update their own profile" ON public.teacher_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Teachers can insert their profile" ON public.teacher_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subjects: Public read
CREATE POLICY "Subjects are viewable by all" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Tutor subjects viewable by all" ON public.tutor_subjects FOR SELECT USING (true);
CREATE POLICY "Classes viewable by all" ON public.classes FOR SELECT USING (true);

-- Bookings: Only student, teacher, or admin can read their bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (
    auth.uid() = student_id OR
    EXISTS (SELECT 1 FROM public.teacher_profiles WHERE teacher_profiles.id = bookings.teacher_id AND teacher_profiles.user_id = auth.uid())
);

-- Reviews: Public read
CREATE POLICY "Reviews viewable by all" ON public.reviews FOR SELECT USING (is_public = true);

