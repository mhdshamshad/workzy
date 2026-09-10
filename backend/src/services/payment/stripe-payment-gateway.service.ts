import { injectable } from "inversify";
import Stripe from "stripe";

import logger from "@/config/logger";
import { stripe } from "@/config/stripe";
import {
  CLIENT_URL,
  HTTPSTATUS,
  PAYMENT,
  STRIPE_CONNECT_WEBHOOK_SECRET,
  STRIPE_WEBHOOK_SECRET,
} from "@/constants";
import {
  BookingCheckoutSessionParams,
  ExtraChargeCheckoutSessionParams,
  IPaymentGateway,
  RefundParams,
  TransferParams,
  VerifiedSessionResult,
  WebhookDomainEvent,
} from "@/core/interfaces/services/IPaymentGateway";
import CustomError from "@/utils/customError";

@injectable()
export class StripePaymentGateway implements IPaymentGateway {
  async createBookingCheckoutSession(
    params: BookingCheckoutSessionParams
  ): Promise<{ id: string; url: string }> {
    const { userId, bookingId, serviceName, amount, slotId, workerId } = params;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: serviceName },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        transfer_group: bookingId,
        metadata: {
          type: "BOOKING",
          bookingId,
          slotId,
          workerId,
          userId,
        },
      },
      success_url: `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/payment/cancelled`,
      metadata: {
        type: "BOOKING",
        bookingId,
        workerId,
        slotId,
        userId,
      },
    });

    return { id: session.id, url: session.url! };
  }

  async createExtraChargeCheckoutSession(
    params: ExtraChargeCheckoutSessionParams
  ): Promise<{ id: string; url: string }> {
    const { userId, bookingId, workerStripeAccountId, amount } = params;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Additional Service Charge" },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        transfer_data: {
          destination: workerStripeAccountId,
        },
        metadata: {
          type: "EXTRA_CHARGE",
          bookingId,
          userId,
        },
      },
      success_url: `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/payment/cancelled`,
      metadata: {
        type: "EXTRA_CHARGE",
        bookingId,
        userId,
      },
    });

    return { id: session.id, url: session.url! };
  }

  async retrieveSession(sessionId: string): Promise<VerifiedSessionResult> {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent.latest_charge", "line_items"],
    });
    const type = session.metadata?.type;
    const success =
      type === "BOOKING"
        ? session.status === "complete"
        : session.payment_status === "paid" && session.status === "complete";

    if (!success) return { success: false };

    const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
    const charge = paymentIntent?.latest_charge as Stripe.Charge;
    const lineItem = session.line_items?.data?.[0];

    return {
      success,
      type,
      transactionId: paymentIntent?.id ?? session.id,
      productName: lineItem?.description ?? "Payment",
      amountPaid: (session.amount_total ?? 0) / 100,
      paymentMethod:
        session.payment_method_types?.[0] === "card"
          ? "Credit / Debit Card"
          : (session.payment_method_types?.[0] ?? "Card"),
      date: new Date(session.created * 1000).toISOString(),
      receiptUrl: charge?.receipt_url ?? undefined,
    };
  }

  async getAccountDefaultCurrency(stripeAccountId: string): Promise<string> {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return account.default_currency || "inr";
  }

  async createTransfer(params: TransferParams): Promise<void> {
    const { bookingId, workerStripeAccountId, amount, currency } = params;

    await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency,
      destination: workerStripeAccountId,
      transfer_group: bookingId,
    });
  }

  async createRefund(params: RefundParams): Promise<void> {
    const { paymentIntentId, amount } = params;
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };
    if (amount !== undefined) {
      refundParams.amount = Math.round(amount * 100);
    }
    await stripe.refunds.create(refundParams);
  }

  async createExpressAccount(): Promise<{ accountId: string }> {
    const account = await stripe.accounts.create({
      type: "express",
      country: "AE",
      capabilities: {
        transfers: { requested: true },
      },
    });
    return { accountId: account.id };
  }

  async createAccountOnboardingLink(stripeAccountId: string): Promise<string> {
    const link = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${CLIENT_URL}/worker/profile/account?stripe=refresh`,
      return_url: `${CLIENT_URL}/worker/profile/account?stripe=success`,
      type: "account_onboarding",
    });
    return link.url;
  }

  constructAndVerifyWebhookEvent(rawBody: Buffer, signature: string): WebhookDomainEvent {
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
    } catch {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_CONNECT_WEBHOOK_SECRET);
      } catch (err: unknown) {
        if (err instanceof Error) {
          logger.error(`${PAYMENT.WEBHOOK_SIGNATURE_INVALID}:${err.message}`);
        }
        throw new CustomError(PAYMENT.WEBHOOK_SIGNATURE_INVALID, HTTPSTATUS.BAD_REQUEST);
      }
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const type = session.metadata?.type;
        if (type === "BOOKING") {
          return {
            type: "booking.paid",
            bookingId: session.metadata?.bookingId || "",
            slotId: session.metadata?.slotId || "",
            workerId: session.metadata?.workerId || "",
            paymentIntentId: session.payment_intent as string,
          };
        } else if (type === "EXTRA_CHARGE") {
          return {
            type: "extra_charge.paid",
            bookingId: session.metadata?.bookingId || "",
            paymentIntentId: session.payment_intent as string,
            sessionId: session.id,
          };
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        return {
          type: "payment.failed",
          bookingId: pi.metadata?.bookingId || "",
          userId: pi.metadata?.userId || "",
          slotId: pi.metadata?.slotId,
          paymentIntentId: pi.id,
          reason: pi.last_payment_error?.message,
        };
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.type === "BOOKING") {
          return {
            type: "checkout.expired",
            bookingId: session.metadata?.bookingId || "",
            slotId: session.metadata?.slotId || "",
            userId: session.metadata?.userId || "",
            sessionId: session.id,
          };
        }
        break;
      }
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        if (account.payouts_enabled) {
          return {
            type: "account.payouts_enabled",
            stripeAccountId: account.id,
          };
        }
        break;
      }
    }
    return { type: "unhandled" };
  }
}
