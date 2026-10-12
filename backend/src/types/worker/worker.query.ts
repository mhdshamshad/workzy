import { WorkerStatus } from "@/constants";
import { WalletPayoutStatus } from "@/constants/payout";

export type WorkerStatusFilter = WorkerStatus | "all";

export type WorkerListQuery = {
  page: number;
  limit: number;
  search?: string;
  status: WorkerStatusFilter;
  payoutStatus?: WalletPayoutStatus | "all";
};

export type NearbyWorkerListQuery = {
  radius: number;
  limit: number;
  lat: number;
  lng: number;
};

type PublicWorkerCursor = {
  _id: string;
  distance: number;
};

export type PublicWorkerListQuery = {
  lat: number;
  lng: number;
  radiusKm: number;

  cursor?: PublicWorkerCursor;
  limit: number;

  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availableNow?: boolean;
  workerId?: string;
};
