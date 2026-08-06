import dayjs from "dayjs";
import { injectable } from "inversify";
import { FilterQuery, Types } from "mongoose";

import {
  BOOKING_PAYMENT_STATUS,
  BOOKING_STATUS,
  BookingPaymentStatus,
  BookingStatus,
} from "@/constants";
import { BaseRepository } from "@/core/abstracts/base.repository";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { RepositoryOptions } from "@/core/types/repository";
import Booking from "@/models/booking.model";
import { CategoryDistributionItem, RevenueChartItem, TopWorkerItem } from "@/types/admin.dashboard";
import { IBooking } from "@/types/booking/booking.entity";
import { BookingDetails, BookingListItem } from "@/types/booking/booking.projection";
import { BookingListQuery, IAcceptRescheduleData } from "@/types/booking/booking.query";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { WorkerRevenueStats } from "@/types/worker/worker.projection";
import { MonthlyEarningStat, WorkerDashboardAnalytics } from "@/types/worker/workerDashboard.types";

@injectable()
export class BookingRepository extends BaseRepository<IBooking> implements IBookingRepository {
  constructor() {
    super(Booking);
  }
  async getBookings(input: BookingListQuery): Promise<CursorPaginatedResult<BookingListItem>> {
    const { status, search, paymentStatus, limit, userId, workerId, cursor, fromDate, toDate } =
      input;

    const query: FilterQuery<IBooking> = {};
    const andConditions: FilterQuery<IBooking>[] = [];

    if (userId) query.userId = new Types.ObjectId(userId);
    if (workerId) query.workerId = new Types.ObjectId(workerId);
    if (status === "upcoming") {
      query.status = {
        $in: [
          BOOKING_STATUS.PENDING,
          BOOKING_STATUS.CONFIRMED,
          BOOKING_STATUS.EN_ROUTE,
          BOOKING_STATUS.REACHED,
          BOOKING_STATUS.IN_PROGRESS,
        ] as BookingStatus[],
      };
    } else if (status && status !== "all") {
      query.status = status as BookingStatus;
    }
    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus as BookingPaymentStatus;
    } else if (!paymentStatus) {
      query.paymentStatus = { $ne: BOOKING_PAYMENT_STATUS.PENDING };
    }
    if (search) {
      andConditions.push({
        $or: [
          { bookingId: { $regex: search, $options: "i" } },
          { "snapshot.user.name": { $regex: search, $options: "i" } },
          { "snapshot.worker.name": { $regex: search, $options: "i" } },
        ],
      });
    }
    if (fromDate || toDate) {
      const fromDateTime = fromDate ? dayjs(fromDate).startOf("day").toDate() : undefined;
      const toDateTime = toDate ? dayjs(toDate).endOf("day").toDate() : undefined;
      query["dates.0.date"] = {
        ...(fromDateTime && { $gte: new Date(fromDateTime) }),
        ...(toDateTime && { $lte: new Date(toDateTime) }),
      };
    }

    if (cursor) {
      andConditions.push({
        $or: [
          { createdAt: { $lt: new Date(cursor.createdAt) } },
          {
            createdAt: new Date(cursor.createdAt),
            _id: { $lt: new Types.ObjectId(cursor._id) },
          },
        ],
      });
    }
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }
    const docs = await this.model
      .find(query)
      .select(
        "bookingId dates duration rescheduleRequest snapshot address total completedAt itemCount status paymentStatus createdAt workerId userId serviceId categoryId hasVisibleReview reviewId completedAt userNote quoteId extraCharge"
      )
      .populate("workerId", "profileImage")
      .populate("userId", "profileImage")
      .populate("categoryId", "iconUrl")
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean<BookingListItem[]>();

    let nextCursor: string | null = null;
    if (docs.length > limit) {
      docs.pop();
      const lastItem = docs[docs.length - 1];

      nextCursor = Buffer.from(
        JSON.stringify({
          createdAt: lastItem.createdAt.toISOString(),
          _id: lastItem._id.toString(),
        })
      ).toString("base64url");
    }
    return {
      data: docs,
      nextCursor: nextCursor,
    };
  }

  async acceptReschedule(
    bookingId: string,
    { newSlot, oldSlotDate, historyEntry, newStatus }: IAcceptRescheduleData,
    options?: RepositoryOptions
  ): Promise<boolean> {
    const session = options?.session;

    const result = await this.model.bulkWrite(
      [
        {
          updateOne: {
            filter: { _id: new Types.ObjectId(bookingId) },
            update: { $pull: { dates: { date: oldSlotDate } } },
          },
        },
        {
          updateOne: {
            filter: { _id: new Types.ObjectId(bookingId) },
            update: {
              $push: {
                dates: { $each: [newSlot], $sort: { date: 1 } },
                statusHistory: historyEntry,
              },
              $set: { status: newStatus },
              $unset: { rescheduleRequest: 1 },
            },
          },
        },
      ],
      { session }
    );
    return result.modifiedCount === 2;
  }

  async getExpiredBookings(): Promise<IBooking[]> {
    const cutoffDate = dayjs().subtract(1, "day").startOf("day").toDate();
    return this.model.find({
      status: BOOKING_STATUS.PENDING,
      dates: {
        $not: {
          $elemMatch: {
            date: { $gte: cutoffDate },
          },
        },
      },
    });
  }

  async getBookingDetailById(bookingId: string): Promise<BookingDetails | null> {
    return await this.model
      .findById(bookingId)
      .populate("workerId", "profileImage")
      .populate("userId", "profileImage")
      .populate("categoryId", "iconUrl")
      .lean<BookingDetails>();
  }

  async getWorkerDashboardAnalytics(workerId: string): Promise<WorkerDashboardAnalytics> {
    const startOfYear = dayjs().startOf("year").toDate();
    const endOfYear = dayjs().endOf("year").toDate();

    const analytics = await this.model.aggregate<{
      _id: number;
      totalAmount: number;
      totalEarnings: number;
      totalPlatformFee: number;
      jobs: number;
    }>([
      {
        $match: {
          workerId: new Types.ObjectId(workerId),
          status: { $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.APPROVED] },
          completedAt: {
            $gte: startOfYear,
            $lte: endOfYear,
          },
        },
      },
      {
        $group: {
          _id: { $month: "$updatedAt" },
          totalAmount: { $sum: "$total" },
          totalPlatformFee: { $sum: "$platformFee" },
          totalEarnings: {
            $sum: {
              $subtract: ["$total", "$platformFee"],
            },
          },
          jobs: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const earningsData: MonthlyEarningStat[] = monthLabels.map((month, index) => {
      const stat = analytics.find((item) => item._id === index + 1);

      return {
        month,
        income: stat?.totalEarnings ?? 0,
        jobs: stat?.jobs ?? 0,
      };
    });
    const totalAmount = analytics.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalPlatformFee = analytics.reduce((sum, item) => sum + item.totalPlatformFee, 0);
    const totalEarnings = analytics.reduce((sum, item) => sum + item.totalEarnings, 0);

    return {
      totalAmount,
      totalPlatformFee,
      totalEarnings,
      earningsData,
    };
  }

  async getRevenueAnalytics(): Promise<RevenueChartItem[]> {
    const startOfYear = dayjs().startOf("year").toDate();
    const endOfYear = dayjs().endOf("year").toDate();
    const analytics = await this.model.aggregate<{
      _id: number;
      revenue: number;
      commission: number;
    }>([
      {
        $match: {
          status: {
            $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.APPROVED],
          },

          completedAt: {
            $gte: startOfYear,
            $lte: endOfYear,
          },
        },
      },
      {
        $group: {
          _id: {
            $month: "$completedAt",
          },

          revenue: {
            $sum: "$total",
          },

          commission: {
            $sum: "$platformFee",
          },
        },
      },
    ]);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return months.map((month, index) => {
      const stat = analytics.find((item) => item._id === index + 1);
      return {
        month,
        revenue: stat?.revenue ?? 0,
        commission: stat?.commission ?? 0,
      };
    });
  }

  async getCategoryDistribution(): Promise<CategoryDistributionItem[]> {
    const analytics = await this.model.aggregate<{
      name: string;
      value: number;
    }>([
      {
        $match: {
          status: {
            $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.APPROVED],
          },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $lookup: {
          from: "categories",
          localField: "category.parentId",
          foreignField: "_id",
          as: "parentCategory",
        },
      },
      {
        $unwind: { path: "$parentCategory", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          name: {
            $ifNull: ["$parentCategory.name", "$category.name"],
          },
          value: "$count",
        },
      },
    ]);

    const total = analytics.reduce((sum, item) => sum + item.value, 0);

    return analytics.map((item) => ({
      name: item.name,
      value: total > 0 ? Math.round((item.value / total) * 100) : 0,
    }));
  }

  async getTopWorkers(): Promise<TopWorkerItem[]> {
    return this.model.aggregate<TopWorkerItem>([
      {
        $match: {
          status: {
            $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.APPROVED],
          },
        },
      },

      {
        $group: {
          _id: "$workerId",

          jobs: {
            $sum: 1,
          },

          earnings: {
            $sum: {
              $subtract: ["$total", "$platformFee"],
            },
          },
        },
      },

      {
        $sort: {
          jobs: -1,
        },
      },

      {
        $limit: 5,
      },

      {
        $lookup: {
          from: "workers",
          localField: "_id",
          foreignField: "_id",
          as: "worker",
        },
      },

      {
        $unwind: "$worker",
      },

      {
        $project: {
          workerId: "$worker._id",

          name: "$worker.displayName",

          jobs: 1,

          earnings: 1,

          rating: "$worker.reviewStats.averageRating",
        },
      },
    ]);
  }

  async getWorkerRevenueStats(workerId: string): Promise<WorkerRevenueStats> {
    const result = await this.model.aggregate([
      {
        $match: {
          workerId: new Types.ObjectId(workerId),
          status: { $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.APPROVED] },
          paymentStatus: BOOKING_PAYMENT_STATUS.RELEASED,
        },
      },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: "$chargeableAmount" },
          platformRevenue: { $sum: "$platformFee" },
        },
      },
    ]);

    const grossRevenue = result[0]?.grossRevenue ?? 0;
    const platformRevenue = result[0]?.platformRevenue ?? 0;

    return {
      grossRevenue,
      platformRevenue,
      workerEarnings: grossRevenue - platformRevenue,
    };
  }
}
