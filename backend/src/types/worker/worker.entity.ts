import { Document, Types } from "mongoose";

import {
  DocumentStatus,
  DocumentType,
  StripeAccountStatus,
  WalletPayoutStatus,
  WorkerStatus,
} from "@/constants";

export interface ITimeSlot {
  startTime: string;
  endTime: string;
}
export interface IGeoLocation {
  type: "Point";
  coordinates: [number, number];
  addressLabel: string;
}

export interface IAvailabilitySlots {
  monday: ITimeSlot[];
  tuesday: ITimeSlot[];
  wednesday: ITimeSlot[];
  thursday: ITimeSlot[];
  friday: ITimeSlot[];
  saturday: ITimeSlot[];
  sunday: ITimeSlot[];
}

export interface IWorkerDocument {
  _id?: Types.ObjectId;
  type: DocumentType;
  url: string;
  status: DocumentStatus;
  rejectReason?: string;
  verifiedAt?: Date;
  uploadedAt: Date;
}

export interface IReviewStats {
  averageRating: number;
  totalRating: number;
  reviewCount: number;
  breakdown: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
}
export interface IJobStats {
  offered: number;
  accepted: number;
  completed: number;
  noResponse: number;
}

export interface IWorker extends Document<string> {
  userId: Types.ObjectId;
  displayName: string;
  tagline: string;
  about: string;
  phone: string;
  profileImage?: string;
  coverImage?: string;

  status: WorkerStatus;
  experience: number;
  documents: IWorkerDocument[];

  availability: IAvailabilitySlots;
  rejectReason?: string;
  suspensionReason?: string;
  languages: string[];

  location: IGeoLocation;
  currentLocation?: {
    type: "Point";
    coordinates: [number, number];
    lastUpdated: Date;
  };
  jobStats: IJobStats;
  reviewStats: IReviewStats;
  stripeAccountId?: string;
  stripeAccountStatus: StripeAccountStatus;
  payoutStatus: WalletPayoutStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type Day = keyof IAvailabilitySlots;
