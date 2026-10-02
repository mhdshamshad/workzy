import { injectable } from "inversify";
import { FilterQuery, Types } from "mongoose";

import { BaseRepository } from "@/core/abstracts/base.repository";
import { IWalletTransactionRepository } from "@/core/interfaces/repositories/IWalletTransactionRepository";
import WalletTransaction from "@/models/wallet-transaction.model";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { IWalletTransaction } from "@/types/wallet/wallet-transaction.entity";
import { WalletTransactionListQuery } from "@/types/wallet/wallet.query";

@injectable()
export class WalletTransactionRepository
  extends BaseRepository<IWalletTransaction>
  implements IWalletTransactionRepository
{
  constructor() {
    super(WalletTransaction);
  }
  async listByWorkerId(
    workerId: string,
    params: WalletTransactionListQuery
  ): Promise<CursorPaginatedResult<IWalletTransaction>> {
    const { limit, cursor, search, type, category, fromDate, toDate } = params;
    const filter: FilterQuery<IWalletTransaction> = { workerId: new Types.ObjectId(workerId) };
    const andConditions: FilterQuery<IWalletTransaction>[] = [];

    if (type && type !== "all") {
      filter.type = type;
    }

    if (category && category !== "all") {
      filter.category = category;
    }
    if (fromDate || toDate) {
      filter.createdAt = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }
    if (search) {
      andConditions.push({
        $or: [
          { transactionId: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      });
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
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean<IWalletTransaction[]>();

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
}
