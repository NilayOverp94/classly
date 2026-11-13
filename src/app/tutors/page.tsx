'use client';

import React, { useState, useMemo, Suspense } from 'react';
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
} from 'lucide-react';
import { mockTutors } from '@/lib/data/mockTutors';
import { mockSubjects } from '@/lib/data/mockSubjects';

function TutorsContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get('subject') || 'all';
  const initialGrade = searchParams.get('grade') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [maxPrice, setMaxPrice] = useState<number>(50);
  const [minRating, setMinRating] = useState<number>(0);
  const [minExperience, setMinExperience] = useState<number>(0);
  const [teachingFormat, setTeachingFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating_desc');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState<number>(6);

  // Filter and sort tutors
  const filteredTutors = useMemo(() => {
    return mockTutors.filter((tutor) => {
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
      if (selectedSubject !== 'all' && !tutor.subjects.includes(selectedSubject)) {
        return false;
      }

      // Grade filter
      if (selectedGrade !== 'all' && !tutor.grades.includes(selectedGrade)) {
        return false;
      }

      // Hourly price filter
      if (tutor.hourly_rate > maxPrice) {
        return false;
      }

      // Rating filter
      if (tutor.rating < minRating) {
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
    setMaxPrice(50);
    setMinRating(0);
    setMinExperience(0);
    setTeachingFormat('all');
    setSortBy('rating_desc');
  };

  return (
    <div className="bg-offwhite min-h-screen py-8 lg:py-12 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-charcoal-500 mb-2">
            <Link href="/" className="hover:text-navy-800">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-navy-800">Find a Tutor</span>
          </div>
          <h1 className="text-3xl font-bold text-navy-800 tracking-tight">
            Discover Verified K-12 Educators
          </h1>
          <p className="mt-1 text-sm text-charcoal-600">
            Compare qualifications, reviews, and hourly rates to schedule personalized 1-on-1 lessons or small group classes.
          </p>
        </div>

        {/* Top Search & Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-subtle mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by educator name, keyword (e.g. 'Calculus', 'AP Physics', 'Python')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-navy-800"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Sort selector */}
            <div className="flex items-center gap-2 text-xs font-medium text-charcoal-600">
              <span className="hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600"
              >
                <option value="rating_desc">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="experience_desc">Most Experienced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content: Sidebar + Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-xl border border-gray-200 shadow-subtle space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm font-bold text-navy-800">
                <Filter className="w-4 h-4 text-navy-800" />
                <span>Filter Tutors</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-accent-600 hover:text-accent-700 font-semibold"
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
                <option value="all">All Grades (K-12)</option>
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

            {/* Hourly Price Range Filter */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-charcoal-700 uppercase tracking-wider">Max Hourly Rate</span>
                <span className="font-bold text-navy-800">${maxPrice}/hr</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                step="1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-navy-800 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>$15</span>
                <span>$30</span>
                <span>$50</span>
              </div>
            </div>

            {/* Teaching Format Filter */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                Teaching Format
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'all', label: 'Any Format' },
                  { id: 'one_on_one', label: '1-on-1 Tutoring Only' },
                  { id: 'group', label: 'Group Classes' },
                ].map((fmt) => (
                  <label key={fmt.id} className="flex items-center gap-2 cursor-pointer text-charcoal-700">
                    <input
                      type="radio"
                      name="format"
                      checked={teachingFormat === fmt.id}
                      onChange={() => setTeachingFormat(fmt.id)}
                      className="accent-navy-800"
                    />
                    <span>{fmt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                Minimum Rating
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { val: 0, label: 'Any Rating' },
                  { val: 4.8, label: '4.8 stars and above' },
                  { val: 4.9, label: '4.9 stars and above' },
                ].map((r) => (
                  <label key={r.val} className="flex items-center gap-2 cursor-pointer text-charcoal-700">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === r.val}
                      onChange={() => setMinRating(r.val)}
                      className="accent-navy-800"
                    />
                    <span>{r.label}</span>
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
                <option value="5">5+ years</option>
                <option value="8">8+ years</option>
                <option value="10">10+ years</option>
              </select>
            </div>

          </aside>

          {/* Results Area */}
          <main className="lg:col-span-9 space-y-4">
            
            {/* Results count banner */}
            <div className="flex items-center justify-between text-xs text-charcoal-600 pb-2">
              <span>
                Showing <strong>{visibleTutors.length}</strong> of <strong>{filteredTutors.length}</strong> qualified tutors
              </span>
              {filteredTutors.length > 0 && (
                <span className="text-gray-400">All prices in USD per hour</span>
              )}
            </div>

            {/* Empty State */}
            {filteredTutors.length === 0 && (
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

            {/* Tutor Listing Cards */}
            {visibleTutors.map((tutor) => (
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
                      <span>Verified Educator</span>
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
                        <span className="text-xs text-charcoal-400">({tutor.city}, {tutor.country})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{tutor.rating.toFixed(2)}</span>
                        <span className="text-charcoal-400 font-normal">({tutor.review_count} reviews)</span>
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
                      <span className="px-2 py-0.5 rounded bg-gray-50 text-charcoal-600 text-[11px] font-medium border border-gray-200">
                        {tutor.years_experience} yrs experience
                      </span>
                      <span className="px-2 py-0.5 rounded bg-gray-50 text-charcoal-600 text-[11px] font-medium border border-gray-200">
                        {tutor.total_hours_taught}+ hrs taught
                      </span>
                    </div>

                    <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed mb-3">
                      {tutor.bio}
                    </p>

                    <div className="text-[11px] text-charcoal-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span><strong>Format:</strong> {tutor.teaching_format === 'both' ? '1-on-1 & Group Classes' : '1-on-1 Tutoring'}</span>
                      <span><strong>Grades:</strong> {tutor.grades.join(', ')}</span>
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
