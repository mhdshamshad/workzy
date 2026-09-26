import { motion } from 'framer-motion';
import { useRef } from 'react';

import { HeroCarousel } from '@/components/organisms/HeroCarousel';
import { HOME_SECTION_TYPE } from '@/constants';
import BannerSection from '@/features/user/home/components/BannerSection';
import CategoryShowcaseSection from '@/features/user/home/components/CategoryShowcaseSection';
import CTASection from '@/features/user/home/components/CTASection';
import HowItWorksSection from '@/features/user/home/components/HowItWorksSection';
import LoadingHome from '@/features/user/home/components/LoadingHome';
import NearWorkersSection from '@/features/user/home/components/NearWorkersSection';
import TestimonialsSection from '@/features/user/home/components/TestimonialsSection';
import TopServiceSection from '@/features/user/home/components/TopServiceSection';
import TrustSection from '@/features/user/home/components/TrustSection';
import { useHomeSections } from '@/features/user/home/hooks/useHomeSections';

import PageError from './PageError';

const appStats = {
  customers: '12M+',
  professionals: '50K+',
  rating: '4.8',
  services: '200+',
};

function SectionReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const categoryShowcaseRef = useRef<HTMLDivElement | null>(null);
  const { homeData, isLoading, error } = useHomeSections();

  if (isLoading) {
    return <LoadingHome />;
  }
  if (error || !homeData) {
    return <PageError title={error?.message} fullScreen />;
  }

  const sections = [...homeData.sections].sort((a, b) => a.order - b.order);

  return (
    <main>
      {sections.map(section => {
        switch (section.type) {
          case HOME_SECTION_TYPE.HERO:
            return (
              <motion.div
                key={section.order}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <HeroCarousel data={section} stats={appStats} />
              </motion.div>
            );

          case HOME_SECTION_TYPE.CATEGORY_SHOWCASE:
            return (
              <SectionReveal key={section.order}>
                <div ref={categoryShowcaseRef}>
                  <CategoryShowcaseSection section={section} />
                </div>
              </SectionReveal>
            );

          case HOME_SECTION_TYPE.BANNER:
            return (
              <SectionReveal key={section.order}>
                <BannerSection section={section} />
              </SectionReveal>
            );

          case HOME_SECTION_TYPE.TOP_SERVICES:
            return (
              <SectionReveal key={section.order}>
                <TopServiceSection section={section} />
              </SectionReveal>
            );

          case HOME_SECTION_TYPE.NEARBY_WORKERS:
            return (
              <SectionReveal key={section.order}>
                <NearWorkersSection section={section} />
              </SectionReveal>
            );

          case HOME_SECTION_TYPE.TESTIMONIALS:
            return (
              <SectionReveal key={section.order}>
                <TestimonialsSection items={section.items} title={section.title} />
              </SectionReveal>
            );

          case HOME_SECTION_TYPE.HOW_IT_WORKS:
            return (
              <SectionReveal key={section.order}>
                <HowItWorksSection section={section} />
              </SectionReveal>
            );

          case HOME_SECTION_TYPE.WHY_CHOOSE:
            return (
              <SectionReveal key={section.order}>
                <TrustSection section={section} />
              </SectionReveal>
            );
          default:
            return null;
        }
      })}
      <SectionReveal>
        <CTASection />
      </SectionReveal>
    </main>
  );
}
