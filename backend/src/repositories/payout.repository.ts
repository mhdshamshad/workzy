import { injectable } from "inversify";
import { FilterQuery, Types } from "mongoose";

import { PAYOUT_REQUEST_STATUS } from "@/constants";
import { BaseRepository } from "@/core/abstracts/base.repository";
import { IPayoutRepository } from "@/core/interfaces/repositories/IPayoutRepository";
import Payout from "@/models/payout.model";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { IPayout } from "@/types/payout/payout.entity";
import { PayoutListItem, PayoutStatsData } from "@/types/payout/payout.projection";
import { PayoutListQuery } from "@/types/payout/payout.query";

@injectable()
export class PayoutRepository extends BaseRepository<IPayout> implements IPayoutRepository {
  constructor() {
    super(Payout);
  }
  async findPayoutRequests(query: PayoutListQuery): Promise<CursorPaginatedResult<PayoutListItem>> {
    const { limit, cursor, workerId, status, search, fromDate, toDate } = query;
    const filter: FilterQuery<IPayout> = {};
    const andConditions: FilterQuery<IPayout>[] = [];

    if (workerId) {
      filter.workerId = new Types.ObjectId(workerId);
    }
    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.referenceId = {
        $regex: search,
        $options: "i",
      };
    }

    if (fromDate || toDate) {
      filter.createdAt = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    if (cursor) {
      andConditions.push({
        $or: [
          { createdAt: { $lt: cursor.createdAt } },
          {
            createdAt: cursor.createdAt,
            _id: { $lt: new Types.ObjectId(cursor._id) },
          },
        ],
      });
    }
    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const docs = await this.model
      .find(filter)
      .populate("workerId", "displayName phone profileImage")
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean<PayoutListItem[]>();

    let nextCursor: string | null = null;

    if (docs.length > limit) {
      docs.pop();
      const last = docs[docs.length - 1];

      nextCursor = Buffer.from(
        JSON.stringify({
          createdAt: last.createdAt.toISOString(),
          _id: last._id.toString(),
        })
      ).toString("base64url");
    }
    return {
      data: docs,
      nextCursor,
    };
  }
  async getPayoutStats(): Promise<PayoutStatsData> {
    const [stats] = await this.model.aggregate<PayoutStatsData>([
      {
        $group: {
          _id: null,

          totalCount: { $sum: 1 },
          totalAmount: { $sum: "$amount" },

          pendingCount: {
            $sum: {
              $cond: [{ $eq: ["$status", PAYOUT_REQUEST_STATUS.PENDING] }, 1, 0],
            },
          },

          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", PAYOUT_REQUEST_STATUS.PENDING] }, "$amount", 0],
            },
          },

          pendingWorkers: {
            $addToSet: {
              $cond: [{ $eq: ["$status", PAYOUT_REQUEST_STATUS.PENDING] }, "$workerId", null],
            },
          },

          pendingOldestAt: {
            $min: {
              $cond: [{ $eq: ["$status", PAYOUT_REQUEST_STATUS.PENDING] }, "$createdAt", null],
            },
          },

          approvedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", PAYOUT_REQUEST_STATUS.APPROVED] }, 1, 0],
            },
          },

          approvedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", PAYOUT_REQUEST_STATUS.APPROVED] }, "$amount", 0],
            },
          },

          rejectedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", PAYOUT_REQUEST_STATUS.REJECTED] }, 1, 0],
            },
          },

          rejectedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", PAYOUT_REQUEST_STATUS.REJECTED] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,

          total: {
            count: "$totalCount",
            totalAmount: "$totalAmount",
          },

          pending: {
            count: "$pendingCount",
            totalAmount: "$pendingAmount",
            uniqueWorkers: {
              $size: {
                $filter: {
                  input: "$pendingWorkers",
                  as: "worker",
                  cond: { $ne: ["$$worker", null] },
                },
              },
            },
            oldestAt: "$pendingOldestAt",
          },

          approved: {
            count: "$approvedCount",
            totalAmount: "$approvedAmount",
          },

          rejected: {
            count: "$rejectedCount",
            totalAmount: "$rejectedAmount",
          },
        },
      },
    ]);

    return (
      stats ?? {
        total: {
          count: 0,
          totalAmount: 0,
        },
        pending: {
          count: 0,
          totalAmount: 0,
          uniqueWorkers: 0,
          oldestAt: null,
        },
        approved: {
          count: 0,
          totalAmount: 0,
        },
        rejected: {
          count: 0,
          totalAmount: 0,
        },
      }
    );
  }
}
