import { ArrowRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/atoms/Button';

interface CTASectionProps {
  onBecomeProvider?: () => void;
  isVerified?: boolean;
}
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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&q=75&auto=format&fit=crop"
          alt="Workzy Service Platform"
          width="1200"
          height="450"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[oklch(0.18_0.02_250/0.9)] "></div>
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>

        <p className="text-xl text-white/90 mb-10 leading-relaxed">
          Join 12M+ users who trust Workzy for their service needs. Secure payments, verified
          professionals, and quality guaranteed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/services')}
            iconRight={<ArrowRight className="w-5 h-5" />}
            className="bg-white text-indigo-600 px-10 py-7 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl hover:bg-white hover:-translate-y-1 transition-all"
          >
            Book a Service
          </Button>
          <Button
            iconLeft={<Users className="w-5 h-5" />}
            className="bg-white/10 backdrop-blur-md border-2 border-white text-white px-12 py-7 rounded-full font-bold text-lg hover:bg-white/20 transition-all inline-flex items-center"
            disabled={isVerified}
            onClick={handleJoinClick}
          >
            Become a Professional
          </Button>
        </div>
      </div>
    </section>
  );
}
