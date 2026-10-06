import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import {
  BILL_TYPE,
  BOOKING_PAYMENT_STATUS,
  BOOKING_STATUS,
  HTTPSTATUS,
  NOTIFICATION_TEMPLATES,
  PAYMENT,
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
  STRIPE_ACCOUNT_STATUS,
} from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { IPaymentRepository } from "@/core/interfaces/repositories/IPaymentRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { IBookingPaymentHandler } from "@/core/interfaces/services/IBookingPaymentHandler";
import { INotificationService } from "@/core/interfaces/services/INotificationService";
import { IPaymentGateway } from "@/core/interfaces/services/IPaymentGateway";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { ISlotService } from "@/core/interfaces/services/ISlotService";
import { IUnitOfWork } from "@/core/interfaces/services/IUnitOfWork";
import { IWalletService } from "@/core/interfaces/services/IWalletService";
import { TYPES } from "@/di/types";
import { PaymentAdminDto, PaymentUserDto, PaymentWorkerDto } from "@/dtos/responses/payment.dto";
import { IBooking } from "@/types/booking/booking.entity";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { BookingCheckoutParams, VerifySessionType } from "@/types/payment/payment.entity";
import { PaymentListQuery } from "@/types/payment/payment.query";
import { IWorker } from "@/types/worker/worker.entity";
import CustomError from "@/utils/customError";
import { generateTxnCode } from "@/utils/generateTxnCode";

@injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @inject(TYPES.PaymentRepository) private _paymentRepo: IPaymentRepository,
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository,
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.NotificationService) private _notificationService: INotificationService,
    @inject(TYPES.BookingPaymentHandler) private _bookingPaymentHandler: IBookingPaymentHandler,
    @inject(TYPES.SlotService) private _slotService: ISlotService,
    @inject(TYPES.PaymentGateway) private _gateway: IPaymentGateway,
    @inject(TYPES.UnitOfWork) private _unitOfWork: IUnitOfWork,
    @inject(TYPES.WalletService) private _walletService: IWalletService
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

    const session = await this._gateway.createBookingCheckoutSession({
      userId,
      bookingId,
      amount,
      slotId,
      serviceName,
      workerId,
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

    return session.url;
  }

  async createExtraChargeCheckout(data: {
    userId: string;
    booking: IBooking;
    amount: number;
  }): Promise<string> {
    const { userId, booking, amount } = data;

    const session = await this._gateway.createExtraChargeCheckoutSession({
      userId,
      bookingId: booking._id.toString(),
      amount,
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

    return session.url;
  }

  async releaseBookingPayment(booking: IBooking, customAmount?: number): Promise<void> {
    const payments = await this._paymentRepo.find({
      bookingId: new Types.ObjectId(booking._id.toString()),
      billType: { $in: [BILL_TYPE.BOOKING, BILL_TYPE.EXTRA_CHARGE] },
      status: PAYMENT_STATUS.SUCCEEDED,
    });

    await this._unitOfWork.execute(async (options) => {
      for (const payment of payments) {
        const baseWorkerAmount = payment.workerAmount ?? payment.amount;
        let amountToRelease = baseWorkerAmount;
        if (payment.billType === BILL_TYPE.BOOKING && customAmount !== undefined) {
          amountToRelease = customAmount;
        }

        if (amountToRelease > 0) {
          await this._walletService.creditBookingEarnings(
            {
              workerId: booking.workerId.toString(),
              bookingId: booking._id.toString(),
              amount: amountToRelease,
              description: `${payment.billType === BILL_TYPE.EXTRA_CHARGE ? "Extra Charge" : "Booking"} payment - ${booking.bookingId}`,
            },
            options
          );
        }

        await this._paymentRepo.findOneAndUpdate(
          { _id: payment._id },
          {
            status: PAYMENT_STATUS.RELEASED,
            workerAmount: amountToRelease,
          },
          options
        );
      }
    });
  }

  async handleWebhookEvent(rawBody: Buffer, signature: string): Promise<void> {
    const event = this._gateway.constructAndVerifyWebhookEvent(rawBody, signature);

    switch (event.type) {
      case "booking.paid": {
        await this._bookingPaymentHandler.confirmBookingAfterPayment(
          event.bookingId,
          event.slotId,
          event.workerId,
          event.paymentIntentId
        );
        break;
      }
      case "extra_charge.paid": {
        await this._unitOfWork.execute(async (options) => {
          await this._bookingPaymentHandler.handleExtraChargeAfterPayment(event.bookingId);
          await this._paymentRepo.findOneAndUpdate(
            { sessionId: event.sessionId },
            {
              status: PAYMENT_STATUS.SUCCEEDED,
              paymentIntentId: event.paymentIntentId,
            },
            options
          );
        });
        break;
      }
      case "payment.failed": {
        const { bookingId, userId, slotId, paymentIntentId, reason } = event;
        if (!bookingId) break;
        await this._unitOfWork.execute(async (options) => {
          await this._bookingRepository.findByIdAndUpdate(
            bookingId,
            {
              paymentStatus: BOOKING_PAYMENT_STATUS.FAILED,
              status: BOOKING_STATUS.CANCELLED,
            },
            options
          );
          await this._paymentRepo.findOneAndUpdate(
            { bookingId: new Types.ObjectId(bookingId), billType: BILL_TYPE.BOOKING },
            {
              status: PAYMENT_STATUS.FAILED,
              paymentIntentId,
              failureReason: reason,
            },
            options
          );
          if (slotId && userId) {
            await this._slotService.releaseSlot(slotId, userId);
          }
        });
        void this._notificationService.createNotification(
          userId,
          NOTIFICATION_TEMPLATES.PAYMENT_FAILED(bookingId)
        );
        break;
      }
      case "checkout.expired": {
        const { bookingId, slotId, userId, sessionId } = event;
        await this._unitOfWork.execute(async (options) => {
          await this._bookingRepository.findByIdAndUpdate(
            bookingId,
            {
              paymentStatus: BOOKING_PAYMENT_STATUS.CANCELLED,
              status: BOOKING_STATUS.CANCELLED,
            },
            options
          );
          await this._paymentRepo.findOneAndUpdate(
            { sessionId },
            { status: PAYMENT_STATUS.CANCELLED },
            options
          );
          if (slotId && userId) {
            await this._slotService.releaseSlot(slotId, userId);
          }
        });
        break;
      }
      case "account.payouts_enabled": {
        await this._workerRepository.findOneAndUpdate(
          { stripeAccountId: event.stripeAccountId },
          { stripeAccountStatus: "active" }
        );
        break;
      }
      case "unhandled":
        break;
    }
  }

  async createStripeConnectLink(worker: IWorker): Promise<string> {
    let accountId = worker?.stripeAccountId;
    if (!accountId) {
      const { accountId: newAccountId } = await this._gateway.createExpressAccount();
      accountId = newAccountId;
      await this._workerRepository.update(worker._id, {
        stripeAccountId: accountId,
        stripeAccountStatus: STRIPE_ACCOUNT_STATUS.PENDING,
      });
    }
    return await this._gateway.createAccountOnboardingLink(accountId);
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

    await this._gateway.createRefund({
      paymentIntentId: payment.paymentIntentId,
      amount,
    });

    await this._paymentRepo.findOneAndUpdate(
      { _id: new Types.ObjectId(payment._id) },
      {
        status: PAYMENT_STATUS.REFUNDED,
        refundedAmount: amount !== undefined ? amount : payment.amount,
      }
    );
  }

  async verifySession(sessionId: string): Promise<VerifySessionType> {
    return this._gateway.retrieveSession(sessionId);
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
