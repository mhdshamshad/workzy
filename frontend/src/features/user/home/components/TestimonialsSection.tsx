import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';

import type { TestimonialsContent } from '@/types/home/home.sectionContent';

type TestimonialsSectionProps = Pick<TestimonialsContent, 'items' | 'title'>;

export default function TestimonialsSection({ items, title }: TestimonialsSectionProps) {
  return (
    <section className="py-16 bg-section-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-600 text-sm mb-4 shadow-md">
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            Customer Love
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {title || 'What Our Customers Say'}
          </h2>
          <p className="text-xl text-muted-foreground">Real reviews from real people</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-border"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${j < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/20'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-6 italic leading-relaxed line-clamp-4">
                "{testimonial.comment}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <img
                  src={testimonial.imageUrl}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {testimonial.service}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{testimonial.date}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
