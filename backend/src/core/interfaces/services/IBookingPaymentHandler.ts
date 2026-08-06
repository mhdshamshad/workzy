export interface IBookingPaymentHandler {
  confirmBookingAfterPayment(
    bookingId: string,
    slotId: string,
    workerId: string,
    paymentIntentId: string
  ): Promise<void>;
  handleExtraChargeAfterPayment(bookingId: string): Promise<void>;
}
