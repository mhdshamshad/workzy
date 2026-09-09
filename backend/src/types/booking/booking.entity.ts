import { Document, Types } from "mongoose";

import {
  BookingPaymentStatus,
  BookingStatus,
  BookingDayStatus,
  PricingMode,
  Role,
  ServiceType,
  BookingType,
} from "@/constants";

import { ICategory } from "../category";
import { IService } from "../service/service.entity";
import { ILocation } from "../user/user.entity";

export type ExtraChargeStatus = "pending" | "approved" | "rejected";

export interface IDailyLog {
  dayIndex: number;
  date: Date;
  status: BookingDayStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  evidence?: IEvidence;
  workerNote?: string;
  skippedReason?: string;
}

export interface IBookingLocation {
  label: string;
  location: ILocation;
}

export interface IBookingSlot {
  // slotId: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
}

export interface IBookingSnapshot {
  user: {
    name: string;
    phone?: string;
  };
  worker: {
    name: string;
    phone?: string;
  };
  category: {
    name: string;
    serviceType: ServiceType;
    pricingMode: PricingMode;
  };
}

export interface IExtraCharge {
  amount: number;
  reason: string;
  evidenceUrl?: string;
  status: ExtraChargeStatus;
  requestedAt: Date;
  respondedAt?: Date;
}

export interface IBookingStatusHistory {
  status: BookingStatus;
  changedAt: Date;
  changedBy?: Role;
  reason?: string;
}
export interface IEvidenceItem {
  url: string;
  type: "image" | "video";
}
export interface IEvidence {
  before: IEvidenceItem[];
  after: IEvidenceItem[];
  uploadedAt?: Date;
}

export interface IRescheduleRequest {
  requestedBy: "user" | "worker";
  oldSlotId: Types.ObjectId;
  newSlotId: Types.ObjectId;
  newDate: Date;
  newStartTime: string;
  newEndTime: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  reason: string;
  requestedAt: Date;
}

export interface IBooking extends Document<string> {
  bookingId: string;
  userId: Types.ObjectId;
  workerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  categoryId: Types.ObjectId;
  quoteId?: Types.ObjectId;

  bookingType: BookingType;
  dailyLogs?: IDailyLog[];

  // Schedule
  dates: IBookingSlot[];
  duration: number; //0 for full day
  address: IBookingLocation;

  rate: number; // worker rate per unit
  itemCount: number;
  subtotal: number; // rate * itemCount
  discountPercent: number; // 0 if no discount
  discountAmount: number; // subtotal * discountPercent/100
  chargeableAmount: number; // subtotal - discountAmount  ← platform fee based on THIS
  travelCost: number; // no platform fee on this
  platformFeePercent: number; // snapshot from category at booking time
  platformFee: number; // chargeableAmount * platformFeePercent/100
  total: number; // chargeableAmount + travelCost (user pays this)

  extraCharge?: IExtraCharge;
  evidence?: IEvidence;
  snapshot: IBookingSnapshot;

  paymentStatus: BookingPaymentStatus;
  status: BookingStatus;
  statusHistory: IBookingStatusHistory[];
  rescheduleRequest?: IRescheduleRequest;

  reviewId?: Types.ObjectId;
  hasVisibleReview: boolean;
  userNote?: string;
  workerNote?: string;
  adminNote?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingContext {
  worker: {
    name: string;
    phone?: string;
  };
  service: IService;
  category: ICategory;
  pricingMode: PricingMode;
  rate: number;
  estimatedDuration: number;
  bufferTime: number;
  platformFeePercent: number;
  travelRatePerKM: number;
  distanceKm: number;
  travelCost: number;
  workerStripeId: string;
}
