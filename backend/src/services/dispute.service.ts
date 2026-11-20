import { inject, injectable } from "inversify";
import { Types, UpdateQuery } from "mongoose";

import {
  BILL_TYPE,
  BOOKING,
  BOOKING_PAYMENT_STATUS,
  BOOKING_STATUS,
  DISPUTE,
  DISPUTE_RESOLUTION,
  DISPUTE_STATUS,
  HTTPSTATUS,
  NOTIFICATION_TEMPLATES,
  PAYMENT_STATUS,
  Role,
  ROLE,
} from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { IDisputeRepository } from "@/core/interfaces/repositories/IDisputeRepository";
import { IPaymentRepository } from "@/core/interfaces/repositories/IPaymentRepository";
import { IUserRepository } from "@/core/interfaces/repositories/IUserRepository";
import { IDisputeService } from "@/core/interfaces/services/IDisputeService";
import { IMessageService } from "@/core/interfaces/services/IMessageService";
import { INotificationService } from "@/core/interfaces/services/INotificationService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { IStorageService } from "@/core/interfaces/services/IStorageService";
import { IUnitOfWork } from "@/core/interfaces/services/IUnitOfWork";
import { TYPES } from "@/di/types";
import { CreateDisputeDto, ResolveDisputeDto } from "@/dtos/requests/dispute.dto";
import {
  DisputeListItemDto,
  DisputeResponseDto,
  DisputeStatsResponse,
} from "@/dtos/responses/dispute.dto";
import { IBooking } from "@/types/booking/booking.entity";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { IDispute } from "@/types/dispute/dispute.entity";
import { DisputeListQuery, DisputeStatsQuery } from "@/types/dispute/dispute.query";
import CustomError from "@/utils/customError";
import { generateTxnCode } from "@/utils/generateTxnCode";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";

@injectable()
export class DisputeService implements IDisputeService {
  constructor(
    @inject(TYPES.DisputeRepository) private _disputeRepository: IDisputeRepository,
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.PaymentRepository) private _paymentRepository: IPaymentRepository,

    @inject(TYPES.PaymentService) private _paymentService: IPaymentService,
    @inject(TYPES.MessageService) private _messageService: IMessageService,
    @inject(TYPES.StorageService) private _storageService: IStorageService,
    @inject(TYPES.NotificationService) private _notificationService: INotificationService,
    @inject(TYPES.UnitOfWork) private _unitOfWork: IUnitOfWork
  ) {}

  private notify(...tasks: Promise<unknown>[]) {
    void Promise.allSettled(tasks).then((results) => {
      for (const result of results) {
        if (result.status === "rejected") {
          console.error(result.reason);
        }
      }
    });
  }

  async raiseDispute(
    bookingId: string,
    initiatorId: string,
    raisedBy: Role,
    data: CreateDisputeDto
  ): Promise<DisputeResponseDto> {
    const { reason, description, evidence } = data;
    const [booking, existingDispute, admin] = await Promise.all([
      getEntityOrThrow(this._bookingRepository, bookingId, BOOKING.NOT_FOUND),
      this._disputeRepository.findByBookingId(bookingId),
      this._userRepository.findByRole(ROLE.ADMIN),
    ]);

    const defendantId =
      initiatorId === booking.workerId.toString()
        ? booking.userId.toString()
        : booking.workerId.toString();

    if (existingDispute) {
      throw new CustomError(DISPUTE.ALREADY_EXISTS, HTTPSTATUS.BAD_REQUEST);
    }
    if (
      (raisedBy === ROLE.USER && initiatorId === booking.workerId.toString()) ||
      (raisedBy === ROLE.WORKER && initiatorId === booking.userId.toString())
    ) {
      throw new CustomError(DISPUTE.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }

    const dispute = await this._unitOfWork.execute(async (options) => {
      const created = await this._disputeRepository.create(
        {
          disputeId: generateTxnCode("DSP"),
          bookingId: new Types.ObjectId(bookingId),
          workerId: new Types.ObjectId(booking.workerId),
          userId: new Types.ObjectId(booking.userId),
          raisedBy,
          reason,
          status: DISPUTE_STATUS.PENDING,
          description,
          evidence,
          searchText: `${booking.bookingId} - ${booking.snapshot.category.name}`,
        },
        options
      );

      await this._bookingRepository.update(
        bookingId,
        {
          status: BOOKING_STATUS.DISPUTED,
          $push: {
            statusHistory: {
              status: BOOKING_STATUS.DISPUTED,
              changedBy: raisedBy,
              reason,
              changedAt: new Date(),
            },
          },
        },
        options
      );

      return created;
    });

    await this._messageService.saveBookingEvent({
      workerId: booking.workerId.toString(),
      userId: booking.userId.toString(),
      bookingId: bookingId,
      content: `A dispute has been raised for booking ${booking.bookingId}`,
    });

    const disputeResponse = await this.getDisputeByBookingId(bookingId);
    if (!disputeResponse || !dispute) {
      throw new CustomError(DISPUTE.FAILED, HTTPSTATUS.INTERNAL_SERVER_ERROR);
    }

    this.notify(
      this._notificationService.createNotification(
        defendantId.toString(),
        NOTIFICATION_TEMPLATES.BOOKING_DISPUTED(booking.bookingId)
      ),
      this._notificationService.createNotification(
        admin?.id.toString(),
        NOTIFICATION_TEMPLATES.BOOKING_DISPUTED(booking.bookingId)
      )
    );

    return disputeResponse;
  }

  async getDisputeByBookingId(bookingId: string): Promise<DisputeResponseDto | null> {
    const dispute = await this._disputeRepository.findByBookingId(bookingId);
    if (!dispute) {
      return null;
    }
    return await DisputeResponseDto.fromEntity(dispute, this._storageService);
  }

  async getAllDisputes(
    input: DisputeListQuery
  ): Promise<CursorPaginatedResult<DisputeListItemDto>> {
    const { data, nextCursor } = await this._disputeRepository.getAllDisputes(input);
    return {
      data: await DisputeListItemDto.fromEntities(data, this._storageService),
      nextCursor,
    };
  }

  async getDisputeStats(input?: DisputeStatsQuery): Promise<DisputeStatsResponse> {
    return await this._disputeRepository.getDisputeStats(input);
  }

  async updateDispute(
    disputeId: string,
    initiatorId: string,
    raisedBy: Role,
    data: CreateDisputeDto
  ): Promise<DisputeResponseDto> {
    const dispute = await this._disputeRepository.findById(disputeId);
    if (!dispute) {
      throw new CustomError(DISPUTE.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    if (
      dispute.raisedBy !== raisedBy ||
      (initiatorId !== dispute.workerId.toString() && initiatorId !== dispute.userId.toString())
    ) {
      throw new CustomError(DISPUTE.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    const oldUrls = dispute.evidence?.map((m) => m.url) ?? [];
    const newUrls = data.evidence?.map((m) => m.url) ?? [];

    const removedUrls = oldUrls.filter((url) => !newUrls.includes(url));
    const updated = await this._disputeRepository.update(disputeId, data);

    const disputeResponse = await this.getDisputeByBookingId(dispute.bookingId.toString());
    if (!updated || !disputeResponse) {
      throw new CustomError(DISPUTE.FAILED, HTTPSTATUS.INTERNAL_SERVER_ERROR);
    }

    if (removedUrls.length > 0) {
      void Promise.allSettled(removedUrls.map((url) => this._storageService.deleteFile(url)));
    }

    return disputeResponse;
  }

  async resolveDispute(disputeId: string, adminId: string, data: ResolveDisputeDto): Promise<void> {
    const { resolution, note, status, refundedAmount } = data;
    const dispute = await getEntityOrThrow(this._disputeRepository, disputeId, DISPUTE.NOT_FOUND);
    const booking = await getEntityOrThrow(
      this._bookingRepository,
      dispute.bookingId.toString(),
      BOOKING.NOT_FOUND
    );

    if (dispute.status === DISPUTE_STATUS.RESOLVED || dispute.status === DISPUTE_STATUS.DISMISSED) {
      throw new CustomError(DISPUTE.ALREADY_RESOLVED, HTTPSTATUS.BAD_REQUEST);
    }
    if (refundedAmount && refundedAmount > booking.total) {
      throw new CustomError(DISPUTE.REFUND_GREATER(booking.total), HTTPSTATUS.BAD_REQUEST);
    }

    const disputeUpdate: UpdateQuery<IDispute> = {
      status,
      adminNote: note,
    };
    const bookingUpdate: UpdateQuery<IBooking> = {
      adminNote: note,
    };

    if (status === DISPUTE_STATUS.UNDER_REVIEW) {
      await this._unitOfWork.execute(async (options) => {
        await this._disputeRepository.update(disputeId, disputeUpdate, options);
        await this._bookingRepository.update(
          booking._id.toString(),
          {
            adminNote: note,
            $push: {
              statusHistory: {
                status: booking.status,
                changedBy: ROLE.ADMIN,
                reason: "Dispute marked under review by admin.",
                changedAt: new Date(),
              },
            },
          },
          options
        );
      });

      this.notify(
        this._notificationService.createNotification(
          dispute.userId.toString(),
          NOTIFICATION_TEMPLATES.DISPUTE_UNDER_REVIEW_CUSTOMER(booking.bookingId)
        ),
        this._notificationService.createNotification(
          dispute.workerId.toString(),
          NOTIFICATION_TEMPLATES.DISPUTE_UNDER_REVIEW_WORKER(booking.bookingId)
        )
      );
      return;
    }

    disputeUpdate.resolvedAt = new Date();

    if (status === DISPUTE_STATUS.DISMISSED) {
      if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.HELD) {
        await this._paymentService.releaseBookingPayment(booking);
        bookingUpdate.paymentStatus = BOOKING_PAYMENT_STATUS.RELEASED;
      }
      bookingUpdate.status = BOOKING_STATUS.APPROVED;
      bookingUpdate.completedAt = new Date();
      bookingUpdate.$push = {
        statusHistory: {
          status: BOOKING_STATUS.APPROVED,
          changedBy: ROLE.ADMIN,
          reason: `Dispute dismissed by admin: ${note}`,
          changedAt: new Date(),
        },
      };

      await this._unitOfWork.execute(async (options) => {
        await this._disputeRepository.update(disputeId, disputeUpdate, options);
        await this._bookingRepository.update(booking._id.toString(), bookingUpdate, options);
      });

      this.notify(
        this._notificationService.createNotification(
          dispute.userId.toString(),
          NOTIFICATION_TEMPLATES.DISPUTE_DISMISSED_CUSTOMER(booking.bookingId)
        ),
        this._notificationService.createNotification(
          dispute.workerId.toString(),
          NOTIFICATION_TEMPLATES.DISPUTE_DISMISSED_WORKER(booking.bookingId)
        )
      );
      return;
    }

    if (status === DISPUTE_STATUS.RESOLVED) {
      if (!resolution) {
        throw new CustomError(DISPUTE.RESOLVE_REQUIRED, HTTPSTATUS.BAD_REQUEST);
      }
      disputeUpdate.resolution = resolution;
      disputeUpdate.resolvedBy = new Types.ObjectId(adminId);

      switch (resolution) {
        case DISPUTE_RESOLUTION.REFUND_FULL: {
          if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.HELD) {
            await this._paymentService.refundBookingPayment(booking._id.toString());
            bookingUpdate.paymentStatus = BOOKING_PAYMENT_STATUS.REFUNDED;
            disputeUpdate.refundedAmount = booking.total;
          }
          bookingUpdate.status = BOOKING_STATUS.CANCELLED;
          bookingUpdate.$push = {
            statusHistory: {
              status: BOOKING_STATUS.CANCELLED,
              changedBy: ROLE.ADMIN,
              reason: `Dispute resolved: Full refund to customer. Note: ${note}`,
              changedAt: new Date(),
            },
          };

          await this._unitOfWork.execute(async (options) => {
            await this._disputeRepository.update(disputeId, disputeUpdate, options);
            await this._bookingRepository.update(booking._id.toString(), bookingUpdate, options);
          });

          this.notify(
            this._notificationService.createNotification(
              dispute.userId.toString(),
              NOTIFICATION_TEMPLATES.DISPUTE_RESOLVED_FULL_REFUND_CUSTOMER(
                booking.bookingId,
                booking.total
              )
            ),
            this._notificationService.createNotification(
              dispute.workerId.toString(),
              NOTIFICATION_TEMPLATES.DISPUTE_RESOLVED_FULL_REFUND_WORKER(booking.bookingId)
            )
          );
          break;
        }

        case DISPUTE_RESOLUTION.REFUND_PARTIAL: {
          if (!refundedAmount || refundedAmount <= 100) {
            throw new CustomError(DISPUTE.PARTIAL_REFUND_REQUIRED, HTTPSTATUS.BAD_REQUEST);
          }

          if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.HELD) {
            await this._paymentService.refundBookingPayment(booking._id.toString(), refundedAmount);

            const payment = await this._paymentRepository.findOne({
              bookingId: new Types.ObjectId(booking._id.toString()),
              billType: BILL_TYPE.BOOKING,
              status: { $in: [PAYMENT_STATUS.SUCCEEDED, PAYMENT_STATUS.REFUNDED] },
            });

            if (payment) {
              const remainingWorkerAmount = Math.max(
                0,
                (payment.workerAmount ?? 0) - refundedAmount
              );
              const remainingPlatformFee =
                (payment.platformFee ?? 0) -
                Math.max(0, refundedAmount - (payment.workerAmount ?? 0));

              await this._paymentService.releaseBookingPayment(booking, remainingWorkerAmount);

              await this._unitOfWork.execute(async (options) => {
                await this._paymentRepository.findOneAndUpdate(
                  { _id: payment._id },
                  { platformFee: remainingPlatformFee },
                  options
                );
                await this._disputeRepository.update(disputeId, disputeUpdate, options);
                await this._bookingRepository.update(
                  booking._id.toString(),
                  bookingUpdate,
                  options
                );
              });
            } else {
              await this._unitOfWork.execute(async (options) => {
                await this._disputeRepository.update(disputeId, disputeUpdate, options);
                await this._bookingRepository.update(
                  booking._id.toString(),
                  bookingUpdate,
                  options
                );
              });
            }

            bookingUpdate.paymentStatus = BOOKING_PAYMENT_STATUS.RELEASED;
          } else {
            await this._unitOfWork.execute(async (options) => {
              await this._disputeRepository.update(disputeId, disputeUpdate, options);
              await this._bookingRepository.update(booking._id.toString(), bookingUpdate, options);
            });
          }

          bookingUpdate.status = BOOKING_STATUS.APPROVED;
          bookingUpdate.completedAt = new Date();
          bookingUpdate.$push = {
            statusHistory: {
              status: BOOKING_STATUS.APPROVED,
              changedBy: ROLE.ADMIN,
              reason: `Dispute resolved: Partial refund of ${refundedAmount} to customer. Note: ${note}`,
              changedAt: new Date(),
            },
          };
          disputeUpdate.refundedAmount = refundedAmount;

          this.notify(
            this._notificationService.createNotification(
              dispute.userId.toString(),
              NOTIFICATION_TEMPLATES.DISPUTE_RESOLVED_PARTIAL_REFUND_CUSTOMER(
                booking.bookingId,
                refundedAmount
              )
            ),
            this._notificationService.createNotification(
              dispute.workerId.toString(),
              NOTIFICATION_TEMPLATES.DISPUTE_RESOLVED_PARTIAL_REFUND_WORKER(
                booking.bookingId,
                refundedAmount
              )
            )
          );
          break;
        }

        case DISPUTE_RESOLUTION.PAYOUT_WORKER: {
          if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.HELD) {
            await this._paymentService.releaseBookingPayment(booking);
            bookingUpdate.paymentStatus = BOOKING_PAYMENT_STATUS.RELEASED;
          }
          bookingUpdate.status = BOOKING_STATUS.APPROVED;
          bookingUpdate.completedAt = new Date();
          bookingUpdate.$push = {
            statusHistory: {
              status: BOOKING_STATUS.APPROVED,
              changedBy: ROLE.ADMIN,
              reason: `Dispute resolved: Payout full amount to worker. Note: ${note}`,
              changedAt: new Date(),
            },
          };

          await this._unitOfWork.execute(async (options) => {
            await this._disputeRepository.update(disputeId, disputeUpdate, options);
            await this._bookingRepository.update(booking._id.toString(), bookingUpdate, options);
          });

          this.notify(
            this._notificationService.createNotification(
              dispute.userId.toString(),
              NOTIFICATION_TEMPLATES.DISPUTE_RESOLVED_PAYOUT_WORKER_CUSTOMER(booking.bookingId)
            ),
            this._notificationService.createNotification(
              dispute.workerId.toString(),
              NOTIFICATION_TEMPLATES.DISPUTE_RESOLVED_PAYOUT_WORKER_WORKER(booking.bookingId)
            )
          );
          break;
        }
        default:
          throw new CustomError(DISPUTE.FAILED, HTTPSTATUS.BAD_REQUEST);
      }
    }
  }
}
