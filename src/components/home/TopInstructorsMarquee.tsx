'use client';

import React from 'react';
import Image from 'next/image';
import { FadeIn } from '@/components/ui/MotionComponents';
import {
  AmazonLogo,
  MicrosoftLogo,
  PayPalLogo,
  MetaLogo,
  SamsungLogo,
  MastercardLogo,
  FractalLogo,
} from './CompanyLogos';

interface Instructor {
  name: string;
  rolePrefix: string;
  logo: React.ReactNode;
  image: string;
  linkedin: string;
}

const INSTRUCTORS: Instructor[] = [
  {
    name: 'Rajat Garg',
    rolePrefix: 'Bosscoder, Ex-',
    logo: <MicrosoftLogo className="h-3.5 w-auto text-white" />,
    image: '/images/faculty/rajat-garg.png',
    linkedin: 'https://www.linkedin.com/in/rajatgarg',
  },
  {
    name: 'Manish Garg',
    rolePrefix: 'Bosscoder, Ex-',
    logo: <SamsungLogo className="h-3 w-auto text-white" />,
    image: '/images/faculty/manish-garg.png',
    linkedin: 'https://www.linkedin.com/in/manish-garg',
  },
  {
    name: 'Ashish Prasad',
    rolePrefix: 'SDE,',
    logo: <MicrosoftLogo className="h-3.5 w-auto text-white" />,
    image: '/images/faculty/ashish-prasad.png',
    linkedin: 'https://www.linkedin.com/in/ashish-prasad',
  },
  {
    name: 'Geetika Singh',
    rolePrefix: 'SDE II,',
    logo: <AmazonLogo className="h-3.5 w-auto text-white" />,
    image: '/images/faculty/geetika-singh.png',
    linkedin: 'https://www.linkedin.com/in/geetika-singh',
  },
  {
    name: 'Mudita Sharma',
    rolePrefix: 'Data Engineer,',
    logo: <FractalLogo className="h-3.5 w-auto" />,
    image: '/images/faculty/mudita-sharma.png',
    linkedin: 'https://www.linkedin.com/in/mudita-sharma',
  },
  {
    name: 'Gaurav',
    rolePrefix: 'Data Engineer II,',
    logo: <MastercardLogo className="h-4 w-auto text-white" />,
    image: '/images/faculty/gaurav.png',
    linkedin: 'https://www.linkedin.com/in/gaurav',
  },
];

export function TopInstructorsMarquee() {
  // We duplicate the list twice for an unbroken seamless infinite marquee loop
  const marqueeList = [...INSTRUCTORS, ...INSTRUCTORS];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-[#09090b] border-b border-gray-200/80 dark:border-[#27272a] transition-colors duration-200 overflow-hidden select-none">
      
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12">
        <FadeIn direction="up" delay={0.05} duration={0.5}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            
            {/* Left: Tag + Headline */}
            <div>
              <span className="text-xs font-bold text-accent-600 dark:text-amber-400 tracking-[1.5px] uppercase block mb-2.5">
                Future-Ready Curriculum
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-navy-950 dark:text-white tracking-tight leading-[1.18]">
                Curriculum Designed & Taught by<br className="hidden sm:inline" /> Top Product Engineers
              </h2>
            </div>

            {/* Right: MAANG Companies Banner */}
            <div className="flex flex-col lg:items-end gap-2.5 pt-2 lg:pt-0">
              <p className="text-xs sm:text-sm font-medium text-charcoal-500 dark:text-zinc-400">
                Working in Top MAANG companies
              </p>
              <div className="flex items-center gap-5 sm:gap-6 flex-wrap text-navy-950 dark:text-white">
                <div className="h-6 sm:h-7 flex items-center opacity-85 hover:opacity-100 transition-all hover:scale-105 duration-200" title="Amazon">
                  <AmazonLogo className="h-5 sm:h-5.5 w-auto" />
                </div>
                <div className="h-6 sm:h-7 flex items-center opacity-85 hover:opacity-100 transition-all hover:scale-105 duration-200" title="Microsoft">
                  <MicrosoftLogo className="h-4.5 sm:h-5 w-auto" />
                </div>
                <div className="h-6 sm:h-7 flex items-center opacity-85 hover:opacity-100 transition-all hover:scale-105 duration-200" title="PayPal">
                  <PayPalLogo className="h-4.5 sm:h-5 w-auto" />
                </div>
                <div className="h-6 sm:h-7 flex items-center opacity-85 hover:opacity-100 transition-all hover:scale-105 duration-200" title="Meta">
                  <MetaLogo className="h-4.5 sm:h-5 w-auto" />
                </div>
              </div>
            </div>

          </div>
        </FadeIn>
      </div>

      {/* Marquee Carousel Track */}
      <div className="relative w-full overflow-hidden py-2">
        
        {/* Soft edge fade masks on left and right */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 lg:w-32 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#09090b] dark:via-[#09090b]/80 dark:to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 lg:w-32 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-[#09090b] dark:via-[#09090b]/80 dark:to-transparent z-20 pointer-events-none" />

        {/* Animated Marquee Flex Strip */}
        <div className="flex gap-5 sm:gap-6 animate-marquee hover:[animation-play-state:paused] w-max">
          {marqueeList.map((inst, idx) => (
            <div
              key={`${inst.name}-${idx}`}
              className="w-[260px] sm:w-[280px] lg:w-[295px] flex-shrink-0 group cursor-pointer transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="relative rounded-[22px] overflow-hidden border border-navy-800 shadow-subtle group-hover:shadow-lift transition-shadow duration-300 bg-[#121215]">
                
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
                <div className="bg-[#121215] px-4 py-3.5 sm:px-5 sm:py-4 text-white">
                  
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
                      {inst.logo}
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
