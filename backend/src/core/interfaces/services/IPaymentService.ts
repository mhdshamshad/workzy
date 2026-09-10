import { PaymentAdminDto, PaymentUserDto, PaymentWorkerDto } from "@/dtos/responses/payment.dto";
import { IBooking } from "@/types/booking/booking.entity";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { BookingCheckoutParams, VerifySessionType } from "@/types/payment/payment.entity";
import { PaymentListQuery } from "@/types/payment/payment.query";
import { IWorker } from "@/types/worker/worker.entity";

export interface IPaymentService {
  handleWebhookEvent(rawBody: Buffer, signature: string): Promise<void>;
  verifySession(sessionId: string): Promise<VerifySessionType>;
  createBookingPaymentCheckout(data: BookingCheckoutParams): Promise<string>;
  createStripeConnectLink(worker: IWorker): Promise<string>;
  refundBookingPayment(bookingId: string, amount?: number): Promise<void>;
  createExtraChargeCheckout(data: {
    userId: string;
    booking: IBooking;
    amount: number;
  }): Promise<string>;
  releaseBookingPayment(booking: IBooking, customAmount?: number): Promise<void>;
  getPayments(input: PaymentListQuery): Promise<CursorPaginatedResult<PaymentAdminDto>>;
  getUserPayments(
    userId: string,
    input: PaymentListQuery
  ): Promise<CursorPaginatedResult<PaymentUserDto>>;
  getWorkerPayments(
    workerId: string,
    input: PaymentListQuery
  ): Promise<CursorPaginatedResult<PaymentWorkerDto>>;
}
