import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";

import {
  DESCRIPTION_REGEX,
  DOCUMENT_STATUS,
  DOCUMENT_TYPE,
  DocumentStatus,
  WORKER_STATUS,
  WorkerStatus,
} from "@/constants";

type UpdatableDocumentStatus = Exclude<DocumentStatus, typeof DOCUMENT_STATUS.PENDING>;

class WorkerDocumentDTO {
  @IsMongoId()
  id!: string;

  @IsEnum(Object.values(DOCUMENT_TYPE) as [string, ...string[]])
  type!: string;

  @IsEnum([DOCUMENT_STATUS.VERIFIED, DOCUMENT_STATUS.REJECTED, DOCUMENT_STATUS.IN_REVIEW])
  status!: UpdatableDocumentStatus;

  @ValidateIf((o) => o.status === DOCUMENT_STATUS.REJECTED)
  @IsString()
  @MinLength(10, { message: "Reason minimum 10 characters" })
  @MaxLength(500, { message: "Reason cannot exceed 500 characters" })
  @Matches(DESCRIPTION_REGEX, {
    message: "Reason contains invalid characters",
  })
  rejectReason?: string;
}

export class WorkerReviewRequestDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerDocumentDTO)
  documents!: WorkerDocumentDTO[];

  @ValidateIf(
    (o) => o.status === WORKER_STATUS.REJECTED || o.status === WORKER_STATUS.NEEDS_REVISION
  )
  @IsString()
  @MinLength(10, { message: "Reason minimum 10 characters" })
  @MaxLength(500, { message: "Reason cannot exceed 500 characters" })
  @Matches(DESCRIPTION_REGEX, {
    message: "Reason contains invalid characters",
  })
  rejectReason?: string;

  @IsEnum([
    WORKER_STATUS.IN_REVIEW,
    WORKER_STATUS.VERIFIED,
    WORKER_STATUS.NEEDS_REVISION,
    WORKER_STATUS.REJECTED,
  ])
  status!: WorkerStatus;
}

export class WorkerDocumentReviewRequestDTO {
  @IsEnum([DOCUMENT_STATUS.VERIFIED, DOCUMENT_STATUS.REJECTED, DOCUMENT_STATUS.IN_REVIEW])
  status!: UpdatableDocumentStatus;

  @ValidateIf((o) => o.status === DOCUMENT_STATUS.REJECTED)
  @IsString()
  @MinLength(10, { message: "Reason minimum 10 characters" })
  @MaxLength(500, { message: "Reason cannot exceed 500 characters" })
  @Matches(DESCRIPTION_REGEX, {
    message: "Reason contains invalid characters",
  })
  rejectReason?: string;
}
