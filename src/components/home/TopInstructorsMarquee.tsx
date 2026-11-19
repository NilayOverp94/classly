'use client';

import React from 'react';
import Image from 'next/image';
import { FadeIn } from '@/components/ui/MotionComponents';

interface Instructor {
  name: string;
  rolePrefix: string;
  companyLogo: string;
  companyAlt: string;
  image: string;
  linkedin: string;
  logoHeight?: number;
}

const INSTRUCTORS: Instructor[] = [
  {
    name: 'Rajat Garg',
    rolePrefix: 'Bosscoder, Ex-',
    companyLogo: '/images/faculty/logos/microsoft.webp',
    companyAlt: 'Microsoft',
    image: '/images/faculty/rajat-garg.png',
    linkedin: 'https://www.linkedin.com/in/rajatgarg',
  },
  {
    name: 'Manish Garg',
    rolePrefix: 'Bosscoder, Ex-',
    companyLogo: '/images/faculty/logos/samsung.webp',
    companyAlt: 'Samsung',
    image: '/images/faculty/manish-garg.png',
    linkedin: 'https://www.linkedin.com/in/manish-garg',
  },
  {
    name: 'Ashish Prasad',
    rolePrefix: 'SDE,',
    companyLogo: '/images/faculty/logos/microsoft.webp',
    companyAlt: 'Microsoft',
    image: '/images/faculty/ashish-prasad.png',
    linkedin: 'https://www.linkedin.com/in/ashish-prasad',
  },
  {
    name: 'Geetika Singh',
    rolePrefix: 'SDE II,',
    companyLogo: '/images/faculty/logos/amazon.webp',
    companyAlt: 'Amazon',
    image: '/images/faculty/geetika-singh.png',
    linkedin: 'https://www.linkedin.com/in/geetika-singh',
  },
  {
    name: 'Mudita Sharma',
    rolePrefix: 'Data Engineer,',
    companyLogo: '/images/faculty/logos/fractal.webp',
    companyAlt: 'Fractal Analytics',
    image: '/images/faculty/mudita-sharma.png',
    linkedin: 'https://www.linkedin.com/in/mudita-sharma',
  },
  {
    name: 'Gaurav',
    rolePrefix: 'Data Engineer II,',
    companyLogo: '/images/faculty/logos/mastercard.webp',
    companyAlt: 'Mastercard',
    image: '/images/faculty/gaurav.png',
    linkedin: 'https://www.linkedin.com/in/gaurav',
  },
];

const MAANG_LOGOS = [
  { name: 'Amazon', logo: '/images/faculty/logos/header-amazon.webp', width: 90, height: 28 },
  { name: 'Microsoft', logo: '/images/faculty/logos/header-microsoft.webp', width: 95, height: 26 },
  { name: 'PayPal', logo: '/images/faculty/logos/header-paypal.webp', width: 85, height: 24 },
  { name: 'Meta', logo: '/images/faculty/logos/header-meta.webp', width: 80, height: 24 },
];

export function TopInstructorsMarquee() {
  // We duplicate the list twice for an unbroken seamless infinite marquee loop
  const marqueeList = [...INSTRUCTORS, ...INSTRUCTORS];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white border-b border-gray-200/80 overflow-hidden select-none">
      
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12">
        <FadeIn direction="up" delay={0.05} duration={0.5}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            
            {/* Left: Tag + Headline */}
            <div>
              <span className="text-xs font-bold text-accent-600 tracking-[1.5px] uppercase block mb-2.5">
                Future-Ready Curriculum
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-navy-950 tracking-tight leading-[1.18]">
                Curriculum Designed & Taught by<br className="hidden sm:inline" /> Top Product Engineers
              </h2>
            </div>

            {/* Right: MAANG Companies Banner */}
            <div className="flex flex-col lg:items-end gap-2.5 pt-2 lg:pt-0">
              <p className="text-xs sm:text-sm font-medium text-charcoal-500">
                Working in Top MAANG companies
              </p>
              <div className="flex items-center gap-5 sm:gap-6 flex-wrap">
                {MAANG_LOGOS.map((company) => (
                  <div key={company.name} className="h-6 sm:h-7 relative flex items-center transition-transform hover:scale-105 duration-200">
                    <Image
                      src={company.logo}
                      alt={company.name}
                      width={company.width}
                      height={company.height}
                      className="object-contain h-full w-auto opacity-80 hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </FadeIn>
      </div>

      {/* Marquee Carousel Track */}
      <div className="relative w-full overflow-hidden py-2">
        
        {/* Soft edge fade masks on left and right */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 lg:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 lg:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />

        {/* Animated Marquee Flex Strip */}
        <div className="flex gap-5 sm:gap-6 animate-marquee hover:[animation-play-state:paused] w-max">
          {marqueeList.map((inst, idx) => (
            <div
              key={`${inst.name}-${idx}`}
              className="w-[260px] sm:w-[280px] lg:w-[295px] flex-shrink-0 group cursor-pointer transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="relative rounded-[22px] overflow-hidden border border-navy-800 shadow-subtle group-hover:shadow-lift transition-shadow duration-300 bg-[#0B121E]">
                
                {/* Instructor Studio Portrait */}
                <div className="relative w-full h-[280px] sm:h-[305px] lg:h-[315px] bg-black overflow-hidden flex items-end justify-center">
                  <Image
                    src={inst.image}
                    alt={inst.name}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 260px, (max-width: 1024px) 280px, 295px"
                  />
                </div>

                {/* Bottom Dark Pill Overlay */}
                <div className="bg-[#0B121E] px-4 py-3.5 sm:px-5 sm:py-4 text-white">
                  
                  {/* Row 1: Name + LinkedIn Badge */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-base sm:text-[17px] text-white tracking-tight leading-tight truncate">
                      {inst.name}
                    </h3>
                    <a
                      href={inst.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${inst.name} LinkedIn Profile`}
                      className="flex-shrink-0 w-5 h-5 rounded-[4px] bg-[#0A66C2] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        className="w-3 h-3 fill-white"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  </div>

                  {/* Row 2: Role Prefix + White Company Logo */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium overflow-hidden">
                    <span className="truncate text-[11px] sm:text-xs text-gray-300/90 font-medium">
                      {inst.rolePrefix}
                    </span>
                    <div className="relative h-4 sm:h-4.5 w-auto flex-shrink-0 flex items-center">
                      <Image
                        src={inst.companyLogo}
                        alt={inst.companyAlt}
                        width={65}
                        height={16}
                        className="object-contain h-3.5 sm:h-4 w-auto"
                      />
                    </div>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}
