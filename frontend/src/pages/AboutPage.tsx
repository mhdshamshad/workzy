import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Headset,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Button from '@/components/atoms/Button';
import { useAppSelector } from '@/store/hooks';

const CONTACT = {
  email: 'workzyservice@gmail.com',
  phone: '7558098336',
  address: 'Kochi, Kerala, India',
  hours: 'Monday – Saturday: 9:00 AM – 7:00 PM IST',
};

const VALUES = [
  {
    icon: ShieldCheck,
    tag: 'Safety & Trust',
    title: 'Vetted & Verified Pros',
    text: 'Every professional undergoes identity verification, skill screening, and background checks before taking jobs on Workzy.',
  },
  {
    icon: Sparkles,
    tag: 'Quality Standard',
    title: '10-Day Rework Guarantee',
    text: 'Payments remain safely in escrow until the job is completed to your satisfaction. Free rework provided if issues arise within 10 days.',
  },
  {
    icon: Users,
    tag: 'Transparent & Fair',
    title: 'Zero Hidden Fees',
    text: 'Upfront quotes, secure Razorpay checkout, and fair marketplace commission. Free to join for certified service professionals.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Search & Choose',
    desc: 'Browse certified electricians, cleaners, plumbers, and technicians near your pincode with genuine ratings.',
    badge: 'Near You',
  },
  {
    step: '02',
    title: 'Upfront Quote & Chat',
    desc: 'Schedule a convenient slot, chat directly with the pro, and agree on work requirements with clear pricing.',
    badge: 'Live Chat',
  },
  {
    step: '03',
    title: 'Escrow Pay & Relax',
    desc: 'Funds are securely held and released only when work is done. Protected by our 10-day satisfaction rework warranty.',
    badge: 'Escrow Protected',
  },
];

const FAQS = [
  {
    q: 'How does payment protection work on Workzy?',
    a: 'When you book a service, your payment is processed via Razorpay and held in escrow. It is only released to the service provider after you confirm the job is finished satisfactorily.',
  },
  {
    q: 'What is the 10-Day Rework Guarantee?',
    a: 'If any service performed does not hold up or has flaws within 10 days of completion, the professional will return and fix the issue at zero extra labor cost.',
  },
  {
    q: 'How are professionals verified?',
    a: 'We review government IDs, trade certifications, previous work samples, and conduct address verification before approving any professional on the platform.',
  },
  {
    q: 'Can I cancel my booking for a full refund?',
    a: 'Yes. You can cancel free of charge any time before the professional begins travel or arrives at your location for a 100% immediate refund.',
  },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const contactRef = useRef<HTMLElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isAuthenticated } = useAppSelector(s => s.auth);

  useEffect(() => {
    if (pathname === '/contact') {
      contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, left: 0 });
    }
  }, [pathname]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden bg-[oklch(21.48%_0.03444_254.607)] py-24 text-white lg:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[40px_40px]" />
        <div className="pointer-events-none absolute -top-40 -left-20 h-96 w-96 rounded-full bg-indigo-500/25 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-amber-500/20 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-golden" />
            <span className="text-slate-200">The Modern Marketplace for Home & Local Services</span>
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl lg:leading-[1.15]">
            Trusted local services,{' '}
            <span className="bg-linear-to-r from-golden via-amber-200 to-amber-400 bg-clip-text text-transparent">
              booked in minutes
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg sm:leading-relaxed">
            Workzy replaces uncertain classifieds with verified pros, upfront pricing, live chat,
            and escrow payment protection. Get your job done right the first time.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => navigate('/services')}
              iconRight={<ArrowRight className="h-4 w-4" />}
              className="rounded-full bg-white px-8 py-6 text-sm font-bold text-slate-950 shadow-xl transition-all hover:scale-105 hover:bg-slate-100"
            >
              Find a Professional
            </Button>
            <Button
              onClick={() => contactRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full border border-white/20 bg-white/10 px-8 py-6 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-golden/10 px-3.5 py-1 text-xs font-bold tracking-wider text-golden uppercase">
              Why Workzy
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Engineered for trust from the ground up
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Finding a tradesperson shouldn't be a gamble. We designed a safety net for both
              customers and certified pros.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map(({ icon: Icon, tag, title, text }) => (
              <div
                key={title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs hover:shadow-xl p-8 transition-all hover:-translate-y-1 hover:border-golden/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-golden/15 text-golden transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {tag}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground">{title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold tracking-wider text-primary uppercase">
              How It Works
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              From inquiry to job done in 3 steps
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              No endless phone tags or surprises. Everything happens right on the platform.
            </p>
          </div>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            {STEPS.map(step => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-border bg-card shadow-xs hover:shadow-md p-8 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-extrabold text-golden/60">
                    {step.step}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {step.badge}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="contact" ref={contactRef} className="scroll-mt-16 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Support Team Online • Avg response under 15 mins
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              We're here whenever you need us
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Got a question before booking, or need support with an ongoing task? Reach out via our
              direct channels.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-12">
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              <a
                href={`mailto:${CONTACT.email}`}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:border-golden/40 hover:shadow-md"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-golden/15 text-golden">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 font-bold text-foreground">Email Support</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    For general inquiries and billing
                  </p>
                  <p className="mt-3 font-mono text-sm font-semibold text-foreground group-hover:text-golden">
                    {CONTACT.email}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-golden">
                  Send email <ArrowRight className="ml-1 h-3 w-3" />
                </span>
              </a>

              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:border-golden/40 hover:shadow-md"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-golden/15 text-golden">
                    <Phone className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 font-bold text-foreground">Phone Helpline</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Available Mon–Sat, 9AM to 7PM IST
                  </p>
                  <p className="mt-3 font-mono text-sm font-semibold text-foreground group-hover:text-golden">
                    {CONTACT.phone}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-golden">
                  Call helpline <ArrowRight className="ml-1 h-3 w-3" />
                </span>
              </a>

              <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-golden/15 text-golden">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 font-bold text-foreground">Headquarters</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Our registered engineering hub
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-foreground">{CONTACT.address}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-golden/15 text-golden">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 font-bold text-foreground">Operating Hours</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Customer care desk timing</p>
                  <p className="mt-3 text-sm font-medium text-foreground">{CONTACT.hours}</p>
                </div>
              </div>
            </div>

            {/* Support Escort Card */}
            <div className="flex flex-col justify-between rounded-3xl bg-linear-to-br from-[oklch(21.48%_0.03444_254.607)] to-slate-900 p-8 text-white shadow-2xl lg:col-span-5">
              <div>
                <div className="inline-flex rounded-2xl bg-white/10 p-3.5 backdrop-blur">
                  <Headset className="h-7 w-7 text-golden" />
                </div>
                <h3 className="mt-6 text-2xl font-bold tracking-tight">
                  Need help with an active booking?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  If an ongoing job requires intervention or dispute mediation, raise an express
                  ticket for priority handling within 30 minutes.
                </p>

                <div className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Dedicated Dispute Resolution Officers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Razorpay Escrow payment hold until settled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>10-Day Rework Inspection coverage</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  to={isAuthenticated ? '/disputes' : '/login'}
                  state={!isAuthenticated ? { from: '/disputes' } : undefined}
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-slate-100"
                >
                  Raise Support / Dispute Ticket <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/join-us"
                  className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/15"
                >
                  Join as a Service Professional
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Frequently Asked Questions Accordion */}
      <section className="border-t border-border bg-muted/20 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-golden/10 px-3.5 py-1 text-xs font-bold tracking-wider text-golden uppercase">
              FAQ
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Everything you need to know about safety, booking, and refunds.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-border bg-card transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-6 text-left font-semibold text-foreground transition-colors hover:text-golden"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-golden' : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
