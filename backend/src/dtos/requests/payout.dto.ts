import { IsIn, IsNumber, IsOptional, IsString, IsUrl, Matches, Min } from "class-validator";

import { MIN_PAYOUT_AMOUNT, PAYOUT_METHOD, PayoutMethod } from "@/constants/payout";

export class BankDetailsDto {
  @IsString()
  @Matches(/^[a-zA-Z\s.]{3,60}$/, {
    message: "Account holder name must be 3-60 characters and contain only letters",
  })
  accountHolderName!: string;

  @IsString()
  @Matches(/^\d{9,18}$/, {
    message: "Account number must be 9 to 18 numeric digits",
  })
  accountNumber!: string;

  @IsString()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message: "Invalid IFSC code format (e.g. SBIN0001234)",
  })
  ifscCode!: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9\s.&'-]{3,60}$/, {
    message: "Bank name must be between 3 and 60 characters",
  })
  bankName!: string;
}

export class UpiDetailsDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, {
    message: "Invalid UPI ID format (e.g. worker@okaxis or 9876543210@upi)",
  })
  upiId!: string;
}

export class setPrimaryMethodDto {
  @IsIn(Object.values(PAYOUT_METHOD))
  method!: PayoutMethod;
}

export class RequestPayoutDto {
  @IsNumber()
  @Min(MIN_PAYOUT_AMOUNT, { message: `Minimum payout request amount is ₹${MIN_PAYOUT_AMOUNT}` })
  amount!: number;
}

export class ApprovePayoutDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9\-_]{6,40}$/, {
    message: "Reference ID / UTR must be 6 to 40 alphanumeric characters",
  })
  referenceId!: string;

  @IsString()
  @IsUrl()
  receiptUrl!: string;
}

export class RejectPayoutDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
