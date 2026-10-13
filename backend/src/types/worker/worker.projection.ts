import { Types } from "mongoose";

import {
  PricingMode,
  ServiceType,
  StripeAccountStatus,
  WalletPayoutStatus,
  WorkerStatus,
} from "@/constants";

import { BulkDiscountType } from "../service/service.entity";

import { IAvailabilitySlots, IGeoLocation, IJobStats, IReviewStats } from "./worker.entity";

export type WorkerListItem = {
  _id: string;
  userId: {
    _id: Types.ObjectId;
    email: string;
  };
  displayName: string;
  phone?: string;
  profileImage?: string;
  stripeAccountStatus: StripeAccountStatus;
  payoutStatus: WalletPayoutStatus;
  status: WorkerStatus;
  createdAt: Date;
};

export type NearbyWorkerItem = {
  _id: string;
  profileImage?: string;
  displayName: string;
  tagline: string;
  experience: number;
  distance: number;
  completedJobs: number;
  averageRating: number;
};

export type WorkerProfile = {
  _id: string;
  displayName: string;
  tagline: string;
  about: string;
  profileImage?: string;
  coverImage?: string;
  location: IGeoLocation;
  experience: number;
  languages: string[];
  availability: IAvailabilitySlots;
  jobStats: IJobStats;
  reviewStats: IReviewStats;
};

export type PublicWorkerListItem = {
  _id: string;
  displayName: string;
  tagline: string;
  profileImage?: string;
  experience: number;

  serviceId: string;
  serviceRate: number;
  description: string;
  estimatedDuration: number;
  bufferTime: number;
  categoryName: string;
  serviceType: ServiceType;
  pricingMode: PricingMode;
  bulkDiscounts: BulkDiscountType[] | null;

  averageRating: number;
  reviewCount: number;
  isAvailable: boolean;
  travelCost: number;
  distanceKm: number;
};

export type WorkerRevenueStats = {
  grossRevenue: number;
  workerEarnings: number;
  platformRevenue: number;
};

export type WorkerStatsSummary = WorkerRevenueStats & {
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;

  rating: number;
  totalReviews: number;
  completionRate: number;
};
