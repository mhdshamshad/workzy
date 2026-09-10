import logger from "@/config/logger";
import { AUTH, BOOKING, BookingStatus, HTTPSTATUS, Role } from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { IMessageService } from "@/core/interfaces/services/IMessageService";
import { IBooking } from "@/types/booking/booking.entity";
import CustomError from "@/utils/customError";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";

export function createStatusHistoryEntry(status: BookingStatus, changedBy: Role, reason?: string) {
  return {
    status,
    changedBy,
    reason,
    changedAt: new Date(),
  };
}

export function assertWorkerOwnership(booking: IBooking, workerId: string): void {
  if (booking.workerId.toString() !== workerId) {
    throw new CustomError(AUTH.ACCESS_DENIED, HTTPSTATUS.FORBIDDEN);
  }
}

export async function getBookingOrThrow(
  bookingRepository: IBookingRepository,
  bookingId: string
): Promise<IBooking> {
  return await getEntityOrThrow(bookingRepository, bookingId, BOOKING.NOT_FOUND);
}

export async function sendBookingEvent(
  messageService: IMessageService,
  booking: IBooking,
  content: string
): Promise<void> {
  try {
    await messageService.saveBookingEvent({
      userId: booking.userId.toString(),
      workerId: booking.workerId.toString(),
      bookingId: booking._id.toString(),
      content,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to send BookingEvent";
    logger.error(`Failed to save booking event message - ${booking.bookingId} - ${msg}`);
  }
}
