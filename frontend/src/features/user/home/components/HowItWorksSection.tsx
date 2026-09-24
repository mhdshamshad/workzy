import { motion } from 'framer-motion';
import { CheckCircle, Search, Users } from 'lucide-react';

import type { HowItWorksContent } from '@/types/home/home.sectionContent';

interface HowItWorksSectionProps {
  section: HowItWorksContent;
}

export default function HowItWorksSection({ section }: HowItWorksSectionProps) {
  const { title, subTitle, steps } = section;

  return (
    <section className="py-16 bg-card transition-colors duration-300">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {title || 'How It Works'}
          </h2>
          <p className="text-xl text-muted-foreground">
            {subTitle || 'Simple, secure, and transparent'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, i) => {
            const IconComponent = item.step === 1 ? Search : item.step === 2 ? Users : CheckCircle;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.4, delay: i * 0.12, ease: 'easeOut' }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group p-6 rounded-2xl bg-card border border-border hover:shadow-xl transition-shadow"
              >
                <div className="relative h-52 rounded-xl overflow-hidden mb-6">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 bg-fine-blue rounded-full flex items-center justify-center font-bold text-lg text-white shadow-lg">
                    {item.step}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-fine-blue/10 rounded-lg">
                    <IconComponent className="w-5 h-5 text-fine-blue" />
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
