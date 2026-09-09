import { Types } from "mongoose";

import { IBooking } from "./booking.entity";

export type BookingListItem = Omit<
  Pick<
    IBooking,
    | "_id"
    | "bookingId"
    | "bookingType"
    | "dates"
    | "duration"
    | "itemCount"
    | "userNote"
    | "hasVisibleReview"
    | "reviewId"
    | "snapshot"
    | "address"
    | "total"
    | "status"
    | "paymentStatus"
    | "createdAt"
    | "workerId"
    | "categoryId"
    | "serviceId"
    | "userId"
    | "quoteId"
    | "completedAt"
    | "extraCharge"
    | "rescheduleRequest"
  >,
  "workerId" | "userId" | "categoryId"
> & {
  workerId: {
    _id: Types.ObjectId;
    profileImage?: string;
  };
  userId: {
    _id: Types.ObjectId;
    profileImage?: string;
  };
  categoryId: {
    _id: Types.ObjectId;
    iconUrl: string;
  };
};

export type BookingDetails = Omit<IBooking, "otp"> & {
  workerId: {
    _id: Types.ObjectId;
    profileImage?: string;
  };
  userId: {
    _id: Types.ObjectId;
    profileImage?: string;
  };
  categoryId: {
    _id: Types.ObjectId;
    iconUrl: string;
  };
  chatId?: string;
};
