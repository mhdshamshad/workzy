import {
  BookingPaymentStatus,
  BookingStatus,
  BookingType,
  PricingMode,
  ServiceType,
} from "@/constants";
import { IS3Service } from "@/core/interfaces/services/IS3Service";
import {
  ExtraChargeStatus,
  IBookingLocation,
  IBookingStatusHistory,
  IDailyLog,
  IEvidence,
  IExtraCharge,
  IRescheduleRequest,
} from "@/types/booking/booking.entity";
import { BookingDetails, BookingListItem } from "@/types/booking/booking.projection";
import { resolveS3Url } from "@/utils/s3.utils";

export class BookingListItemDTO {
  id!: string;
  bookingId!: string;
  quoteId?: string;
  serviceId!: string;
  bookingType!: BookingType;
  user!: {
    id: string;
    name: string;
    phone: string;
    profileImage?: string;
  };
  worker!: {
    id: string;
    name: string;
    phone: string;
    profileImage?: string;
  };
  category!: {
    id: string;
    name: string;
    iconUrl: string;
    serviceType: ServiceType;
    pricingMode: PricingMode;
  };
  addressLabel!: string;
  date!: Date;
  endDate!: Date;
  startTime!: string;
  endTime!: string;
  duration!: number;
  itemCount!: number;

  totalDays!: number;
  status!: BookingStatus;
  paymentStatus!: BookingPaymentStatus;
  userNote?: string;
  hasVisibleReview!: boolean;
  reviewId?: string;
  total!: number;
  extraCharge?: {
    amount: number;
    status: ExtraChargeStatus;
  };
  isRescheduleRequested!: boolean;
  createdAt!: Date;
  completedAt!: Date | null;

  static async fromEntity(
    entity: BookingListItem,
    s3Service: IS3Service
  ): Promise<BookingListItemDTO> {
    const dto = new BookingListItemDTO();

    const { user, worker, category } = entity.snapshot;
    const dates = entity.dates || [];
    const first = dates[0];
    const last = dates[dates.length - 1];
    const extraCharge = entity.extraCharge;

    dto.id = entity._id.toString();
    dto.quoteId = entity.quoteId ? entity.quoteId._id.toString() : undefined;
    dto.bookingId = entity.bookingId;
    dto.bookingType = entity.bookingType;
    dto.serviceId = entity.serviceId._id.toString();
    dto.user = {
      ...user,
      id: entity.userId._id.toString(),
      phone: user.phone || "",
      profileImage: await resolveS3Url(entity.userId.profileImage, s3Service),
    };
    dto.worker = {
      id: entity.workerId._id.toString(),
      name: worker.name,
      phone: worker.phone || "",
      profileImage: entity.workerId.profileImage,
    };
    dto.category = {
      id: entity.categoryId._id.toString(),
      iconUrl: entity.categoryId.iconUrl,
      ...category,
    };
    dto.addressLabel = entity.address.label;
    dto.date = first.date;
    dto.endDate = last.date;
    dto.startTime = first.startTime;
    dto.endTime = first.endTime;
    dto.duration = entity.duration;
    dto.itemCount = entity.itemCount;

    dto.isRescheduleRequested = entity.rescheduleRequest?.status === "pending";
    dto.totalDays = dates.length;
    dto.status = entity.status;
    dto.paymentStatus = entity.paymentStatus;
    dto.userNote = entity.userNote || "";
    dto.hasVisibleReview = entity.hasVisibleReview;
    dto.reviewId = entity.reviewId ? entity.reviewId.toString() : undefined;
    dto.total = entity.total;
    dto.extraCharge = extraCharge
      ? { amount: extraCharge.amount, status: extraCharge.status }
      : undefined;
    dto.completedAt = entity.completedAt || null;

    return dto;
  }

  static async fromEntities(
    entities: BookingListItem[],
    s3Service: IS3Service
  ): Promise<BookingListItemDTO[]> {
    return Promise.all(entities.map((entity) => this.fromEntity(entity, s3Service)));
  }
}

export class BookingResponseDTO {
  id!: string;
  bookingId!: string;
  bookingType!: BookingType;
  serviceId!: string;
  user!: {
    id: string;
    name: string;
    phone: string;
    profileImage?: string;
  };
  worker!: {
    id: string;
    name: string;
    phone: string;
    profileImage?: string;
  };
  category!: {
    id: string;
    name: string;
    iconUrl: string;
    serviceType: ServiceType;
    pricingMode: PricingMode;
  };
  addressLabel!: string;
  duration!: number;
  itemCount!: number;
  dates!: {
    date: Date;
    startTime: string;
    endTime: string;
  }[];
  dailyLogs?: IDailyLog[];
  totalDays!: number;
  date!: Date;
  endDate!: Date;
  startTime!: string;
  endTime!: string;
  address!: IBookingLocation;
  rate!: number;
  subtotal!: number;
  discountPercent!: number;
  discountAmount!: number;
  chargeableAmount!: number;
  travelCost!: number;
  platformFeePercent!: number;
  platformFee!: number;
  total!: number;

  extraCharge?: IExtraCharge;
  evidence?: IEvidence;
  status!: BookingStatus;
  paymentStatus!: BookingPaymentStatus;
  statusHistory!: IBookingStatusHistory[];
  hasVisibleReview!: boolean;
  rescheduleRequest?: Omit<IRescheduleRequest, "oldSlotId" | "newSlotId"> & {
    oldSlotId: string;
    newSlotId: string;
  };
  reviewId?: string;
  chatId?: string;
  userNote?: string;
  createdAt!: Date;
  completedAt!: Date | null;

  static async fromEntity(
    entity: BookingDetails,
    s3Service: IS3Service
  ): Promise<BookingResponseDTO> {
    const dto = new BookingResponseDTO();

    const { user, worker, category } = entity.snapshot;
    const dates = entity.dates || [];
    const first = dates[0];
    const last = dates[dates.length - 1];

    dto.id = entity._id.toString();
    dto.bookingId = entity.bookingId;
    dto.bookingType = entity.bookingType;
    dto.serviceId = entity.serviceId._id.toString();
    dto.user = {
      ...user,
      id: entity.userId._id.toString(),
      phone: user.phone || "",
      profileImage: await resolveS3Url(entity.userId.profileImage, s3Service),
    };
    dto.worker = {
      id: entity.workerId._id.toString(),
      name: worker.name,
      phone: worker.phone || "",
      profileImage: entity.workerId.profileImage,
    };
    dto.category = {
      id: entity.categoryId._id.toString(),
      iconUrl: entity.categoryId.iconUrl,
      ...category,
    };
    dto.dates = entity.dates || [];
    dto.dailyLogs = entity.dailyLogs;
    dto.date = first.date;
    dto.endDate = last.date;
    dto.startTime = first.startTime;
    dto.endTime = first.endTime;

    dto.totalDays = entity.dates?.length || 0;
    dto.duration = entity.duration;
    dto.itemCount = entity.itemCount;
    dto.address = entity.address;

    dto.rate = entity.rate;
    dto.itemCount = entity.itemCount;
    dto.subtotal = entity.subtotal;
    dto.discountPercent = entity.discountPercent;
    dto.discountAmount = entity.discountAmount;
    dto.chargeableAmount = entity.chargeableAmount;
    dto.travelCost = entity.travelCost;
    dto.platformFeePercent = entity.platformFeePercent;
    dto.platformFee = entity.platformFee;
    dto.total = entity.total;

    dto.extraCharge = entity.extraCharge;
    dto.evidence = entity.evidence;
    dto.paymentStatus = entity.paymentStatus;
    dto.status = entity.status;
    dto.rescheduleRequest = entity.rescheduleRequest
      ? {
          ...entity.rescheduleRequest,
          oldSlotId: entity.rescheduleRequest?.oldSlotId?.toString() || "",
          newSlotId: entity.rescheduleRequest?.newSlotId?.toString() || "",
        }
      : undefined;
    dto.statusHistory = entity.statusHistory;
    dto.hasVisibleReview = entity.hasVisibleReview;
    dto.reviewId = entity.reviewId ? entity.reviewId.toString() : undefined;
    dto.chatId = entity?.chatId;
    dto.userNote = entity.userNote;

    dto.completedAt = entity.completedAt || null;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
