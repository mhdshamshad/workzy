import type {
  DocumentStatus,
  DocumentType,
  PricingMode,
  ServiceType,
  WorkerStatus,
} from '@/constants';

import type { WorkerReviewStats } from './review';
import type { BulkDiscountType } from './service';

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface AvailabilitySlots {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface WorkerDocument {
  id: string;
  type: DocumentType;
  url: string;
  name?: string;
  status: DocumentStatus;
  rejectReason?: string;
  verifiedAt?: Date;
  uploadedAt: Date;
}

export interface Worker {
  id: string;
  userId: string;
  displayName: string;
  tagline?: string;
  about?: string;
  coverImage?: string;
  status: WorkerStatus;
  documents: WorkerDocument[];
  availability: AvailabilitySlots;
  rejectReason?: string;
}

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number];
  addressLabel: string;
}

export interface PublicWorkerListItem {
  id: string;
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
  totalAmount: number;
}

export interface PublicWorkerListParams {
  limit: number;
  lat: number;
  lng: number;
  radiusKm: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availableNow?: boolean;
  cursor?: string;
}

export interface PublicWorkerResponse {
  workers: PublicWorkerListItem[];
  nextCursor: string | null;
}

export type WorkerProfile = {
  id: string;
  displayName: string;
  tagline: string;
  about: string;
  experience: number;
  profileImage?: string;
  coverImage: string;
  addressLabel: string;
  reviewStats: WorkerReviewStats;
  availability: AvailabilitySlots;
  isAvailableToday: boolean;
  languages: string[];
  jobStats: {
    offered: number;
    accepted: number;
    completed: number;
    noResponse: number;
    complitionRate: number;
  };
};

export type WorkerProfileDetails = {
  id: string;
  displayName: string;
  tagline: string;
  about: string;
  availability: AvailabilitySlots;
  experience: number;
  phone: string;
  profileImage?: string;
  coverImage: string;
  location: GeoLocation;
  status: WorkerStatus;
  documents: WorkerDocument[];
  languages: string[];
  rejectReason?: string;
  suspensionReason?: string;
  createdAt: Date;
};

export interface WorkerStatsSummary {
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;

  rating: number;
  totalReviews: number;
  completionRate: number;

  grossRevenue: number;
  workerEarnings: number;
  platformRevenue: number;
}
