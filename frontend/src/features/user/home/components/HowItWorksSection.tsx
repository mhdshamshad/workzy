import { CheckCircle, Search, Users } from 'lucide-react';

import { AppCarousel } from '@/components/molecules/AppCarousel';
import type { HowItWorksContent, HowItWorksStep } from '@/types/home/home.sectionContent';

interface HowItWorksSectionProps {
  section: HowItWorksContent;
}

export default function HowItWorksSection({ section }: HowItWorksSectionProps) {
  const { title, subTitle, steps } = section;

  return (
    <section className="py-4 md:py-6 bg-card transition-colors duration-300">
      <div className="section-container">
        <AppCarousel
          items={steps}
          title={title || 'How It Works'}
          subTitle={subTitle || 'Simple, secure, and transparent'}
          className="basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/3 xl:basis-1/3"
          renderItem={(item: HowItWorksStep) => {
            const IconComponent = item.step === 1 ? Search : item.step === 2 ? Users : CheckCircle;

            return (
              <div className="group p-3.5 sm:p-5 md:p-6 rounded-2xl bg-card border border-border hover:shadow-xl transition-shadow flex flex-col justify-between h-full">
                <div>
                  <div className="relative h-28 sm:h-40 md:h-52 rounded-xl overflow-hidden mb-3 sm:mb-5">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 w-6 h-6 sm:w-10 sm:h-10 bg-fine-blue rounded-full flex items-center justify-center font-bold text-xs sm:text-base text-white shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-3">
                    <div className="p-1 sm:p-2 bg-fine-blue/10 rounded-lg shrink-0">
                      <IconComponent className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-fine-blue" />
                    </div>
                    <h3 className="text-xs sm:text-base md:text-lg font-bold text-card-foreground line-clamp-1 sm:line-clamp-none">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          }}
        />
      </div>
    </section>
  );
}
