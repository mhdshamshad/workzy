import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ArrowRight, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import PaymentService from '@/services/payment.service';

const TYPE_CONFIG = {
  SUBSCRIPTION: {
    title: 'Subscription Active!',
    description: 'Your plan is now active. Start accepting bookings!',
    buttonLabel: 'Go to Subscripion',
    buttonPath: '/worker/subscriptions',
  },
  BOOKING: {
    title: 'Booking Confirmed!',
    description: 'Booking Confirmed Successfully',
    buttonLabel: 'View Bookings',
    buttonPath: '/bookings',
  },
  EXTRA_CHARGE: {
    title: 'Extra Charge Request',
    description: 'Extra Charge Request',
    buttonLabel: 'View Extra Charge',
    buttonPath: '/bookings',
  },
} as const;

type PaymentType = keyof typeof TYPE_CONFIG;

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const {
    data: details,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['payment-details', sessionId],
    queryFn: () => PaymentService.verifyPayment(sessionId as string),
    enabled: !!sessionId,
    retry: false,
  });

  if (!sessionId || isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-4 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle size={36} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Payment Failed</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Something went wrong. Your card was not charged.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white
                      bg-violet-600 hover:bg-violet-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-violet-500" size={40} />
          <p className="text-sm text-muted-foreground">Verifying payment...</p>
        </div>
      </div>
    );
  }

  const config = TYPE_CONFIG[details?.type as PaymentType] ?? TYPE_CONFIG.SUBSCRIPTION;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="rounded-2xl border border-border bg-card w-full max-w-md overflow-hidden">
        <div className="h-0.75 w-full bg-linear-to-r from-violet-600 to-violet-400" />

        <div className="p-8 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{config.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
            </div>
          </div>

          <div className="w-full rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Receipt
              </p>
            </div>
            {[
              { label: 'Transaction ID', value: details?.transactionId },
              { label: 'Plan', value: details?.productName },
              { label: 'Amount Paid', value: `₹${details?.amountPaid?.toLocaleString()}` },
              { label: 'Payment Method', value: details?.paymentMethod },
              {
                label: 'Date',
                value: details?.date ? dayjs(details.date).format('DD MMM YYYY, h:mm a') : '_',
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
              >
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>

          <div className="w-full flex flex-col gap-2">
            <button
              onClick={() => navigate(config.buttonPath, { replace: true })}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white
                         bg-violet-600 hover:bg-violet-500 transition-colors
                         flex items-center justify-center gap-2"
            >
              {config.buttonLabel}
              <ArrowRight size={15} />
            </button>

            {/* {details?.receiptUrl && (
              <button
                onClick={() => window.open(details.receiptUrl, "_blank")}
                className="w-full py-2.5 rounded-xl text-sm font-semibold
                           border border-border text-muted-foreground
                           hover:text-foreground transition-colors
                           flex items-center justify-center gap-2"
              >
                <Download size={14} />
                Download Receipt
              </button>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
