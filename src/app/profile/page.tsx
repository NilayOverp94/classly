'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Clock, 
  GraduationCap, 
  BookOpen, 
  Phone, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ChevronRight,
  Save,
  DollarSign,
  Award,
  Camera,
  Upload,
  Trash2,
  Sparkles,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import { FadeIn } from '@/components/ui/MotionComponents';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'admin'>('student');

  // Student / Parent form fields
  const [parentName, setParentName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('Grade 8');
  const [timezone, setTimezone] = useState('America/New_York (Eastern Time)');
  const [phone, setPhone] = useState('');
  const [learningGoals, setLearningGoals] = useState('');

  // Teacher form fields
  const [teacherName, setTeacherName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('25');
  const [yearsExperience, setYearsExperience] = useState('5');
  const [education, setEducation] = useState('');
  const [teachingFormat, setTeachingFormat] = useState<'one_on_one' | 'group' | 'both'>('both');
  const [teachingMethodology, setTeachingMethodology] = useState('');

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;

        if (!currentUser) {
          const { data: { user: fetchedUser } } = await supabase.auth.getUser();
          if (!fetchedUser) {
            router.replace('/login');
            return;
          }
          initForm(fetchedUser);
        } else {
          initForm(currentUser);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    }

    const initForm = (u: any) => {
      setUser(u);
      const email = (u.email || '').toLowerCase().trim();
      const meta = u.user_metadata || {};

      let role: 'student' | 'teacher' | 'admin' = 'student';
      if (email === 'milayraj713@gmail.com' || email === 'nilayraj713@gmail.com') {
        role = 'admin';
      } else if (meta.role === 'teacher') {
        role = 'teacher';
      } else {
        role = 'student';
      }
      setUserRole(role);

      // Avatar profile photo
      setAvatarUrl(meta.avatar_url || meta.picture || '');

      // Student / Parent fields
      setParentName(meta.parent_name || meta.full_name || '');
      setStudentName(meta.student_name || meta.name || meta.full_name || '');
      setStudentGrade(meta.student_grade || 'Grade 8');
      setTimezone(meta.timezone || 'America/New_York (Eastern Time)');
      setPhone(meta.phone || '');
      setLearningGoals(meta.learning_goals || '');

      // Teacher fields
      setTeacherName(meta.full_name || meta.name || '');
      setHeadline(meta.headline || '');
      setBio(meta.bio || '');
      setHourlyRate(String(meta.hourly_rate || '25'));
      setYearsExperience(String(meta.years_experience || '5'));
      setEducation(meta.education || meta.qualifications || '');
      setTeachingFormat(meta.teaching_format || 'both');
      setTeachingMethodology(meta.teaching_methodology || '');
    };

    loadUserProfile();
  }, [router]);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds the maximum limit of 5MB.');
      return;
    }

    setUploadingAvatar(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo.');
      }

      setAvatarUrl(data.avatarUrl);
      setSuccessMessage('Profile photo updated successfully! It is now live on your educator listing in Find Tutors.');
      setTimeout(() => setSuccessMessage(''), 5000);

      // Refresh auth session user metadata in background
      await supabase.auth.refreshSession();
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setErrorMessage(err.message || 'Failed to upload profile photo.');
    } finally {
      setUploadingAvatar(false);
      // Reset input value so user can upload the same file again if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id) return;
    setUploadingAvatar(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, action: 'remove' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove photo.');
      }

      setAvatarUrl('');
      setSuccessMessage('Profile photo removed. Your educator card will show your initial avatar.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await supabase.auth.refreshSession();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove profile photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      if (userRole === 'teacher') {
        // 1. Update auth user metadata
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            full_name: teacherName.trim(),
            name: teacherName.trim(),
            headline: headline.trim(),
            bio: bio.trim(),
            hourly_rate: Number(hourlyRate),
            years_experience: Number(yearsExperience),
            education: education.trim(),
            teaching_format: teachingFormat,
            teaching_methodology: teachingMethodology.trim(),
            timezone: timezone,
            avatar_url: avatarUrl || undefined,
            picture: avatarUrl || undefined,
          },
        });
        if (authError) throw authError;

        // 2. Update profiles table if present
        await supabase.from('profiles').update({
          full_name: teacherName.trim(),
          timezone: timezone,
        }).eq('id', user.id);

        // 3. Update teacher_profiles table if present
        await supabase.from('teacher_profiles').update({
          headline: headline.trim(),
          bio: bio.trim(),
          hourly_rate: Number(hourlyRate),
          years_experience: Number(yearsExperience),
          education: education.trim(),
          teaching_format: teachingFormat,
          teaching_methodology: teachingMethodology.trim(),
        }).eq('user_id', user.id);

      } else {
        // Student / Parent update
        const displayName = studentName.trim() || parentName.trim();
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            full_name: displayName,
            parent_name: parentName.trim(),
            student_name: studentName.trim(),
            student_grade: studentGrade,
            timezone: timezone,
            phone: phone.trim(),
            learning_goals: learningGoals.trim(),
            avatar_url: avatarUrl || undefined,
            picture: avatarUrl || undefined,
          },
        });
        if (authError) throw authError;

        // Sync with public.profiles if present
        await supabase.from('profiles').update({
          full_name: displayName,
          phone: phone.trim(),
          timezone: timezone,
        }).eq('id', user.id);

        // Sync with student_profiles if present
        await supabase.from('student_profiles').update({
          grade_level: studentGrade,
          learning_goals: learningGoals.trim(),
        }).eq('user_id', user.id);
      }

      setSuccessMessage('Your profile changes have been successfully saved!');
      setTimeout(() => setSuccessMessage(''), 4000);
      router.refresh();
    } catch (err: any) {
      console.error('Profile update error:', err);
      setErrorMessage(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const dashboardHref = 
    userRole === 'admin' 
      ? '/admin' 
      : userRole === 'teacher' 
      ? '/dashboard/teacher' 
      : '/dashboard/student';

  const userDisplayName = 
    user?.user_metadata?.student_name ||
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    user?.email?.split('@')[0] || 
    'Member';

  if (loading) {
    return (
      <div className="bg-offwhite min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-navy-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-charcoal-500">Loading your profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-offwhite min-h-screen py-8 lg:py-12 border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-charcoal-500">
          <Link href={dashboardHref} className="hover:text-navy-800 transition">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-navy-800">Account Profile & Settings</span>
        </div>

        {/* Page Header */}
        <FadeIn direction="up" delay={0.05} duration={0.45}>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-softblue-100 border border-softblue-200 text-xs font-semibold text-navy-800 mb-2">
              <User className="w-4 h-4 text-accent-500" />
              <span>Profile Management</span>
            </div>
            <h1 className="text-3xl font-bold text-navy-800 tracking-tight">
              Account Settings & Profile
            </h1>
            <p className="mt-1.5 text-xs text-charcoal-600 max-w-xl">
              Update your personal contact details, school grade level, timezones, and learning preferences.
            </p>
          </div>
        </FadeIn>

        {/* Notifications */}
        {successMessage && (
          <FadeIn direction="down" duration={0.3}>
            <div className="mb-6 p-4 bg-accent-50 border border-accent-200 text-accent-800 rounded-xl text-xs flex items-center gap-2.5 shadow-subtle">
              <CheckCircle2 className="w-5 h-5 text-accent-600 flex-shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          </FadeIn>
        )}

        {errorMessage && (
          <FadeIn direction="down" duration={0.3}>
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2.5 shadow-subtle">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </FadeIn>
        )}

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Account Identity Card */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-subtle space-y-6">
            <div className="text-center">
              {/* Profile Photo / Avatar with Interactive Upload Overlay */}
              <div className="relative group mx-auto mb-2.5 w-24 h-24">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-navy-800 text-white flex items-center justify-center font-bold text-3xl uppercase shadow-lift border-2 border-white ring-2 ring-gray-100 relative">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={userDisplayName}
                      fill
                      className="object-cover"
                      unoptimized={true}
                      priority
                    />
                  ) : (
                    <span>{userDisplayName.charAt(0)}</span>
                  )}

                  {/* Uploading Spinner Overlay */}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-navy-950/70 flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 z-10">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  )}
                </div>

                {/* Camera / Upload Button Overlay Badge */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  title="Upload profile picture"
                  className="absolute bottom-0 right-0 p-2 bg-accent-500 hover:bg-accent-600 text-white rounded-full shadow-md transition-transform hover:scale-110 active:scale-95 border-2 border-white cursor-pointer z-20"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleAvatarSelect}
                />
              </div>

              {/* Upload & Remove Action Links */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-[11px] font-bold text-accent-600 hover:text-accent-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                </button>
                {avatarUrl && (
                  <>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="text-[11px] font-medium text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </>
                )}
              </div>
              <p className="text-[10px] text-charcoal-400 mb-3">
                {userRole === 'teacher' ? 'Your photo is displayed publicly on the Find Tutors directory' : 'JPG, PNG or WebP • Max 5MB'}
              </p>

              <h2 className="text-lg font-bold text-navy-800">{userDisplayName}</h2>
              <p className="text-xs text-charcoal-500 mt-0.5">{user?.email}</p>
              
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-softblue-50 text-navy-800 border border-softblue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
                <span>
                  {userRole === 'admin' ? 'Super Administrator' : userRole === 'teacher' ? 'Accredited Educator' : 'Student & Parent Account'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3 text-xs">
              <div className="flex justify-between items-center text-charcoal-600">
                <span className="text-charcoal-400">Account Type</span>
                <span className="font-semibold text-navy-800 capitalize">{userRole}</span>
              </div>
              <div className="flex justify-between items-center text-charcoal-600">
                <span className="text-charcoal-400">Auth Status</span>
                <span className="text-accent-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-charcoal-600">
                <span className="text-charcoal-400">Security</span>
                <span className="font-semibold text-navy-800">COPPA Supervised</span>
              </div>
            </div>

            {/* Interface Theme Preference */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-500 dark:text-slate-400 mb-2">
                Color Theme
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white text-navy-900 shadow-sm border border-gray-200 dark:border-slate-600'
                      : 'text-charcoal-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-white dark:bg-slate-700 text-navy-900 dark:text-white shadow-sm border border-gray-200 dark:border-slate-600'
                      : 'text-charcoal-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                    theme === 'system'
                      ? 'bg-white dark:bg-slate-700 text-navy-900 dark:text-white shadow-sm border border-gray-200 dark:border-slate-600'
                      : 'text-charcoal-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-blue-500" />
                  <span>System</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Link
                href={dashboardHref}
                className="w-full block text-center py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-navy-800 rounded-lg text-xs font-bold border border-gray-200 transition"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>

          {/* Right Column: Edit Profile Form */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-subtle">
            
            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
              
              {/* Account Email (Read-Only) */}
              <div>
                <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-charcoal-500 font-medium cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[11px] text-charcoal-400">
                  Email addresses are secured and linked to your authentication provider.
                </p>
              </div>

              {/* Student / Parent Fields */}
              {userRole !== 'teacher' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                        Parent / Guardian Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="e.g. Jane Smith"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                        Student Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Alex Smith"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                        Student Grade Level
                      </label>
                      <select
                        value={studentGrade}
                        onChange={(e) => setStudentGrade(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white"
                      >
                        <option value="Grade 5">Grade 5 (Elementary)</option>
                        <option value="Grade 6">Grade 6 (Middle School)</option>
                        <option value="Grade 7">Grade 7 (Middle School)</option>
                        <option value="Grade 8">Grade 8 (Middle School)</option>
                        <option value="Grade 9">Grade 9 (Freshman)</option>
                        <option value="Grade 10">Grade 10 (Sophomore)</option>
                        <option value="Grade 11">Grade 11 (Junior)</option>
                        <option value="Grade 12">Grade 12 (Senior)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                        Primary Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white"
                      >
                        <option value="America/New_York (Eastern Time)">Eastern Time (US / New York)</option>
                        <option value="America/Chicago (Central Time)">Central Time (US / Chicago)</option>
                        <option value="America/Denver (Mountain Time)">Mountain Time (US / Denver)</option>
                        <option value="America/Los_Angeles (Pacific Time)">Pacific Time (US / Los Angeles)</option>
                        <option value="Asia/Kolkata (IST)">India Standard Time (IST)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                      Parent Contact Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                      Learning Goals & Key Subjects
                    </label>
                    <textarea
                      rows={3}
                      value={learningGoals}
                      onChange={(e) => setLearningGoals(e.target.value)}
                      placeholder="e.g. Focus on AP Calculus BC free-response questions, high school physics homework support, and SAT test strategies..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                    />
                  </div>
                </>
              )}

              {/* Teacher / Tutor Fields */}
              {userRole === 'teacher' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                        Educator Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        placeholder="e.g. Dr. Jane Smith"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                        Hourly Rate ($ USD / hour)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                        <input
                          type="number"
                          required
                          min={15}
                          max={150}
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      required
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Certified AP Calculus & Physics Specialist • 8+ Yrs Experience"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                      Educator Bio & Introduction
                    </label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share your teaching background, credentials, and passion for mentoring students..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                        University Degree & Certifications
                      </label>
                      <input
                        type="text"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g. Ph.D. in Applied Mathematics"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                        Years of Teaching Experience
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={40}
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                      Teaching Methodology
                    </label>
                    <textarea
                      rows={3}
                      value={teachingMethodology}
                      onChange={(e) => setTeachingMethodology(e.target.value)}
                      placeholder="e.g. Socratic problem deconstruction, interactive whiteboard derivations, and structured homework practice..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
                    />
                  </div>
                </>
              )}

              {/* Submit CTA */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <Link
                  href={dashboardHref}
                  className="px-4 py-2.5 rounded-lg text-charcoal-600 hover:text-navy-800 hover:bg-gray-100 font-semibold transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white rounded-lg font-bold shadow-subtle transition cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
}
