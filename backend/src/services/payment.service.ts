import { inject, injectable } from "inversify";
import { Types } from "mongoose";
import Stripe from "stripe";

import { stripe } from "@/config/stripe";
import {
  BILL_TYPE,
  BOOKING_PAYMENT_STATUS,
  BOOKING_STATUS,
  CLIENT_URL,
  HTTPSTATUS,
  NOTIFICATION_TEMPLATES,
  PAYMENT,
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
  STRIPE_ACCOUNT_STATUS,
  WORKER,
} from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { IPaymentRepository } from "@/core/interfaces/repositories/IPaymentRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { IBookingPaymentHandler } from "@/core/interfaces/services/IBookingPaymentHandler";
import { INotificationService } from "@/core/interfaces/services/INotificationService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { ISlotService } from "@/core/interfaces/services/ISlotService";
import { TYPES } from "@/di/types";
import { PaymentAdminDto, PaymentUserDto, PaymentWorkerDto } from "@/dtos/responses/payment.dto";
import { IBooking } from "@/types/booking/booking.entity";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { BookingCheckoutParams, VerifySessionType } from "@/types/payment/payment.entity";
import { PaymentListQuery } from "@/types/payment/payment.query";
import { IWorker } from "@/types/worker/worker.entity";
import CustomError from "@/utils/customError";
import { generateTxnCode } from "@/utils/generateTxnCode";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";

@injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @inject(TYPES.PaymentRepository) private _paymentRepo: IPaymentRepository,
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository,
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.NotificationService) private _notificationService: INotificationService,
    @inject(TYPES.BookingPaymentHandler) private _bookingPaymentHandler: IBookingPaymentHandler,
    @inject(TYPES.SlotService) private _slotService: ISlotService
  ) {}

  async createBookingPaymentCheckout(data: BookingCheckoutParams): Promise<string> {
    const {
      userId,
      bookingId,
      userName,
      workerName,
      amount,
      slotId,
      serviceName,
      platformFee,
      workerId,
      workerAmount,
    } = data;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: serviceName },
            unit_amount: amount * 100,
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

    await this._paymentRepo.create({
      transactionId: generateTxnCode("TXN"),
      title: serviceName,
      userId: new Types.ObjectId(userId),
      workerId: new Types.ObjectId(workerId),
      workerAmount,
      platformFee,
      billType: BILL_TYPE.BOOKING,
      bookingId: new Types.ObjectId(bookingId),
      status: PAYMENT_STATUS.PENDING,
      amount,
      currency: "inr",
      provider: PAYMENT_PROVIDER.STRIPE,
      sessionId: session.id,
      workerName,
      userName,
    });
    return session.url!;
  }

  async createExtraChargeCheckout(data: {
    userId: string;
    booking: IBooking;
    amount: number;
  }): Promise<string> {
    const { userId, booking, amount } = data;

    const worker = await getEntityOrThrow(
      this._workerRepository,
      booking.workerId.toString(),
      WORKER.NOT_FOUND
    );
    const workerStripeId = worker?.stripeAccountId;
    if (!workerStripeId || worker.stripeAccountStatus !== STRIPE_ACCOUNT_STATUS.ACTIVE) {
      throw new CustomError(WORKER.STRIPE_NOT_ACTIVE, HTTPSTATUS.BAD_REQUEST);
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Additional Service Charge" },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        transfer_data: {
          destination: workerStripeId,
        },
        metadata: {
          type: "EXTRA_CHARGE",
          bookingId: booking._id.toString(),
          userId,
        },
      },
      success_url: `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/payment/cancelled`,
      metadata: {
        type: "EXTRA_CHARGE",
        bookingId: booking._id.toString(),
        userId,
      },
    });
    await this._paymentRepo.create({
      transactionId: generateTxnCode("TXN"),
      title: booking.snapshot.category.name + " - Extra Charge",
      userId: new Types.ObjectId(userId),
      workerId: new Types.ObjectId(booking.workerId),
      billType: BILL_TYPE.EXTRA_CHARGE,
      bookingId: new Types.ObjectId(booking._id.toString()),
      amount,
      currency: "inr",
      provider: PAYMENT_PROVIDER.STRIPE,
      status: PAYMENT_STATUS.PENDING,
      sessionId: session.id,
      userName: booking.snapshot.user.name,
      workerName: booking.snapshot.worker.name,
    });
    return session.url!;
  }

  async releaseBookingPayment(booking: IBooking, customAmount?: number): Promise<void> {
    const payment = await this._paymentRepo.findOne({
      bookingId: new Types.ObjectId(booking._id.toString()),
      billType: BILL_TYPE.BOOKING,
      status: { $in: [PAYMENT_STATUS.SUCCEEDED, PAYMENT_STATUS.REFUNDED] },
    });
    if (!payment) {
      throw new CustomError(PAYMENT.PAYMENT_NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    if (!payment.paymentIntentId) {
      throw new CustomError(PAYMENT.PAYMENT_INTENT_MISSING, HTTPSTATUS.BAD_REQUEST);
    }
    const worker = await getEntityOrThrow(
      this._workerRepository,
      booking.workerId.toString(),
      WORKER.NOT_FOUND
    );
    const workerStripeId = worker.stripeAccountId;
    if (!workerStripeId || worker.stripeAccountStatus !== STRIPE_ACCOUNT_STATUS.ACTIVE) {
      throw new CustomError(WORKER.STRIPE_NOT_ACTIVE, HTTPSTATUS.BAD_REQUEST);
    }
    if (payment.workerAmount === undefined || payment?.workerAmount === null) {
      throw new CustomError(PAYMENT.WORKER_AMOUNT_MISSING, HTTPSTATUS.BAD_REQUEST);
    }
    const destinationAccount = await stripe.accounts.retrieve(workerStripeId);
    const transferCurrency = destinationAccount.default_currency || "inr";
    let transferAmount = customAmount !== undefined ? customAmount : payment.workerAmount;
    if (payment.currency === "inr" && transferCurrency === "aed") {
      transferAmount = transferAmount * 0.044;
    }

    try {
      await stripe.transfers.create({
        amount: Math.round(transferAmount * 100),
        currency: transferCurrency,
        destination: workerStripeId,
        transfer_group: booking._id.toString(),
      });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: unknown }).code === "balance_insufficient"
      ) {
        console.warn("Stripe insufficient balance — bypassing in test mode.");
      } else {
        throw err;
      }
    }

    await this._paymentRepo.findOneAndUpdate(
      { _id: payment._id },
      {
        status: PAYMENT_STATUS.RELEASED,
        workerAmount: transferAmount,
      }
    );
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const type = session.metadata?.type;
        if (type === "BOOKING") {
          await this.handleBookingPaid(session);
        } else if (type === "EXTRA_CHARGE") {
          await this.handleExtraChargePaid(session);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.type === "BOOKING") {
          await this.handleBookingCheckoutExpired(session);
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        if (account.payouts_enabled) {
          await this._workerRepository.findOneAndUpdate(
            { stripeAccountId: account.id },
            { stripeAccountStatus: "active" }
          );
        }
        break;
      }
    }
  }

  async createStripeConnectLink(worker: IWorker): Promise<string> {
    let accountId = worker?.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "AE",
        capabilities: {
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      await this._workerRepository.update(worker._id, {
        stripeAccountId: accountId,
        stripeAccountStatus: STRIPE_ACCOUNT_STATUS.PENDING,
      });
    }
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${CLIENT_URL}/worker/profile/account?stripe=refresh`,
      return_url: `${CLIENT_URL}/worker/profile/account?stripe=success`,
      type: "account_onboarding",
    });
    return link.url;
  }

  async refundBookingPayment(bookingId: string, amount?: number): Promise<void> {
    const payment = await this._paymentRepo.findOne({
      bookingId: new Types.ObjectId(bookingId),
      billType: BILL_TYPE.BOOKING,
      status: PAYMENT_STATUS.SUCCEEDED,
    });
    if (!payment) {
      throw new CustomError(PAYMENT.PAYMENT_NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    if (!payment?.paymentIntentId) {
      throw new CustomError(PAYMENT.PAYMENT_INTENT_MISSING, HTTPSTATUS.BAD_REQUEST);
    }

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: payment.paymentIntentId,
    };
    if (amount !== undefined) {
      refundParams.amount = Math.round(amount * 100);
    }

    await stripe.refunds.create(refundParams);
    await this._paymentRepo.findOneAndUpdate(
      { _id: new Types.ObjectId(payment._id) },
      {
        status: PAYMENT_STATUS.REFUNDED,
        refundedAmount: amount !== undefined ? amount : payment.amount,
      }
    );
  }

  private async handleExtraChargePaid(session: Stripe.Checkout.Session): Promise<void> {
    const { bookingId } = session.metadata as { bookingId: string };
    await Promise.all([
      this._bookingPaymentHandler.handleExtraChargeAfterPayment(bookingId),
      this._paymentRepo.findOneAndUpdate(
        { sessionId: session.id },
        {
          status: PAYMENT_STATUS.SUCCEEDED,
          paymentIntentId: session.payment_intent as string,
        }
      ),
    ]);
  }

  private async handleBookingPaid(session: Stripe.Checkout.Session) {
    const { bookingId, slotId, workerId } = session.metadata as {
      bookingId: string;
      slotId: string;
      workerId: string;
    };
    await this._bookingPaymentHandler.confirmBookingAfterPayment(
      bookingId,
      slotId,
      workerId,
      session.payment_intent as string
    );
  }

  async verifySession(sessionId: string): Promise<VerifySessionType> {
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

  private async handlePaymentFailed(pi: Stripe.PaymentIntent) {
    const { type, bookingId, userId, slotId } = pi.metadata;
    if (type !== "BOOKING" || !bookingId) return;
    await Promise.all([
      this._bookingRepository.findByIdAndUpdate(bookingId, {
        paymentStatus: BOOKING_PAYMENT_STATUS.FAILED,
        status: BOOKING_STATUS.CANCELLED,
      }),
      this._paymentRepo.findOneAndUpdate(
        { bookingId: new Types.ObjectId(bookingId), billType: BILL_TYPE.BOOKING },
        {
          status: PAYMENT_STATUS.FAILED,
          paymentIntentId: pi.id,
          failureReason: pi.last_payment_error?.message,
        }
      ),
      ...(slotId && userId ? [this._slotService.releaseSlot(slotId, userId)] : []),
    ]);
    void this._notificationService.createNotification(
      userId,
      NOTIFICATION_TEMPLATES.PAYMENT_FAILED(bookingId)
    );
  }

  private async handleBookingCheckoutExpired(session: Stripe.Checkout.Session) {
    const { bookingId, slotId, userId } = session.metadata as {
      bookingId: string;
      slotId: string;
      userId: string;
    };

    await Promise.all([
      this._bookingRepository.findByIdAndUpdate(bookingId, {
        paymentStatus: BOOKING_PAYMENT_STATUS.CANCELLED,
        status: BOOKING_STATUS.CANCELLED,
      }),
      this._paymentRepo.findOneAndUpdate(
        { sessionId: session.id },
        { status: PAYMENT_STATUS.CANCELLED }
      ),
      ...(slotId && userId ? [this._slotService.releaseSlot(slotId, userId)] : []),
    ]);
  }

  async getPayments(input: PaymentListQuery): Promise<CursorPaginatedResult<PaymentAdminDto>> {
    const { data, nextCursor } = await this._paymentRepo.getPayments(input);
    return {
      data: PaymentAdminDto.fromEntities(data),
      nextCursor,
    };
  }

  async getUserPayments(
    userId: string,
    input: PaymentListQuery
  ): Promise<CursorPaginatedResult<PaymentUserDto>> {
    const { data, nextCursor } = await this._paymentRepo.getPayments({ userId, ...input });
    return { data: PaymentUserDto.fromEntities(data), nextCursor };
  }

  async getWorkerPayments(
    workerId: string,
    input: PaymentListQuery
  ): Promise<CursorPaginatedResult<PaymentWorkerDto>> {
    const { data, nextCursor } = await this._paymentRepo.getPayments({ workerId, ...input });
    return { data: PaymentWorkerDto.fromEntities(data), nextCursor };
  }
}
