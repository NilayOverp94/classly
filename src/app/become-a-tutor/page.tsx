'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Globe, 
  DollarSign, 
  Calendar, 
  Laptop, 
  BarChart3, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Upload,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export default function BecomeATutorPage() {
  // Interactive Earnings Calculator State
  const [calcHourlyRate, setCalcHourlyRate] = useState<number>(25);
  const [calcHoursPerWeek, setCalcHoursPerWeek] = useState<number>(15);
  const monthlyEarnings = Math.round(calcHourlyRate * calcHoursPerWeek * 4.2 * 0.85); // 15% platform commission

  // Multi-step Registration Wizard State
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Form fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'New Delhi',
    country: 'India',
    subjects: ['Mathematics'],
    grades: ['Grade 8', 'Grade 9', 'Grade 10'],
    experienceYears: '6',
    education: '',
    bio: '',
    hourlyRate: '25',
    teachingFormat: 'both',
    agreeToTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final submission
      setIsSubmitted(true);
    }
  };

  const benefits = [
    {
      title: 'Reach Students Internationally',
      description: 'Teach US K-12 students seeking high-caliber educators for mathematics, science, AP curriculum, and test preparation.',
      icon: <Globe className="w-5 h-5 text-accent-500" />,
    },
    {
      title: 'Set Your Own Hourly Rates',
      description: 'You maintain full control of your rates. Increase your pricing as your reputation, reviews, and demand grow.',
      icon: <DollarSign className="w-5 h-5 text-navy-800" />,
    },
    {
      title: 'Choose Your Availability',
      description: 'Set your own weekly calendar. Open morning, evening, or weekend slots that harmonize with your schedule.',
      icon: <Calendar className="w-5 h-5 text-accent-500" />,
    },
    {
      title: 'Teach Remotely in HD Classrooms',
      description: 'Work from home using our browser-based live classroom equipped with collaborative whiteboards and screen sharing.',
      icon: <Laptop className="w-5 h-5 text-navy-800" />,
    },
    {
      title: 'Seamless Booking Management',
      description: 'No scheduling emails back and forth. Automated calendar bookings, reminders, and parent communications handled.',
      icon: <Clock className="w-5 h-5 text-accent-500" />,
    },
    {
      title: 'Reliable Payouts & Tracking',
      description: 'Track your accrued earnings in real time with automated payouts directly to your local bank account.',
      icon: <BarChart3 className="w-5 h-5 text-navy-800" />,
    },
  ];

  return (
    <div className="bg-offwhite min-h-screen">
      
      {/* Hero Section */}
      <section className="bg-navy-900 text-white py-16 lg:py-24 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-800 border border-navy-700 text-xs font-semibold text-accent-400 mb-6">
            <UserCheck className="w-4 h-4" />
            <span>Now Onboarding Qualified Educators from India</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Turn your knowledge into opportunity.
          </h1>

          <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join the Classly educator network. Connect with K-12 students in the United States, set your own schedule, and earn competitive global rates.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowApplyModal(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-lg shadow-lift transition text-sm flex items-center justify-center gap-2"
            >
              <span>Apply as a Tutor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#earnings"
              className="w-full sm:w-auto px-6 py-3.5 bg-navy-800 hover:bg-navy-750 text-gray-200 font-semibold rounded-lg border border-navy-700 transition text-sm"
            >
              Estimate Your Earnings
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-gray-400">
            <span>Average active tutor earns <strong>$1,200 – $2,500/mo</strong></span>
            <span>•</span>
            <span>Zero listing fees</span>
            <span>•</span>
            <span>Direct bank transfer payouts</span>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 lg:py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">
              Why Teach on Classly
            </h2>
            <p className="text-3xl font-bold text-navy-800 tracking-tight">
              A Platform Built to Empower Educators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="p-6 bg-offwhite/50 rounded-xl border border-gray-200 shadow-subtle">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-subtle">
                  {b.icon}
                </div>
                <h3 className="text-base font-bold text-navy-800 mb-2">{b.title}</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Earnings Calculator */}
      <section id="earnings" className="py-16 lg:py-20 bg-softblue-50/50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">
              Earnings Calculator
            </h2>
            <p className="text-3xl font-bold text-navy-800 tracking-tight">
              See How Much You Could Earn
            </p>
            <p className="mt-2 text-xs text-charcoal-500">
              Calculate your estimated monthly take-home earnings based on your rate and weekly hours.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-charcoal-700">Hourly Rate</span>
                    <span className="text-navy-800 font-bold">${calcHourlyRate} / hour</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="1"
                    value={calcHourlyRate}
                    onChange={(e) => setCalcHourlyRate(Number(e.target.value))}
                    className="w-full accent-navy-800"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>$15/hr</span>
                    <span>$35/hr</span>
                    <span>$60/hr</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-charcoal-700">Teaching Hours per Week</span>
                    <span className="text-navy-800 font-bold">{calcHoursPerWeek} hours/wk</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="1"
                    value={calcHoursPerWeek}
                    onChange={(e) => setCalcHoursPerWeek(Number(e.target.value))}
                    className="w-full accent-navy-800"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>5 hrs</span>
                    <span>20 hrs</span>
                    <span>40 hrs</span>
                  </div>
                </div>
              </div>

              {/* Result Card */}
              <div className="p-6 bg-navy-800 text-white rounded-xl text-center flex flex-col justify-center">
                <span className="text-xs uppercase tracking-wider text-gray-300 font-semibold">
                  Estimated Monthly Take-Home
                </span>
                <div className="my-3 text-4xl sm:text-5xl font-extrabold text-white">
                  ${monthlyEarnings.toLocaleString()}
                  <span className="text-sm font-normal text-gray-300 ml-1">/ month</span>
                </div>
                <div className="text-[11px] text-gray-300">
                  Approx. ₹{(monthlyEarnings * 83).toLocaleString()} INR per month
                </div>
                <div className="mt-4 pt-4 border-t border-navy-700 text-[10px] text-gray-400">
                  After 15% platform infrastructure & payment processing commission.
                </div>
              </div>

            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-8 py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-lg text-sm transition shadow-subtle"
              >
                Apply with These Preferences
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Verification Standards Section */}
      <section id="requirements" className="py-16 lg:py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">
              Our Vetting Standards
            </h2>
            <p className="text-3xl font-bold text-navy-800 tracking-tight">
              The 4-Step Application & Approval Process
            </p>
            <p className="mt-2 text-xs text-charcoal-500">
              To safeguard students, all teacher accounts must be verified and approved by an administrator before publishing classes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="w-8 h-8 rounded-full bg-navy-800 text-white font-bold flex items-center justify-center mb-3">1</div>
              <h4 className="font-bold text-navy-800 text-sm mb-1">Personal Details</h4>
              <p className="text-charcoal-600">Identity verification, contact details, and professional headshot photograph.</p>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="w-8 h-8 rounded-full bg-navy-800 text-white font-bold flex items-center justify-center mb-3">2</div>
              <h4 className="font-bold text-navy-800 text-sm mb-1">Subject Expertise</h4>
              <p className="text-charcoal-600">Demonstration of curriculum mastery (US Common Core, AP Calculus, AP Physics, etc.).</p>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="w-8 h-8 rounded-full bg-navy-800 text-white font-bold flex items-center justify-center mb-3">3</div>
              <h4 className="font-bold text-navy-800 text-sm mb-1">Schedule & Rates</h4>
              <p className="text-charcoal-600">Define your timezone availability slots for US students and hourly pricing.</p>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="w-8 h-8 rounded-full bg-navy-800 text-white font-bold flex items-center justify-center mb-3">4</div>
              <h4 className="font-bold text-navy-800 text-sm mb-1">Admin Verification</h4>
              <p className="text-charcoal-600">Compliance review of university degrees and background credentials within 48 hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Application Modal / Multi-step Form */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lift border border-gray-200 my-8 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-navy-800 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Classly Educator Application</h3>
                <p className="text-xs text-gray-300">Step {currentStep} of 4: {
                  currentStep === 1 ? 'Personal Information' :
                  currentStep === 2 ? 'Teaching Credentials & Subjects' :
                  currentStep === 3 ? 'Pricing & Time Slots' : 'Verification Documents'
                }</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Stepper bar */}
            <div className="flex h-1.5 bg-gray-100">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex-1 transition-all ${
                    currentStep >= step ? 'bg-accent-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {isSubmitted ? (
                /* Success / Application Pending Screen */
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-accent-50 text-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-navy-800 mb-2">
                    Application Successfully Submitted!
                  </h4>
                  <p className="text-xs text-charcoal-600 max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you, <strong>{formData.fullName}</strong>. Your teacher application has been safely registered with ID <strong>#TUT-{Math.floor(1000 + Math.random() * 9000)}</strong>.
                  </p>
                  
                  <div className="p-4 bg-softblue-50 border border-softblue-200 rounded-lg text-left text-xs text-charcoal-700 max-w-md mx-auto mb-6 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-navy-800">
                      <ShieldCheck className="w-4 h-4 text-accent-500" />
                      <span>Application Status: Pending Review</span>
                    </div>
                    <p className="text-[11px] text-charcoal-600">
                      As part of our K-12 safety policy, our academic compliance team will review your submitted credentials within 24 to 48 hours. Teachers cannot publish public classes until approved by an administrator.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Link
                      href="/dashboard/teacher"
                      className="px-6 py-2.5 bg-navy-800 text-white rounded-lg text-xs font-bold hover:bg-navy-900"
                    >
                      Preview Teacher Dashboard
                    </Link>
                    <button
                      onClick={() => setShowApplyModal(false)}
                      className="px-6 py-2.5 bg-gray-100 text-charcoal-700 rounded-lg text-xs font-medium hover:bg-gray-200"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  
                  {/* STEP 1: Personal Info */}
                  {currentStep === 1 && (
                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-charcoal-700 mb-1">Full Legal Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="e.g. Dr. Ramesh Gupta"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-navy-600 focus:bg-white text-navy-800"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-charcoal-700 mb-1">Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-navy-600 focus:bg-white text-navy-800"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-charcoal-700 mb-1">Phone Number (with Country Code) *</label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+91 98765 43210"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-navy-600 focus:bg-white text-navy-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-charcoal-700 mb-1">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="e.g. New Delhi, Bengaluru"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-navy-600 focus:bg-white text-navy-800"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-charcoal-700 mb-1">Country *</label>
                          <select
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                          >
                            <option value="India">India</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Teaching Information */}
                  {currentStep === 2 && (
                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-charcoal-700 mb-1">Highest Degree / University Qualification *</label>
                        <input
                          type="text"
                          name="education"
                          required
                          value={formData.education}
                          onChange={handleInputChange}
                          placeholder="e.g. M.Sc. in Physics from IIT Bombay"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-navy-600 focus:bg-white text-navy-800"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-charcoal-700 mb-1">Primary Subjects Taught *</label>
                        <select
                          name="subjects"
                          value={formData.subjects[0]}
                          onChange={(e) => setFormData({ ...formData, subjects: [e.target.value] })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                        >
                          <option value="Mathematics">Mathematics (Pre-Algebra to AP Calculus)</option>
                          <option value="Physics">Physics (High School & AP Physics)</option>
                          <option value="Chemistry">Chemistry (Honors & AP Chemistry)</option>
                          <option value="Biology">Biology (Life Sciences & AP Biology)</option>
                          <option value="Computer Science">Computer Science (Python & Java)</option>
                          <option value="English">English Language & Literature</option>
                          <option value="History">History & Social Studies</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-charcoal-700 mb-1">Years of Teaching Experience *</label>
                        <select
                          name="experienceYears"
                          value={formData.experienceYears}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                        >
                          <option value="2">2 - 4 years</option>
                          <option value="5">5 - 7 years</option>
                          <option value="8">8 - 10 years</option>
                          <option value="11">11+ years</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-charcoal-700 mb-1">Short Biography & Teaching Approach *</label>
                        <textarea
                          name="bio"
                          required
                          rows={3}
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Briefly describe your pedagogical methodology, experience with US curricula, and how you engage students..."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-navy-600 focus:bg-white text-navy-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Pricing and Availability */}
                  {currentStep === 3 && (
                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-charcoal-700 mb-1">Requested Hourly Rate (USD) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-charcoal-400 font-bold">$</span>
                          <input
                            type="number"
                            name="hourlyRate"
                            min="15"
                            max="70"
                            required
                            value={formData.hourlyRate}
                            onChange={handleInputChange}
                            className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-navy-600 focus:bg-white text-navy-800 font-bold"
                          />
                        </div>
                        <span className="text-[11px] text-charcoal-500">Most tutors start between $20 - $35/hr.</span>
                      </div>

                      <div>
                        <label className="block font-semibold text-charcoal-700 mb-1">Teaching Formats Offered *</label>
                        <select
                          name="teachingFormat"
                          value={formData.teachingFormat}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-navy-800"
                        >
                          <option value="both">Both 1-on-1 Lessons & Small Group Classes</option>
                          <option value="one_on_one">1-on-1 Private Lessons Only</option>
                          <option value="group">Group Classes Only</option>
                        </select>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="font-semibold text-navy-800 block mb-1">Preferred Time Slots (US Timezones)</span>
                        <p className="text-[11px] text-charcoal-600">
                          Classly sessions typically occur between 4:00 PM – 9:00 PM US Eastern Time (which corresponds to morning or evening slots in India). You can customize your specific availability calendar in the dashboard after approval.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Verification & Document Upload */}
                  {currentStep === 4 && (
                    <div className="space-y-4 text-xs">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-center bg-gray-50/50 hover:bg-white cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="font-bold text-navy-800 block text-xs">Upload Government ID & University Degrees</span>
                        <span className="text-[11px] text-charcoal-500 block mt-1">Aadhaar / Passport / Degree Certificate (PDF or JPG)</span>
                        <span className="mt-2 inline-block px-3 py-1 bg-white border border-gray-200 rounded text-[11px] text-navy-800 font-medium">
                          Select Files
                        </span>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="flex items-start gap-2 cursor-pointer text-charcoal-700">
                          <input
                            type="checkbox"
                            name="agreeToTerms"
                            required
                            checked={formData.agreeToTerms}
                            onChange={handleInputChange}
                            className="mt-0.5 accent-navy-800"
                          />
                          <span className="text-[11px]">
                            I certify that all educational credentials submitted are genuine. I agree to Classly's Educator Code of Conduct, child protection standards, and understand that account approval is subject to administrator review.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Wizard Buttons */}
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                        className="px-4 py-2 border border-gray-300 text-charcoal-700 rounded-lg text-xs font-medium hover:bg-gray-50"
                      >
                        Back
                      </button>
                    ) : <div />}

                    <button
                      type="submit"
                      className="px-6 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-bold transition shadow-subtle"
                    >
                      {currentStep === 4 ? 'Submit Application' : 'Next Step →'}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

