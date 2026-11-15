'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Star, 
  ShieldCheck, 
  ChevronRight,
  SlidersHorizontal,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { mockSubjects } from '@/lib/data/mockSubjects';
import { TeacherProfile } from '@/lib/types';

function TutorsContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get('subject') || 'all';
  const initialGrade = searchParams.get('grade') || 'all';

  const [tutors, setTutors] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [maxPrice, setMaxPrice] = useState<number>(60);
  const [minRating, setMinRating] = useState<number>(0);
  const [minExperience, setMinExperience] = useState<number>(0);
  const [teachingFormat, setTeachingFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating_desc');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState<number>(6);

  const supabase = createClient();

  useEffect(() => {
    async function fetchApprovedTutors() {
      try {
        const { data, error } = await supabase
          .from('teacher_profiles')
          .select(`
            id,
            user_id,
            headline,
            bio,
            years_experience,
            hourly_rate,
            teaching_format,
            status,
            education,
            rating,
            review_count,
            total_hours_taught,
            city,
            country,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('status', 'approved');

        if (!error && data && data.length > 0) {
          const mapped: TeacherProfile[] = data.map((t: any) => ({
            id: t.id,
            user_id: t.user_id,
            full_name: t.profiles?.full_name || 'Educator',
            avatar_url: t.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            headline: t.headline || 'Verified Classly Educator',
            bio: t.bio || '',
            years_experience: t.years_experience || 0,
            hourly_rate: Number(t.hourly_rate) || 25,
            teaching_format: t.teaching_format || 'both',
            status: t.status,
            qualifications: [],
            education: t.education || '',
            teaching_methodology: '',
            rating: Number(t.rating) || 5.0,
            review_count: Number(t.review_count) || 0,
            total_hours_taught: Number(t.total_hours_taught) || 0,
            city: t.city || 'US',
            country: t.country || 'US',
            subjects: [],
            grades: [],
            languages: ['English'],
          }));
          setTutors(mapped);
        } else {
          setTutors([]);
        }
      } catch (err) {
        setTutors([]);
      } finally {
        setLoading(false);
      }
    }

    fetchApprovedTutors();
  }, []);

  // Filter and sort tutors dynamically
  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = tutor.full_name.toLowerCase().includes(query);
        const matchesHeadline = tutor.headline.toLowerCase().includes(query);
        const matchesBio = tutor.bio.toLowerCase().includes(query);
        const matchesSubject = tutor.subjects.some((s) => s.toLowerCase().includes(query));
        if (!matchesName && !matchesHeadline && !matchesBio && !matchesSubject) {
          return false;
        }
      }

      // Subject filter
      if (selectedSubject !== 'all' && tutor.subjects.length > 0 && !tutor.subjects.includes(selectedSubject)) {
        return false;
      }

      // Grade filter
      if (selectedGrade !== 'all' && tutor.grades.length > 0 && !tutor.grades.includes(selectedGrade)) {
        return false;
      }

      // Hourly price filter
      if (tutor.hourly_rate > maxPrice) {
        return false;
      }

      // Rating filter
      if (minRating > 0 && tutor.rating < minRating) {
        return false;
      }

      // Experience filter
      if (tutor.years_experience < minExperience) {
        return false;
      }

      // Teaching format
      if (teachingFormat !== 'all') {
        if (tutor.teaching_format !== 'both' && tutor.teaching_format !== teachingFormat) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.hourly_rate - b.hourly_rate;
      if (sortBy === 'price_desc') return b.hourly_rate - a.hourly_rate;
      if (sortBy === 'experience_desc') return b.years_experience - a.years_experience;
      return 0;
    });
  }, [
    tutors,
    searchQuery,
    selectedSubject,
    selectedGrade,
    maxPrice,
    minRating,
    minExperience,
    teachingFormat,
    sortBy,
  ]);

  const visibleTutors = filteredTutors.slice(0, displayCount);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('all');
    setSelectedGrade('all');
    setMaxPrice(60);
    setMinRating(0);
    setMinExperience(0);
    setTeachingFormat('all');
    setSortBy('rating_desc');
  };

  return (
    <div className="bg-offwhite min-h-screen py-8 lg:py-12 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-xs text-charcoal-500">
          <Link href="/" className="hover:text-navy-800 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-navy-800">Find Tutors</span>
        </div>

        {/* Page Title & Subtitle */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-softblue-100 border border-softblue-200 text-xs font-semibold text-navy-800 mb-2">
            <ShieldCheck className="w-4 h-4 text-accent-500" />
            <span>Verified Educator Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-800 tracking-tight">
            Browse Verified Tutors
          </h1>
          <p className="mt-2 text-sm text-charcoal-600 max-w-2xl leading-relaxed">
            Search qualified teachers for personalized 1-on-1 tutoring and interactive small group classes aligned to US K-12 school curricula.
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search by educator name, subject (e.g. AP Calculus), or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-navy-800 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-navy-800 hover:bg-gray-100"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-tutors" className="text-xs font-semibold text-charcoal-500 whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="sort-tutors"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="rating_desc">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="experience_desc">Most Experienced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar Filters + Tutor Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className={`lg:col-span-3 bg-white p-5 rounded-xl border border-gray-200 shadow-subtle space-y-6 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-navy-800 uppercase tracking-wider">
                <SlidersHorizontal className="w-4 h-4 text-accent-500" />
                <span>Filters</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-charcoal-400 hover:text-navy-800 font-medium underline"
              >
                Reset All
              </button>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs font-medium text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="all">All Subjects</option>
                {mockSubjects.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Grade Level Filter */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                Grade Level
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs font-medium text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="all">All Grades</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9 (Freshman)</option>
                <option value="Grade 10">Grade 10 (Sophomore)</option>
                <option value="Grade 11">Grade 11 (Junior)</option>
                <option value="Grade 12">Grade 12 (Senior)</option>
              </select>
            </div>

            {/* Max Hourly Rate Filter */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                  Max Price
                </label>
                <span className="text-xs font-bold text-navy-800">${maxPrice}/hr</span>
              </div>
              <input
                type="range"
                min="15"
                max="80"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-navy-800"
              />
              <div className="flex justify-between text-[11px] text-charcoal-400 mt-1">
                <span>$15</span>
                <span>$80</span>
              </div>
            </div>

            {/* Teaching Format Filter */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                Lesson Format
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { val: 'all', label: 'All Formats' },
                  { val: 'one_on_one', label: '1-on-1 Private Tutoring' },
                  { val: 'group', label: 'Small Group Classes' },
                ].map((fmt) => (
                  <label key={fmt.val} className="flex items-center gap-2 cursor-pointer text-charcoal-700">
                    <input
                      type="radio"
                      name="format"
                      checked={teachingFormat === fmt.val}
                      onChange={() => setTeachingFormat(fmt.val)}
                      className="accent-navy-800"
                    />
                    <span>{fmt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Experience */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                Experience Level
              </label>
              <select
                value={minExperience}
                onChange={(e) => setMinExperience(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs font-medium text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="0">Any experience</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
                <option value="8">8+ years</option>
              </select>
            </div>

          </aside>

          {/* Results Area */}
          <main className="lg:col-span-9 space-y-4">
            
            {/* Loading Indicator */}
            {loading && (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
                <div className="w-8 h-8 border-2 border-navy-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-charcoal-500">Checking verified educator database...</p>
              </div>
            )}

            {/* Empty State when no educators exist yet in database */}
            {!loading && tutors.length === 0 && (
              <div className="bg-white p-10 sm:p-12 rounded-xl border border-gray-200 text-center">
                <div className="w-12 h-12 rounded-full bg-softblue-100 border border-softblue-200 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6 text-accent-600" />
                </div>
                <h3 className="text-lg font-bold text-navy-800 mb-2">
                  Educator Verification in Progress
                </h3>
                <p className="text-xs text-charcoal-600 max-w-md mx-auto mb-6 leading-relaxed">
                  Our academic compliance board is currently reviewing degree transcripts, verifying identities, and evaluating live teaching demos for applicant teachers. Approved educator profiles will appear here as soon as verification is complete.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/become-a-tutor"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-bold transition shadow-subtle"
                  >
                    <span>Apply to Join Educator Faculty</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/subjects"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-charcoal-700 rounded-lg text-xs font-semibold border border-gray-200 transition"
                  >
                    <span>Explore K-12 Curriculum Tracks</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Empty State when filters return 0 results */}
            {!loading && tutors.length > 0 && filteredTutors.length === 0 && (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-navy-800 mb-1">No educators matched your filters</h3>
                <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-4">
                  Try adjusting your subject selection, widening the hourly rate range, or resetting filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-navy-800 text-white rounded-md text-xs font-semibold hover:bg-navy-900"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Results count banner when educators exist */}
            {!loading && tutors.length > 0 && (
              <div className="flex items-center justify-between text-xs text-charcoal-600 pb-2">
                <span>
                  Showing <strong>{visibleTutors.length}</strong> of <strong>{filteredTutors.length}</strong> verified tutors
                </span>
                <span className="text-gray-400">All prices in USD per hour</span>
              </div>
            )}

            {/* Tutor Listing Cards */}
            {!loading && visibleTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-white rounded-xl border border-gray-200/90 shadow-subtle hover:border-navy-300 hover:shadow-card transition duration-200 p-5 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  
                  {/* Left: Avatar & Verified Badge */}
                  <div className="flex-shrink-0 text-center mx-auto sm:mx-0">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-subtle mx-auto">
                      <Image
                        src={tutor.avatar_url}
                        alt={tutor.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
                      <span>Verified</span>
                    </div>
                  </div>

                  {/* Middle: Name, Headline, Bio, Badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tutors/${tutor.id}`}
                          className="text-lg font-bold text-navy-800 hover:text-navy-900 hover:underline"
                        >
                          {tutor.full_name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
                        {tutor.review_count > 0 ? (
                          <>
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{tutor.rating.toFixed(2)}</span>
                            <span className="text-charcoal-400 font-normal">({tutor.review_count} reviews)</span>
                          </>
                        ) : (
                          <span className="text-[11px] text-accent-700 bg-accent-50 px-1.5 py-0.5 rounded font-semibold border border-accent-200">
                            New Verified Educator
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs font-medium text-charcoal-600 mb-2">
                      {tutor.headline}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tutor.subjects.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-softblue-100 text-navy-800 text-[11px] font-semibold border border-softblue-200"
                        >
                          {s}
                        </span>
                      ))}
                      {tutor.years_experience > 0 && (
                        <span className="px-2 py-0.5 rounded bg-gray-50 text-charcoal-600 text-[11px] font-medium border border-gray-200">
                          {tutor.years_experience} yrs experience
                        </span>
                      )}
                      {tutor.total_hours_taught > 0 && (
                        <span className="px-2 py-0.5 rounded bg-gray-50 text-charcoal-600 text-[11px] font-medium border border-gray-200">
                          {tutor.total_hours_taught}+ hrs taught
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed mb-3">
                      {tutor.bio}
                    </p>

                    <div className="text-[11px] text-charcoal-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span><strong>Format:</strong> {tutor.teaching_format === 'both' ? '1-on-1 & Group Classes' : '1-on-1 Tutoring'}</span>
                      {tutor.grades.length > 0 && <span><strong>Grades:</strong> {tutor.grades.join(', ')}</span>}
                    </div>
                  </div>

                  {/* Right: Rate, Booking CTA */}
                  <div className="w-full sm:w-44 flex-shrink-0 pt-4 sm:pt-0 sm:border-l sm:border-gray-100 sm:pl-5 flex flex-col justify-between items-center sm:items-end">
                    <div className="text-center sm:text-right mb-3">
                      <span className="text-2xl font-bold text-navy-800">${tutor.hourly_rate}</span>
                      <span className="text-xs text-charcoal-500 block">per hour</span>
                    </div>

                    <div className="w-full space-y-2">
                      <Link
                        href={`/booking/${tutor.id}`}
                        className="w-full block text-center py-2 px-3 bg-navy-800 hover:bg-navy-900 text-white rounded-md text-xs font-semibold transition shadow-subtle"
                      >
                        Book Lesson
                      </Link>
                      <Link
                        href={`/tutors/${tutor.id}`}
                        className="w-full block text-center py-2 px-3 bg-gray-50 hover:bg-gray-100 text-charcoal-700 rounded-md text-xs font-medium border border-gray-200 transition"
                      >
                        View Profile
                      </Link>
                    </div>

                    <div className="mt-2 text-[10px] text-charcoal-400 text-center sm:text-right">
                      100% money-back guarantee
                    </div>
                  </div>

                </div>
              </div>
            ))}

            {/* Pagination / Load More */}
            {filteredTutors.length > displayCount && (
              <div className="pt-6 text-center">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 4)}
                  className="px-6 py-2.5 bg-white border border-gray-300 hover:border-navy-400 text-navy-800 text-xs font-bold rounded-lg shadow-subtle transition"
                >
                  Load More Tutors ({filteredTutors.length - displayCount} remaining)
                </button>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}

export default function FindTutorsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-charcoal-500">Loading tutors...</div>}>
      <TutorsContent />
    </Suspense>
  );
}
