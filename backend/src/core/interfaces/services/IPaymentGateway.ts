export interface BookingCheckoutSessionParams {
  bookingId: string;
  slotId: string;
  userId: string;
  workerId: string;
  serviceName: string;
  amount: number;
}

export interface ExtraChargeCheckoutSessionParams {
  bookingId: string;
  userId: string;
  amount: number;
}

export interface VerifiedSessionResult {
  success: boolean;
  type?: string;
  transactionId?: string;
  productName?: string;
  amountPaid?: number;
  paymentMethod?: string;
  date?: string;
  receiptUrl?: string;
}

export interface RefundParams {
  paymentIntentId: string;
  amount?: number; // in Rupees
}

export type WebhookDomainEvent =
  | {
      type: "booking.paid";
      bookingId: string;
      slotId: string;
      workerId: string;
      paymentIntentId: string;
    }
  | {
      type: "extra_charge.paid";
      bookingId: string;
      paymentIntentId: string;
      sessionId: string;
    }
  | {
      type: "payment.failed";
      bookingId: string;
      userId: string;
      slotId?: string;
      paymentIntentId: string;
      reason?: string;
    }
  | {
      type: "checkout.expired";
      bookingId: string;
      slotId: string;
      userId: string;
      sessionId: string;
    }
  | {
      type: "unhandled";
    };

export interface IPaymentGateway {
  createBookingCheckoutSession(
    params: BookingCheckoutSessionParams
  ): Promise<{ id: string; url: string }>;
  createExtraChargeCheckoutSession(
    params: ExtraChargeCheckoutSessionParams
  ): Promise<{ id: string; url: string }>;
  retrieveSession(sessionId: string): Promise<VerifiedSessionResult>;
  createRefund(params: RefundParams): Promise<void>;
  constructAndVerifyWebhookEvent(rawBody: Buffer, signature: string): WebhookDomainEvent;
}
