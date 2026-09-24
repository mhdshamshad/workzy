import { motion } from 'framer-motion';
import { ArrowRight, PawPrint, Phone, Settings, Smartphone } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import { WORKER_STATUS } from '@/constants';
import { FAQ_ITEMS, FEATURE_CARDS, PROCESS_STEPS, STATS_CARDS } from '@/constants/landingItems';
import CTASection from '@/features/user/home/components/CTASection';
import BecomeWorkerForm from '@/features/user/JoinUs/components/BecomeWorkerForm';
import {
  AnimatedCounter,
  FAQItem,
  FeatureCard,
  MetricCard,
  ProcessStep,
} from '@/features/user/JoinUs/components/Sections';
import { useMyWorkerProfile, useWorkerJoin } from '@/features/user/JoinUs/hooks/useWorkerJoin';
import type { JoinWorkerSchemaType } from '@/features/user/JoinUs/validation/JoinWorkerFormSchema';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

import become_wokrer_img from '../assets/images/become_wokrer.webp';
import workerImg from '../assets/images/worker_image.webp';
export default function JoinUsPage() {
  const navigate = useNavigate();
  const applyNowRef = useRef<HTMLElement | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const { user } = useAppSelector((state: RootState) => state.auth);

  const { data, isLoading } = useMyWorkerProfile(user?.id);
  const { joinWorker, resubmitWorker, isPending } = useWorkerJoin();
  const isVerified = data?.status === WORKER_STATUS.VERIFIED;

  async function onSubmit(formData: JoinWorkerSchemaType) {
    if (!user?.id) {
      return;
    }

    if (data?.id) {
      const res = await resubmitWorker({ workerId: data.id, data: formData });
      toast.success(res.message);
    } else {
      const res = await joinWorker(formData);
      toast.success(res.message);
    }
    setFormOpen(false);
  }

  const openFormAndScroll = () => {
    if (!user) {
      navigate('/login');
    }
    setFormOpen(true);
    requestAnimationFrame(() => {
      applyNowRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  return (
    <main>
      <section className="relative bg-linear-to-br from-[oklch(89.1% 0.01315 266.734)] to-[oklch(89.1% 0.01315 266.734)] bg-[oklch(21.48%_0.03444_254.607)] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-golden animate-pulse"></div>
          <div
            className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-golden/50 animate-pulse"
            style={{ animationDelay: '1s', animationDuration: '4s' }}
          ></div>
          <div
            className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-golden/30 animate-pulse"
            style={{ animationDelay: '2s', animationDuration: '5s' }}
          ></div>
        </div>

        <div className="section-container py-20 relative z-10 ">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-golden/20 text-golden text-sm font-medium mb-2 self-start">
                <PawPrint className="h-4 w-4 mr-2" />
                <span>Trusted by 2,000+ Service Professionals</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Grow Your Service Business with <span className="text-golden">Workzy</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Join thousands of service providers expanding their reach and transforming their
                business with our all-in-one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {!isVerified && (
                  <Button
                    size="lg"
                    onClick={openFormAndScroll}
                    className="bg-golden hover:bg-golden/90 text-section-dark px-8 py-6 text-lg rounded-full shadow-lg transform transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="absolute -top-6 -left-6 w-full h-full rounded-2xl border border-golden/30 animate-pulse"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
                <img
                  src={workerImg}
                  alt="Service professional using Workzy"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-linear-to-t from-section-dark to-transparent opacity-20"></div>
              </div>
              <div className="absolute -bottom-8 -right-8">
                <MetricCard value="+65%" label="Average Revenue Growth" />
              </div>
              <div className="absolute -top-7.5 right-7.5">
                <MetricCard value="2.3x" label="Client Base Expansion" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-card border-y border-border overflow-hidden">
        <div className="section-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-4 text-center">
            {STATS_CARDS.map((stat, i) => (
              <div key={i} className="flex flex-col items-center p-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                <p className="mt-2 text-base sm:text-lg font-medium text-muted-foreground">
                  {stat.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {formOpen && (
        <section id="apply-now" ref={applyNowRef} className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            {!user?.phone ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-2xl p-8 shadow-sm bg-amber-500/15 "
              >
                <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full  blur-3xl" />

                <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-500/20 "
                  >
                    <Phone className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </motion.div>

                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-secondary-foreground">
                      Add Your Phone Number
                    </h4>
                    <p className="mt-1 text-sm text-accent-foreground ">
                      We need a phone number on file before you can apply as a service provider. It
                      only takes a moment.
                    </p>
                    <Link to="/profile">
                      <motion.span
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.97 }}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
                      >
                        Go to Profile Settings
                        <ArrowRight className="h-4 w-4" />
                      </motion.span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <BecomeWorkerForm
                  worker={data}
                  isLoading={isLoading || isPending}
                  onSubmit={onSubmit}
                  userPhone={user?.phone}
                />
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Why Join Us Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-golden/10 text-(--golden-dark) rounded-full text-sm font-medium mb-4">
              WHY CHOOSE US
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Service Professionals Choose Workzy
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Partner with Workzy and transform how you manage your service business with our
              comprehensive platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURE_CARDS &&
              FEATURE_CARDS.map((val, i) => (
                <FeatureCard
                  key={i}
                  icon={val.icon}
                  title={val.title}
                  description={val.description}
                />
              ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-golden/10 text-(--golden-dark) rounded-full text-sm font-medium mb-4">
                HOW IT WORKS
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Simple Process to Start Growing Your Business
              </h2>
              <p className="text-muted-foreground mb-10">
                Getting started with Workzy is easy. Follow these simple steps to begin expanding
                your service business today.
              </p>

              <div className="space-y-2">
                {PROCESS_STEPS &&
                  PROCESS_STEPS.map((val, i) => (
                    <ProcessStep
                      key={i}
                      title={val.title}
                      description={val.description}
                      number={i + 1}
                      isLast={i === PROCESS_STEPS.length - 1}
                    />
                  ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative flex items-center justify-center">
                <img
                  src={become_wokrer_img}
                  alt="Workzy app demonstration"
                  className="w-full max-w-155 object-contain"
                />
              </div>
              <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-golden rounded-full p-6 shadow-xl">
                <Smartphone className="h-8 w-8 text-(--golden-dark)" />
              </div>
              <div className="absolute bottom-1/4 right-0 transform translate-x-1/3 bg-card rounded-full p-5 shadow-xl border">
                <Settings className="h-7 w-7 text-golden" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-golden/10 text-(--golden-dark) rounded-full text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about becoming a Workzy service provider
            </p>
          </div>

          <div className="space-y-1">
            {FAQ_ITEMS?.length > 0 &&
              FAQ_ITEMS.map((val, i) => (
                <FAQItem key={i} question={val.question} answer={val.answer} />
              ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <CTASection isVerified={isVerified} onBecomeProvider={openFormAndScroll} />
    </main>
  );
}
