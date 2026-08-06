import { QuoteStatus } from "@/constants";

import { IBookingSlot } from "../booking/booking.entity";
import { Cursor } from "../common/query";

export interface QuoteListQuery {
  search?: string;
  userId?: string;
  workerId?: string;
  status?: QuoteStatus | "all";
  cursor?: Cursor | null;
  limit: number;
}

export interface ISyncRescheduleSlotData {
  oldSlotId: string;
  oldSlotDate: Date;
  newSlotId: string;
  newSlot: IBookingSlot;
}
