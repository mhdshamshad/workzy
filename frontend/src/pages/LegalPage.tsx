import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileText,
  HelpCircle,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAppSelector } from '@/store/hooks';

interface LegalSection {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  highlight?: string;
}

interface LegalDoc {
  path: string;
  label: string;
  icon: typeof FileText;
  intro: string;
  tldr: string;
  sections: LegalSection[];
}

const UPDATED = 'October 2026';
const VERSION = 'v2.4';

const DOCS: LegalDoc[] = [
  {
    path: '/refund-policy',
    label: 'Refund & Cancellation',
    icon: RotateCcw,
    intro:
      'Transparent rules on when you can cancel, receive full refunds, or request complimentary rework.',
    tldr: 'Key points: 100% refund on cancellations before the pro begins the job. 10-day complimentary rework warranty. All refunds handled automatically via original payment method.',
    sections: [
      {
        id: 'cancellation-customer',
        title: 'Cancellation by Customer',
        highlight: 'Cancel any time before work begins for a 100% full refund.',
        items: [
          'Cancel before the professional starts the job: Instant 100% full refund with zero cancellation penalties.',
          'Cancellation after the pro has arrived or started the job: Eligible for a partial refund based on materials procured and completed work assessment.',
          'Rescheduling: You can reschedule free of charge up to 2 hours before the scheduled appointment slot.',
        ],
      },
      {
        id: 'cancellation-pro',
        title: 'Cancellation by Professional',
        highlight: 'Zero penalty on customer if a professional cancels.',
        paragraphs: [
          'If a professional cancels or fails to arrive within 45 minutes of the agreed schedule without notice, you will receive an immediate 100% refund, or the option to reassign a verified priority pro immediately at no extra charge.',
        ],
      },
      {
        id: 'rework-guarantee',
        title: '10-Day Workmanship Guarantee',
        highlight: 'Free rework within 10 days of job completion.',
        paragraphs: [
          'Every completed service is backed by our 10-Day Rework Warranty. If any issue, leak, faulty wiring, or incomplete cleaning emerges within 10 days, the assigned professional will fix the issue free of charge.',
        ],
      },
      {
        id: 'refund-timeline',
        title: 'Refund Processing & Timelines',
        items: [
          'Approved refunds are immediately processed to your original payment method (UPI, Card, Net Banking).',
          'UPI & NetBanking refunds typically reflect within 24 to 48 hours.',
          'Credit/Debit card refunds may take 5 to 7 business days depending on your issuing bank.',
          'In case of any delay, raise a ticket via the Workzy Support Desk.',
        ],
      },
    ],
  },
  {
    path: '/privacy',
    label: 'Privacy Policy',
    icon: ShieldCheck,
    intro: 'How Workzy collects, uses, encrypts, and protects your personal and location data.',
    tldr: 'Key points: We never sell your personal information. Payment details are handled by PCI-DSS compliant Razorpay. Location is only used to connect you with nearby verified pros.',
    sections: [
      {
        id: 'data-collected',
        title: 'Information We Collect',
        items: [
          'Account Profile: Full name, verified mobile number, email address, and optional avatar.',
          'Service & Address: Exact location coordinates, apartment address, schedule, and uploaded photos of the task.',
          'In-App Communication: Real-time chat messages and booking notes between you and the service provider.',
          'Payment Security: Processed directly via Razorpay. Workzy never stores raw card credentials, CVVs, or UPI PINs.',
        ],
      },
      {
        id: 'data-use',
        title: 'How We Use Your Information',
        paragraphs: [
          'We use your information exclusively to connect you with local professionals, facilitate live status updates, process transactions, prevent fraudulent bookings, and maintain platform security.',
        ],
      },
      {
        id: 'data-sharing',
        title: 'Data Sharing & Third Parties',
        paragraphs: [
          'Only the essential service details (your name, task address, and phone number) are shared with the confirmed professional for that booking. We do not sell or monetize personal customer data with third-party advertisers.',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies & Local Storage',
        paragraphs: [
          'We use secure browser cookies and local tokens to keep your session authenticated, remember your preferred city, and preserve dark/light theme preferences.',
        ],
      },
      {
        id: 'user-rights',
        title: 'Your Privacy Rights & Deletion',
        paragraphs: [
          'You may request a full export of your personal data or request permanent deletion of your account and service history at any time through our Support Desk or by emailing privacy@workzy.in.',
        ],
      },
    ],
  },
  {
    path: '/terms',
    label: 'Terms of Service',
    icon: FileText,
    intro:
      'The platform rules, responsibilities, and guidelines for customers and service professionals.',
    tldr: 'Key points: Workzy is a curated marketplace. Escrow protection applies only to bookings conducted through Workzy. Off-platform transactions void all warranties and insurance.',
    sections: [
      {
        id: 'marketplace-role',
        title: 'Our Role as a Marketplace',
        paragraphs: [
          'Workzy operates as a technology platform connecting independent, verified service professionals with customers. Professionals are independent contractors and are not direct employees of Workzy.',
        ],
      },
      {
        id: 'account-responsibility',
        title: 'Account Security & Eligibility',
        paragraphs: [
          'Users must be at least 18 years of age. You are responsible for maintaining the confidentiality of your OTP credentials and all activities occurring under your registered account.',
        ],
      },
      {
        id: 'booking-escrow',
        title: 'Bookings & Escrow Protection',
        highlight: 'Always transact inside Workzy to stay protected.',
        items: [
          'All payments must be completed online via the Workzy checkout powered by Razorpay.',
          'Never pay cash directly to avoid losing Workzy Escrow Protection and the 10-day Rework Guarantee.',
          'Quotes must be mutually agreed upon within the platform chat or quote approval form before execution.',
        ],
      },
      {
        id: 'code-of-conduct',
        title: 'Safety, Harassment & Prohibited Conduct',
        paragraphs: [
          'Harassment, offensive behavior, discrimination, fraudulent reviews, or circumventing platform payments results in immediate permanent bans from the Workzy network.',
        ],
      },
      {
        id: 'dispute-resolution',
        title: 'Dispute Mediation & Escalation',
        paragraphs: [
          'In case of disagreement regarding work quality or pricing, customers or professionals can initiate mediation via the Disputes page. Workzy reserves the right to review chat history, job photos, and receipts to issue final binding arbitration.',
        ],
      },
    ],
  },
];

export default function LegalPage() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAppSelector(s => s.auth);
  const doc = DOCS.find(d => d.path === pathname) ?? DOCS[0];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden bg-[oklch(21.48%_0.03444_254.607)] py-14 text-white lg:py-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[32px_32px]" />
        <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-golden uppercase">
                <FileCheck2 className="h-4 w-4" />
                Workzy Trust & Compliance Center
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
                {doc.label}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">{doc.intro}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur">
                {VERSION} • Updated {UPDATED}
              </span>
              <button
                onClick={handlePrint}
                className="hidden items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15 sm:inline-flex"
                title="Print or Save PDF"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div>
              <p className="px-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Legal Documents
              </p>
              <nav className="mt-3 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                {DOCS.map(({ path, label, icon: Icon }) => {
                  const isActive = path === doc.path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      className={`flex shrink-0 items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-golden/15 text-golden shadow-sm dark:bg-golden/20'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </div>
                      {isActive && <ArrowRight className="hidden h-3.5 w-3.5 lg:block" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="hidden rounded-2xl border border-border bg-card p-5 lg:block">
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                On This Page
              </p>
              <ul className="mt-3 space-y-2 text-xs">
                {doc.sections.map((s, idx) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="line-clamp-1 text-muted-foreground transition-colors hover:text-golden"
                    >
                      {idx + 1}. {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <HelpCircle className="h-4 w-4 text-golden" />
                <span>Questions?</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Need clarification on our terms or filing an appeal? Contact our compliance desk.
              </p>
              <Link
                to="/contact"
                className="mt-4 block rounded-lg bg-secondary py-2 text-center text-xs font-bold text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                Contact Legal Desk
              </Link>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-2xl border border-golden/30 bg-golden/5 p-6">
              <div className="flex items-center gap-2 font-bold text-golden">
                <Sparkles className="h-4 w-4" />
                <span>Executive Summary (TL;DR)</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{doc.tldr}</p>
            </div>

            {/* Clauses List */}
            <article className="space-y-6">
              {doc.sections.map((section, idx) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-border/80 sm:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-golden/15 text-xs font-mono font-bold text-golden">
                        {idx + 1}
                      </span>
                      <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  {section.highlight && (
                    <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{section.highlight}</span>
                    </div>
                  )}

                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {section.paragraphs?.map(p => (
                      <p key={p}>{p}</p>
                    ))}

                    {section.items && (
                      <ul className="mt-3 space-y-2.5">
                        {section.items.map(item => (
                          <li key={item} className="flex items-start gap-2.5">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-golden" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ))}
            </article>

            {/* Bottom Escalation Banner */}
            <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-6 sm:flex-row">
              <div>
                <h4 className="font-bold text-foreground">Need dispute arbitration?</h4>
                <p className="text-xs text-muted-foreground">
                  Our customer protection team reviews contested bookings within 24 hours.
                </p>
              </div>
              <Link
                to={isAuthenticated ? '/disputes' : '/login'}
                state={!isAuthenticated ? { from: '/disputes' } : undefined}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition-all hover:opacity-90"
              >
                Go to Dispute Portal <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
