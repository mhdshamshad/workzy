import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

import { DESCRIPTION_REGEX, Role, ROLE } from "@/constants";

import { LocationDto } from "./profile.dto";

class BookingLocationDto {
  @IsString()
  label!: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;
}

export class CreatebookingDTO {
  @IsMongoId()
  workerId!: string;

  @IsMongoId()
  serviceId!: string;

  @IsMongoId()
  slotId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  itemCount?: number;

  @ValidateNested()
  @Type(() => BookingLocationDto)
  address!: BookingLocationDto;

  @IsOptional()
  @IsString()
  userNote?: string;
}

export class CancelBookingDTO {
  @IsString()
  @MinLength(10, { message: "Please provide a reason (min 10 chars)" })
  @MaxLength(500)
  reason!: string;
}

export class RejectBookingDTO {
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason!: string;
}

export class VerifyBookingOtpDTO {
  @IsString()
  @Length(6, 6, { message: "OTP must be exactly 6 digits" })
  otp!: string;
}

export class EvidenceItemDTO {
  @IsString()
  @IsUrl()
  url!: string;

  @IsIn(["image", "video"])
  type!: "image" | "video";
}

export class EvidenceDTO {
  @IsArray()
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => EvidenceItemDTO)
  before!: EvidenceItemDTO[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => EvidenceItemDTO)
  after!: EvidenceItemDTO[];
}

export class CompleteBookingDTO {
  @ValidateNested()
  @Type(() => EvidenceDTO)
  evidence!: EvidenceDTO;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ExtraChargeDTO {
  @IsNumber()
  @Min(60, { message: "Minimum extra charge amount is ₹60" })
  amount!: number;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason!: string;

  @IsOptional()
  @IsString()
  evidenceUrl?: string;
}

export class RequestRescheduleDto {
  @IsMongoId()
  oldSlotId!: string;

  @IsMongoId()
  newSlotId!: string;

  @IsString()
  @MinLength(10, { message: "Please provide a reason (min 5 chars)" })
  @MaxLength(500)
  @Matches(DESCRIPTION_REGEX, { message: "Invalid description format." })
  reason!: string;

  @IsEnum(ROLE)
  requestedBy!: Role;
}

export class RespondRescheduleDto {
  @IsIn(["accepted", "rejected"])
  status!: "accepted" | "rejected";

  @IsEnum(ROLE)
  role!: Role;
}

export class CancelRescheduleDto {
  @IsEnum(ROLE)
  requestedBy!: Role;
}

export class DayCompleteDTO {
  @IsOptional()
  @IsString()
  note?: string;

  @ValidateNested()
  @Type(() => EvidenceDTO)
  evidence!: EvidenceDTO;
}
