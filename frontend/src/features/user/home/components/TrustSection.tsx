import { motion } from 'framer-motion';
import { Award, Clock, Shield, Star } from 'lucide-react';

import type { WhyChooseContent } from '@/types/home/home.sectionContent';

interface TrustSectionProps {
  section: WhyChooseContent;
}

export default function TrustSection({ section }: TrustSectionProps) {
  const { title, subTitle, items: trustPoints } = section;

  return (
    <section className="bg-section-dark py-10 sm:py-14 md:py-20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3 text-background">
            {title || 'Why Choose Workzy?'}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted">
            {subTitle || 'Your trust, our priority'}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {trustPoints.map((point, idx) => {
            const IconComponent =
              point.icon === 'Shield'
                ? Shield
                : point.icon === 'Star'
                  ? Star
                  : point.icon === 'Clock'
                    ? Clock
                    : Award;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: 'easeOut' }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-28 sm:h-36 md:h-48 rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-4 shadow-lg border border-white/10">
                    <img
                      src={point.imageUrl}
                      alt={point.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 to-black/30" />
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-7 h-7 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl flex items-center justify-center border border-white/30">
                      <IconComponent className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4">
                      <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                        {point.stat}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-0.5 sm:mb-1 text-background line-clamp-1 sm:line-clamp-none">
                    {point.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs md:text-sm text-muted leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {point.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
