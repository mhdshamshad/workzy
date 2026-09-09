import type {
  BookingDayStatus,
  BookingFilterStatus,
  BookingPaymentStatus,
  BookingStatus,
  BookingType,
  PricingMode,
  Role,
  ServiceType,
} from '@/constants';

import type { Location } from './user';

export type ExtraChargeStatus = 'pending' | 'approved' | 'rejected';

export interface DailyLog {
  dayIndex: number;
  date: Date;
  status: BookingDayStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  evidence: Evidence;
  workerNote?: string;
  skippedReason?: string;
}

export interface PaymentDetails {
  success: boolean;
  type: string;
  transactionId: string;
  productName: string;
  amountPaid: number;
  paymentMethod: string;
  date: string;
  receiptUrl?: string;
}

export interface BookingSlot {
  date: Date;
  startTime: string;
  endTime: string;
}

interface UserSnapshot {
  id: string;
  name: string;
  phone: string;
  profileImage: string;
}

interface WorkerSnapshot {
  id: string;
  name: string;
  phone: string;
  profileImage: string;
}

interface CategorySnapshot {
  id: string;
  name: string;
  iconUrl: string;
  serviceType: ServiceType;
  pricingMode: PricingMode;
}

export interface BookingSnapshot {
  user: UserSnapshot;
  worker: WorkerSnapshot;
  category: CategorySnapshot;
}

export interface ExtraCharge {
  amount: number;
  reason: string;
  evidenceUrl?: string;
  status: ExtraChargeStatus;
  requestedAt: Date;
  respondedAt?: Date;
}

interface BookingStatusHistory {
  status: BookingStatus;
  changedAt: Date;
  changedBy?: Role;
  reason?: string;
}

export interface RequestRescheduleDTO {
  oldSlotId: string;
  newSlotId: string;
}

export interface RespondRescheduleDTO {
  status: 'accepted' | 'rejected';
}

export interface EvidenceItem {
  url: string;
  type: 'image' | 'video';
}

export interface Evidence {
  before: EvidenceItem[];
  after: EvidenceItem[];
  uploadedAt?: Date;
}

export interface BookingAddress {
  label: string;
  location: Location;
}

export interface RescheduleRequest {
  requestedBy: 'user' | 'worker';
  oldSlotId: string;
  newSlotId: string;
  newDate: Date;
  newStartTime: string;
  newEndTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  reason: string;
  requestedAt: Date;
}
export interface Booking {
  id: string;
  bookingId: string;
  userId: string;
  workerId: string;
  serviceId: string;
  categoryId: string;
  quoteId?: string;

  bookingType: BookingType;
  dailyLogs?: DailyLog[];

  // Schedule
  dates: BookingSlot[];
  duration: number;
  address: BookingAddress;

  rate: number;
  itemCount: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  chargeableAmount: number;
  travelCost: number;
  platformFeePercent: number;
  platformFee: number;
  total: number;

  extraCharge?: ExtraCharge;
  evidence?: Evidence;
  rescheduleRequest?: RescheduleRequest;

  chatId?: string;
  snapshot: BookingSnapshot;

  paymentStatus: BookingPaymentStatus;
  status: BookingStatus;
  statusHistory: BookingStatusHistory[];

  hasVisibleReview: boolean;
  reviewId?: string;
  userNote?: string;
  workerNote?: string;
  adminNote?: string;
  completedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export type BookingListItem = {
  id: string;
  bookingId: string;
  bookingType: BookingType;
  serviceId: string;
  quoteId?: string;
  user: UserSnapshot;
  worker: WorkerSnapshot;
  category: CategorySnapshot;
  addressLabel: string;
  date: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  itemCount: number;
  isRescheduleRequested: boolean;
  totalDays: number;
  status: BookingStatus;
  paymentStatus: BookingPaymentStatus;
  userNote?: string;
  hasVisibleReview: boolean;
  reviewId?: string;
  total: number;
  extraCharge?: {
    amount: number;
    status: ExtraChargeStatus;
  };
  createdAt: Date;
  completedAt: Date | null;
};

export interface BookingListingResponse {
  bookings: BookingListItem[];
  nextCursor: string | null;
}

export interface BookingListQuery {
  status?: BookingFilterStatus;
  search?: string;
  userId?: string;
  workerId?: string;
  paymentStatus?: BookingPaymentStatus | 'all';
  fromDate?: string;
  toDate?: string;
  limit: number;
  cursor?: string | null;
}

export interface BookingDetails extends Omit<Booking, 'snapshot'> {
  user: UserSnapshot;
  worker: WorkerSnapshot;
  category: CategorySnapshot;
  date: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  totalDays: number;
  addressLabel: string;
}
