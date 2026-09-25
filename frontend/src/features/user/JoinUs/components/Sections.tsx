import { ArrowRight, ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import type { FAQItemProps, FeatureCardProps } from '@/constants/landingItems';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}
interface ProcessStepProps {
  number: string | number;
  title: string;
  description: string;
  isLast?: boolean;
}

// Process Step component
export const ProcessStep: React.FC<ProcessStepProps> = ({
  number,
  title,
  description,
  isLast = false,
}) => {
  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-golden text-(--golden-dark) font-bold text-xl">
          {number}
        </div>
        {!isLast && <div className="w-0.5 h-full bg-golden/30 my-2"></div>}
      </div>
      <div className="pb-10">
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

// FAQ Item component
export const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        className="flex justify-between items-center w-full py-5 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-foreground">{question}</h3>
        <ChevronDown
          className={`h-5 w-5 text-golden transition-transform duration-300 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}
      >
        <p className="text-muted-foreground">{answer}</p>
      </div>
    </div>
  );
};

export const MetricCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="bg-golden rounded-lg p-4 shadow-xl transform transition-transform duration-300 hover:scale-105">
    <div className="flex items-center space-x-3">
      <div className="bg-white rounded-full p-2">
        <ArrowRight className="h-5 w-5 text-golden" />
      </div>
      <div>
        <p className="font-bold text-slate-950">{value}</p>
        <p className="text-xs text-slate-900/80">{label}</p>
      </div>
    </div>
  </div>
);

// Feature Card component
export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border">
      <div className="absolute top-0 right-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-linear-to-br from-golden/20 to-golden/5"></div>
      <div className="relative z-10">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-section-dark text-golden transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="mb-3 text-xl font-bold text-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

// Custom animated counter component
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString(), 10);
    if (start === end) {
      return;
    }

    const element = countRef.current;
    let timer: ReturnType<typeof setInterval> | null = null;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          timer = setInterval(() => {
            start += Math.ceil(end / (duration / 50));
            if (start >= end) {
              setCount(end);
              if (timer) {
                clearInterval(timer);
              }
            } else {
              setCount(start);
            }
          }, 50);

          if (element) {
            observer.unobserve(element);
          }
        }
      },
      { threshold: 0.5 }
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
      if (element) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [value, duration]);

  return (
    <span
      ref={countRef}
      className="text-3xl sm:text-4xl lg:text-6xl font-bold text-golden block truncate"
    >
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};
