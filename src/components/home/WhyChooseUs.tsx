import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Target, 
  Users, 
  Monitor, 
  DollarSign 
} from 'lucide-react';

export function WhyChooseUs() {
  const features = [
    {
      title: 'Verified Teachers',
      description: 'Every educator undergoes a 4-step credential audit verifying their university degrees, teaching certifications, and identity before teaching a single class.',
      icon: <ShieldCheck className="w-5 h-5 text-accent-500" />,
    },
    {
      title: 'Flexible Scheduling',
      description: 'Find time slots that fit your student’s afternoon or weekend routine across US timezones (Eastern, Central, Mountain, and Pacific).',
      icon: <Clock className="w-5 h-5 text-navy-800" />,
    },
    {
      title: 'Personalized Learning',
      description: 'Instruction adapted to the student’s unique school syllabus, homework challenges, and standardized test targets (AP, SAT, ACT).',
      icon: <Target className="w-5 h-5 text-accent-500" />,
    },
    {
      title: '1-on-1 & Group Sessions',
      description: 'Choose between focused private one-to-one tutoring or cost-effective small group masterclasses with peer interaction.',
      icon: <Users className="w-5 h-5 text-navy-800" />,
    },
    {
      title: 'Secure Online Classrooms',
      description: 'Purpose-built interactive video classrooms with dual-user digital whiteboards, screen sharing, and restricted participant access.',
      icon: <Monitor className="w-5 h-5 text-accent-500" />,
    },
    {
      title: 'Transparent Pricing',
      description: 'No hidden booking fees, no compulsory monthly subscriptions. Pay per lesson directly with simple, clear tutor hourly rates.',
      icon: <DollarSign className="w-5 h-5 text-navy-800" />,
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-offwhite/50 border-b border-gray-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">
            The Classly Advantage
          </h2>
          <p className="text-3xl font-bold text-navy-800 tracking-tight">
            Why Parents & Students Choose Classly
          </p>
          <p className="mt-3 text-sm text-charcoal-600 leading-relaxed">
            We combine high-caliber pedagogical talent with modern technology to deliver accountable, measurable academic growth.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-subtle hover:shadow-card transition duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-softblue-50 border border-softblue-200 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-navy-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

