import { Types } from "mongoose";

import { IPayout } from "./payout.entity";

export type PayoutListItem = IPayout & {
  workerId: {
    _id: Types.ObjectId;
    displayName: string;
    phone: string;
    profileImage?: string;
  };
};
