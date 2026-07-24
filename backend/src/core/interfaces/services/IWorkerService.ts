import { StripeAccountStatus } from "@/constants";
import {
  WorkerDocumentReviewRequestDTO,
  WorkerReviewRequestDTO,
} from "@/dtos/requests/admin/worker-review.dto";
import { JoinUsDTO } from "@/dtos/requests/joinUs.dto";
import { WorkerProfileRequestDto } from "@/dtos/requests/worker.profile.dto";
import { WorkerListResponseDto } from "@/dtos/responses/admin/worker.dto";
import { PublicWorkerListResponseDto } from "@/dtos/responses/worker/worker-public.response.dto";
import { NearbyWorkerResponseDTO } from "@/dtos/responses/worker/worker.nearby.response.dto";
import {
  WorkerDetailsResponseDto,
  WorkerProfileResponseDTO,
} from "@/dtos/responses/worker/worker.profile.dto";
import { CursorPaginatedResult, PaginatedResult } from "@/types/common/pagination";
import { IWorker } from "@/types/worker/worker.entity";
import { WorkerStatsSummary } from "@/types/worker/worker.projection";
import {
  NearbyWorkerListQuery,
  PublicWorkerListQuery,
  WorkerListQuery,
} from "@/types/worker/worker.query";
import { WorkerDashboardAnalytics } from "@/types/worker/workerDashboard.types";

export interface IWorkerService {
  listWorkers(query: WorkerListQuery): Promise<PaginatedResult<WorkerListResponseDto>>;
  listNearbyWorkers(query: NearbyWorkerListQuery): Promise<NearbyWorkerResponseDTO[]>;
  getWorkerProfile(workerId: string): Promise<WorkerProfileResponseDTO>;
  getWorkerByUserId(userId: string): Promise<IWorker | null>;
  getMyWorkerProfile(userId: string): Promise<WorkerDetailsResponseDto | null>;
  listPublicWorkers(
    serviceId: string,
    query: PublicWorkerListQuery
  ): Promise<CursorPaginatedResult<PublicWorkerListResponseDto>>;

  updateWorkerPhone(workerId: string, phone: string): Promise<boolean>;
  updateProfileImage(workerId: string, url: string): Promise<string>;

  getWorkerProfileDetails(workerId: string): Promise<WorkerDetailsResponseDto>;
  updateWorkerProfile(
    workerId: string,
    data: WorkerProfileRequestDto
  ): Promise<WorkerDetailsResponseDto>;

  createWorkerProfile(userId: string, data: JoinUsDTO): Promise<WorkerDetailsResponseDto>;
  reSubmitWorkerDocument(workerId: string, data: JoinUsDTO): Promise<WorkerDetailsResponseDto>;
  connectStripe(workerId: string): Promise<string>;
  getStripeStatus(
    workerId: string
  ): Promise<{ status: StripeAccountStatus; stripeAccountId: string | null }>;
  toggleWorkerStatus(workerId: string, reason: string): Promise<string>;
  getWorkerStats(workerId: string): Promise<WorkerStatsSummary>;
  getWorkerDashboardAnalytics(workerId: string): Promise<WorkerDashboardAnalytics>;
  reviewWorker(workerId: string, data: WorkerReviewRequestDTO): Promise<WorkerDetailsResponseDto>;
  reviewWorkerDocument(
    workerId: string,
    documentId: string,
    data: WorkerDocumentReviewRequestDTO
  ): Promise<WorkerDetailsResponseDto>;
}
