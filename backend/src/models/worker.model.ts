import mongoose, { Schema } from "mongoose";

import { DOCUMENT_STATUS, DOCUMENT_TYPE, STRIPE_ACCOUNT_STATUS, WORKER_STATUS } from "@/constants";
import { WALLET_PAYOUT_STATUS } from "@/constants/payout";
import {
  IAvailabilitySlots,
  IGeoLocation,
  IJobStats,
  IReviewStats,
  IWorker,
  IWorkerDocument,
} from "@/types/worker/worker.entity";

const LocationSchema = new Schema<IGeoLocation>(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true, // [lng , lat]
      validate: {
        validator: (v: number[]) => v.length === 2,
        message: "Coordinates must be [lng, lat]",
      },
    },
    addressLabel: { type: String, default: "" },
  },
  { _id: false }
);

const CurrentLocationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.length === 2,
        message: "Coordinates must be [lng, lat]",
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const AvailabilitySchema = new Schema<IAvailabilitySlots>(
  {
    monday: [{ startTime: String, endTime: String }],
    tuesday: [{ startTime: String, endTime: String }],
    wednesday: [{ startTime: String, endTime: String }],
    thursday: [{ startTime: String, endTime: String }],
    friday: [{ startTime: String, endTime: String }],
    saturday: [{ startTime: String, endTime: String }],
    sunday: [{ startTime: String, endTime: String }],
  },
  { _id: false }
);

const DocumentSchema = new Schema<IWorkerDocument>({
  type: { type: String, enum: Object.values(DOCUMENT_TYPE), required: true },
  url: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(DOCUMENT_STATUS),
    default: DOCUMENT_STATUS.PENDING,
  },
  uploadedAt: { type: Date, default: Date.now },
  rejectReason: { type: String },
  verifiedAt: { type: Date },
});

const JobStatsSchema = new Schema<IJobStats>(
  {
    offered: { type: Number, default: 0 },
    accepted: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    noResponse: { type: Number, default: 0 },
  },
  { _id: false }
);

const ReviewStatsSchema = new Schema<IReviewStats>(
  {
    averageRating: { type: Number, default: 0 },
    totalRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    breakdown: {
      "1": { type: Number, default: 0 },
      "2": { type: Number, default: 0 },
      "3": { type: Number, default: 0 },
      "4": { type: Number, default: 0 },
      "5": { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const workerSchema = new Schema<IWorker>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    tagline: { type: String },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    about: { type: String },
    profileImage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(WORKER_STATUS),
      default: WORKER_STATUS.PENDING,
    },
    coverImage: {
      type: String,
    },
    experience: {
      type: Number,
      default: 0,
    },
    availability: {
      type: AvailabilitySchema,
      default: () => ({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      }),
    },
    documents: {
      type: [DocumentSchema],
      default: [],
    },
    jobStats: {
      type: JobStatsSchema,
      default: () => ({}),
    },
    reviewStats: {
      type: ReviewStatsSchema,
      default: () => ({}),
    },
    rejectReason: { type: String },
    suspensionReason: { type: String },
    languages: {
      type: [String],
      default: [],
    },
    location: {
      type: LocationSchema,
      required: true,
    },
    currentLocation: CurrentLocationSchema,
    stripeAccountId: { type: String },
    stripeAccountStatus: {
      type: String,
      enum: Object.values(STRIPE_ACCOUNT_STATUS),
      default: STRIPE_ACCOUNT_STATUS.NOT_CONNECTED,
    },
    payoutStatus: {
      type: String,
      enum: Object.values(WALLET_PAYOUT_STATUS),
      default: WALLET_PAYOUT_STATUS.NOT_CONFIGURED,
      index: true,
    },
  },
  { timestamps: true }
);

workerSchema.index({ displayName: "text" });
workerSchema.index({ location: "2dsphere" });
workerSchema.index({ status: 1, stripeAccountStatus: 1 });
const Worker = mongoose.model<IWorker>("Worker", workerSchema);
export default Worker;
