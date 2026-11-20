import React from 'react';
import { NewHero } from '@/components/home/NewHero';
import { TopInstructorsMarquee } from '@/components/home/TopInstructorsMarquee';
import { InteractiveClassroomShowcase } from '@/components/home/InteractiveClassroomShowcase';
import { CurriculumBentoMatrix } from '@/components/home/CurriculumBentoMatrix';
import { FeaturedTutors } from '@/components/home/FeaturedTutors';
import { InteractiveHowItWorks } from '@/components/home/InteractiveHowItWorks';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NewHero />
      <TopInstructorsMarquee />
      <InteractiveClassroomShowcase />
      <CurriculumBentoMatrix />
      <FeaturedTutors />
      <InteractiveHowItWorks />
      <CTASection />
    </div>
  );
}
