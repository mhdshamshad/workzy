import { ArrowRight, BadgeCheck, Lock, RotateCcw, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/atoms/Button';

interface CTASectionProps {
  onBecomeProvider?: () => void;
  isVerified?: boolean;
}

const TRUST_POINTS = [
  { icon: BadgeCheck, label: 'Verified professionals' },
  { icon: Lock, label: 'Secure payments' },
  { icon: RotateCcw, label: '10-day rework promise' },
];

export default function CTASection({ isVerified, onBecomeProvider }: CTASectionProps) {
  const navigate = useNavigate();
  const handleJoinClick = () => {
    if (onBecomeProvider) {
      onBecomeProvider();
    } else {
      navigate('/join-us');
    }
  };

  return (
    <section className="bg-background ">
      <div className="relative overflow-hidden  bg-[oklch(21.48%_0.03444_254.607)] px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[40px_40px]" />
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to get{' '}
            <span className="bg-linear-to-r from-golden to-amber-200 bg-clip-text text-transparent">
              started?
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
            Book trusted professionals near you, or grow your own service business on Workzy.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => navigate('/services')}
              iconRight={<ArrowRight className="h-5 w-5" />}
              className="rounded-full bg-white px-8 py-6 text-base font-semibold text-slate-900 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              Book a Service
            </Button>
            <Button
              iconLeft={<Users className="h-5 w-5" />}
              className="rounded-full border border-white/30 bg-white/10 px-8 py-6 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/20"
              disabled={isVerified}
              onClick={handleJoinClick}
            >
              Become a Professional
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-300">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-golden" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
