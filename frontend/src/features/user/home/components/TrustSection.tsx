import { motion } from 'framer-motion';
import { Award, Clock, Shield, Star } from 'lucide-react';

import type { WhyChooseContent } from '@/types/home/home.sectionContent';

interface TrustSectionProps {
  section: WhyChooseContent;
}

export default function TrustSection({ section }: TrustSectionProps) {
  const { title, subTitle, items: trustPoints } = section;

  return (
    <section className="bg-section-dark py-20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-background">
            {title || 'Why Choose Workzy?'}
          </h2>
          <p className="text-xl text-muted">{subTitle || 'Your trust, our priority'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                className="group"
              >
                <div className="relative h-48 rounded-2xl overflow-hidden mb-4 shadow-lg border border-white/10">
                  <img
                    src={point.imageUrl}
                    alt={point.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 to-black/30" />
                  <div className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="text-3xl font-bold text-white">{point.stat}</div>
                  </div>
                </div>
                <h3 className="text-base font-semibold mb-1 text-background">{point.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{point.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
