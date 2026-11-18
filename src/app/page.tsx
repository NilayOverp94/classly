import React from 'react';
import { Hero } from '@/components/home/Hero';
import { PopularSubjects } from '@/components/home/PopularSubjects';
import { TopInstructorsMarquee } from '@/components/home/TopInstructorsMarquee';
import { FeaturedTutors } from '@/components/home/FeaturedTutors';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <PopularSubjects />
      <TopInstructorsMarquee />
      <FeaturedTutors />
      <HowItWorksSection />
      <WhyChooseUs />
      <CTASection />
    </div>
  );
}

