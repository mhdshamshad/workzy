import { model, Schema } from "mongoose";

import {
  BOOKING_DAY_STATUS,
  BOOKING_PAYMENT_STATUS,
  BOOKING_PAYMENT_STATUS_VALUES,
  BOOKING_STATUS,
  BOOKING_STATUS_VALUES,
  BOOKING_TYPE,
  PRICING_MODE_VALUES,
  ROLE_VALUES,
  SERVICE_TYPE_VALUES,
} from "@/constants";
import {
  IBooking,
  IBookingSnapshot,
  IBookingStatusHistory,
  IDailyLog,
  IEvidence,
  IExtraCharge,
} from "@/types/booking/booking.entity";

import { LocationSchema } from "./user.model";

const BookingScheduleSchema = new Schema(
  {
    date: { type: Date, required: true },
    startTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    endTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  },
  { _id: false }
);

const ExtraChargeSchema = new Schema<IExtraCharge>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    evidenceUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
      default: "pending",
    },
    requestedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
  },
  { _id: false }
);

export const EvidenceItemSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: ["image", "video"], required: true },
  },
  { _id: false }
);

const EvidenceSchema = new Schema<IEvidence>(
  {
    before: { type: [EvidenceItemSchema], default: [] },
    after: { type: [EvidenceItemSchema], default: [] },
    uploadedAt: { type: Date },
  },
  { _id: false }
);

const DailyLogSchema = new Schema<IDailyLog>(
  {
    dayIndex: { type: Number, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(BOOKING_DAY_STATUS),
      default: BOOKING_DAY_STATUS.PENDING,
      required: true,
    },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    evidence: { type: EvidenceSchema },
    workerNote: { type: String, trim: true },
    skippedReason: { type: String, trim: true },
  },
  { _id: false }
);

const BookingStatusHistorySchema = new Schema<IBookingStatusHistory>(
  {
    status: {
      type: String,
      enum: BOOKING_STATUS_VALUES,
      required: true,
    },
    changedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    changedBy: {
      type: String,
      enum: ROLE_VALUES,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { _id: false }
);

const BookingLocationSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    location: LocationSchema,
  },
  { _id: false }
);

const BookingSnapshotSchema = new Schema<IBookingSnapshot>(
  {
    user: {
      name: { type: String, required: true },
      phone: String,
    },
    worker: {
      name: { type: String, required: true },
      phone: String,
    },
    category: {
      name: { type: String, required: true },
      serviceType: {
        type: String,
        enum: SERVICE_TYPE_VALUES,
      },
      pricingMode: {
        type: String,
        enum: PRICING_MODE_VALUES,
      },
    },
  },
  { _id: false }
);

const RescheduleRequestSchema = new Schema(
  {
    requestedBy: { type: String, enum: ["user", "worker"], required: true },
    oldSlotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
    newSlotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
    newDate: { type: Date, required: true },
    newStartTime: { type: String, required: true },
    newEndTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired"],
      default: "pending",
      required: true,
    },
    reason: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now, required: true },
  },
  { _id: false }
);

const BookingSchema: Schema<IBooking> = new Schema(
  {
    bookingId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    quoteId: {
      type: Schema.Types.ObjectId,
      ref: "Quote",
    },
    bookingType: {
      type: String,
      enum: Object.values(BOOKING_TYPE),
      default: BOOKING_TYPE.INSTANT,
    },
    dailyLogs: {
      type: [DailyLogSchema],
      default: [],
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
    snapshot: {
      type: BookingSnapshotSchema,
      required: true,
    },
    dates: {
      type: [BookingScheduleSchema],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    address: {
      type: BookingLocationSchema,
      default: null,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    itemCount: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    chargeableAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    travelCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    platformFeePercent: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    platformFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: { type: Number, required: true, min: 0 },
    extraCharge: { type: ExtraChargeSchema, default: null },
    evidence: { type: EvidenceSchema, default: null },
    hasVisibleReview: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: BOOKING_PAYMENT_STATUS_VALUES,
      required: true,
      default: BOOKING_PAYMENT_STATUS.PENDING,
      index: true,
    },
    status: {
      type: String,
      enum: BOOKING_STATUS_VALUES,
      required: true,
      default: BOOKING_STATUS.PENDING,
    },
    statusHistory: {
      type: [BookingStatusHistorySchema],
      default: [],
    },
    userNote: {
      type: String,
      trim: true,
    },
    workerNote: {
      type: String,
      trim: true,
    },
    adminNote: {
      type: String,
      trim: true,
    },
    rescheduleRequest: { type: RescheduleRequestSchema, default: null },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, date: -1, startTime: -1, _id: -1 });
BookingSchema.index({ userId: 1, status: 1, date: -1, startTime: -1, _id: -1 });
BookingSchema.index({ userId: 1, status: 1, date: 1, startTime: 1, _id: 1 });

BookingSchema.index({ workerId: 1, date: -1, startTime: -1, _id: -1 });
BookingSchema.index({ workerId: 1, status: 1, date: -1, startTime: -1, _id: -1 });
BookingSchema.index({ workerId: 1, status: 1, date: 1, startTime: 1, _id: 1 });

const Booking = model<IBooking>("Booking", BookingSchema);
export default Booking;
