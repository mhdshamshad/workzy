import dayjs from "dayjs";
import { injectable } from "inversify";
import { FilterQuery, PipelineStage, Types } from "mongoose";

import {
  DOCUMENT_STATUS,
  DocumentType,
  SLOT_STATUS,
  STRIPE_ACCOUNT_STATUS,
  WORKER_STATUS,
  WorkerStatus,
} from "@/constants";
import { BaseRepository } from "@/core/abstracts/base.repository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import Worker from "@/models/worker.model";
import { CursorPaginatedResult, PaginatedResult } from "@/types/common/pagination";
import { IReviewStats, IWorker } from "@/types/worker/worker.entity";
import {
  NearbyWorkerItem,
  PublicWorkerListItem,
  WorkerListItem,
  WorkerProfile,
} from "@/types/worker/worker.projection";
import {
  NearbyWorkerListQuery,
  PublicWorkerListQuery,
  WorkerListQuery,
} from "@/types/worker/worker.query";
import { timeToMinutes } from "@/utils/time.convert";
import { getCurrentTime, getTodayKey, getTodayStart, getTodayEnd } from "@/utils/time.utils";

@injectable()
export class WorkerRepository extends BaseRepository<IWorker> implements IWorkerRepository {
  constructor() {
    super(Worker);
  }

  async getWorkerByUserId(userId: string): Promise<IWorker | null> {
    const worker = await this.model.findOne({ userId: new Types.ObjectId(userId) }).lean<IWorker>();
    if (!worker) return null;
    return worker;
  }

  async listWorkers(query: WorkerListQuery): Promise<PaginatedResult<WorkerListItem>> {
    const { page, limit, search, status, stripStatus } = query;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IWorker> = {};
    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ displayName: regex }];
    }
    if (status !== "all") {
      filter.status = status;
    }
    if (stripStatus !== "all") {
      filter.stripeAccountStatus = stripStatus;
    }
    const [workers, total] = await Promise.all([
      this.model
        .find(filter)
        .select(
          "displayName phone status stripeAccountStatus payoutStatus profileImage createdAt userId"
        )
        .populate<{ userId: { _id: Types.ObjectId; email: string } }>("userId", "email")
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(filter),
    ]);
    return { data: workers, total };
  }

  async listNearbyWorkers(query: NearbyWorkerListQuery): Promise<NearbyWorkerItem[]> {
    const { limit, radius, lat, lng } = query;
    const pipeline: PipelineStage[] = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          key: "location",
          distanceField: "distance", // in meters
          maxDistance: radius * 1000,
          spherical: true,
          query: {
            status: WORKER_STATUS.VERIFIED,
            stripeAccountStatus: STRIPE_ACCOUNT_STATUS.ACTIVE,
          },
        },
      },
      {
        $addFields: {
          distance: {
            $round: [{ $divide: ["$distance", 1000] }, 2],
          },
        },
      },
      { $sort: { distance: 1 } },
      { $limit: limit },
      {
        $project: {
          _id: { $toString: "$_id" },
          profileImage: 1,
          displayName: 1,
          tagline: 1,
          experience: 1,
          distance: 1,
          completedJobs: "$jobStats.completed",
          averageRating: "$reviewStats.averageRating",
        },
      },
    ];
    return await this.model.aggregate(pipeline);
  }

  async getWorkerProfile(workerId: string): Promise<WorkerProfile | null> {
    return await this.model
      .findById(workerId)
      .select(
        " displayName tagline about profileImage coverImage experience location availability jobStats reviewStats languages"
      )
      .lean()
      .exec();
  }

  async listPublicWorkers(
    serviceId: string,
    query: PublicWorkerListQuery
  ): Promise<CursorPaginatedResult<PublicWorkerListItem>> {
    const {
      lat,
      limit,
      lng,
      radiusKm,
      cursor,
      availableNow,
      maxPrice,
      minPrice,
      minRating,
      workerId,
    } = query;

    const nowMinutes = timeToMinutes(getCurrentTime());
    const PREP_BUFFER = 15;

    const pipeline: PipelineStage[] = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          key: "location",
          distanceField: "distance",
          maxDistance: radiusKm * 1000,
          spherical: true,
          query: {
            status: WORKER_STATUS.VERIFIED,
            // stripeAccountStatus: STRIPE_ACCOUNT_STATUS.ACTIVE,
            ...(minRating !== undefined && {
              "reviewStats.averageRating": { $gte: minRating },
            }),
            ...(workerId && { _id: { $ne: new Types.ObjectId(workerId) } }),
          },
        },
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
        },
      },
      ...(cursor
        ? [
            {
              $match: {
                $or: [
                  { distance: { $gt: cursor.distance } },
                  {
                    distance: cursor.distance,
                    _id: { $gt: new Types.ObjectId(cursor._id) },
                  },
                ],
              },
            },
          ]
        : []),
      {
        $lookup: {
          from: "services",
          let: { workerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$workerId", "$$workerId"] },
                    { $eq: ["$categoryId", new Types.ObjectId(serviceId)] },
                    { $eq: ["$isAvailable", true] },
                  ],
                },
              },
            },
          ],
          as: "services",
        },
      },
      { $match: { $expr: { $gt: [{ $size: "$services" }, 0] } } },
      { $unwind: "$services" },
      {
        $match: {
          $expr: {
            $gte: [{ $ifNull: ["$services.maxTravelRadius", 0] }, "$distanceKm"],
          },
        },
      },
      {
        $lookup: {
          from: "categories",
          let: { categoryId: "$services.categoryId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$categoryId"] },
                isAvailable: true,
              },
            },
          ],
          as: "category",
        },
      },
      { $match: { "category.0": { $exists: true } } },
      { $unwind: "$category" },
      {
        $match: {
          $expr: {
            $and: [
              {
                $gte: ["$services.rate", minPrice ?? { $divide: ["$category.baseRate", 2] }],
              },
              {
                $lte: ["$services.rate", maxPrice ?? { $multiply: ["$category.baseRate", 2] }],
              },
            ],
          },
        },
      },
      ...(availableNow
        ? [
            {
              $match: {
                $expr: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: { $ifNull: [`$availability.${getTodayKey()}`, []] },
                          as: "win",
                          cond: {
                            $and: [
                              { $lte: [this.toMinutes("$$win.startTime"), nowMinutes] },
                              {
                                $gte: [
                                  this.toMinutes("$$win.endTime"),
                                  {
                                    $add: [
                                      nowMinutes,
                                      { $multiply: ["$distanceKm", 3] },
                                      PREP_BUFFER,
                                      "$services.estimatedDuration",
                                      "$services.bufferTime",
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            } as PipelineStage,
            {
              $lookup: {
                from: "leaves",
                let: { wId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$workerId", "$$wId"] },
                          { $lte: ["$startDate", getTodayEnd()] },
                          { $gte: ["$endDate", getTodayStart()] },
                        ],
                      },
                    },
                  },
                  { $limit: 1 },
                ],
                as: "todayLeaves",
              },
            },
            { $match: { todayLeaves: { $size: 0 } } } as PipelineStage,
            {
              $lookup: {
                from: "slots",
                let: { wId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$workerId", "$$wId"] },
                          { $gte: ["$date", getTodayStart()] },
                          { $lte: ["$date", getTodayEnd()] },
                          { $eq: ["$isFullDay", true] },
                          { $in: ["$status", [SLOT_STATUS.RESERVED, SLOT_STATUS.BOOKED]] },
                        ],
                      },
                    },
                  },
                  { $limit: 1 },
                ],
                as: "fullDaySlots",
              },
            } as PipelineStage,
            { $match: { fullDaySlots: { $size: 0 } } } as PipelineStage,
            {
              $lookup: {
                from: "slots",
                let: { wId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$workerId", "$$wId"] },
                          { $gte: ["$date", getTodayStart()] },
                          { $lte: ["$date", getTodayEnd()] },
                          { $eq: ["$isFullDay", false] },
                          { $in: ["$status", [SLOT_STATUS.RESERVED, SLOT_STATUS.BOOKED]] },
                          { $lt: ["$startTime", getCurrentTime()] },
                          { $gt: ["$endTime", getCurrentTime()] },
                        ],
                      },
                    },
                  },
                  { $limit: 1 },
                ],
                as: "activeSlots",
              },
            } as PipelineStage,
            { $match: { activeSlots: { $size: 0 } } } as PipelineStage,
          ]
        : []),
      {
        $sort: { distance: 1, _id: 1 },
      },
      {
        $limit: limit + 1,
      },
      {
        $project: {
          _id: 1,
          displayName: 1,
          tagline: 1,
          profileImage: 1,
          experience: 1,

          serviceId: "$services._id",
          serviceRate: "$services.rate",
          description: "$services.description",
          estimatedDuration: "$services.estimatedDuration",
          bufferTime: "$services.bufferTime",
          categoryName: "$category.name",
          serviceType: "$category.serviceType",
          pricingMode: "$category.pricingMode",
          bulkDiscounts: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ["$services.bulkDiscounts", []] } }, 0] },
              "$services.bulkDiscounts",
              null,
            ],
          },
          averageRating: "$reviewStats.averageRating",
          jobCompleted: "$jobStats.completed",
          reviewCount: "$reviewStats.reviewCount",
          isAvailable: "$reviewStats.isAvailable",
          distanceKm: 1,
          travelCost: {
            $trunc: {
              $min: [
                { $multiply: ["$distanceKm", { $ifNull: ["$category.travelRatePerKM", 0] }] },
                { $ifNull: ["$services.maxTravelCost", 999999] },
              ],
            },
          },
        },
      },
    ];

    const docs = await this.model.aggregate(pipeline);
    let nextCursor: string | null = null;

    if (docs.length > limit) {
      docs.pop();
      const last = docs[docs.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          distance: last.distance,
          _id: last._id.toString(),
        })
      ).toString("base64url");
    }

    return {
      data: docs,
      nextCursor,
    };
  }

  private toMinutes = (timeField: string) => ({
    $add: [
      { $multiply: [{ $toInt: { $substr: [timeField, 0, 2] } }, 60] },
      { $toInt: { $substr: [timeField, 3, 2] } },
    ],
  });

  async incrementRating(workerId: string, rating: number): Promise<void> {
    const ratingKey = rating.toString();
    const pipeline: PipelineStage[] = [
      {
        $set: {
          "reviewStats.totalRating": { $add: ["$reviewStats.totalRating", rating] },
          "reviewStats.reviewCount": { $add: ["$reviewStats.reviewCount", 1] },
          "reviewStats.breakdown": {
            $setField: {
              field: ratingKey,
              input: "$reviewStats.breakdown",
              value: {
                $add: [
                  {
                    $ifNull: [
                      { $getField: { field: ratingKey, input: "$reviewStats.breakdown" } },
                      0,
                    ],
                  },
                  1,
                ],
              },
            },
          },
        },
      },
      {
        $set: {
          "reviewStats.averageRating": {
            $divide: ["$reviewStats.totalRating", "$reviewStats.reviewCount"],
          },
        },
      },
    ];
    await this.model.findByIdAndUpdate(workerId, pipeline);
  }

  async decrementRating(workerId: string, rating: number): Promise<void> {
    const ratingKey = rating.toString();
    const pipeline: PipelineStage[] = [
      {
        $set: {
          "reviewStats.totalRating": { $subtract: ["$reviewStats.totalRating", rating] },
          "reviewStats.reviewCount": { $subtract: ["$reviewStats.reviewCount", 1] },
          "reviewStats.breakdown": {
            $setField: {
              field: ratingKey,
              input: "$reviewStats.breakdown",
              value: {
                $max: [
                  {
                    $subtract: [
                      {
                        $ifNull: [
                          { $getField: { field: ratingKey, input: "$reviewStats.breakdown" } },
                          0,
                        ],
                      },
                      1,
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
      },
      {
        $set: {
          "reviewStats.averageRating": {
            $cond: {
              if: { $eq: ["$reviewStats.reviewCount", 0] },
              then: 0,
              else: {
                $divide: ["$reviewStats.totalRating", "$reviewStats.reviewCount"],
              },
            },
          },
        },
      },
    ];
    await this.model.findByIdAndUpdate(workerId, pipeline);
  }

  async adjustRating(workerId: string, oldRating: number, newRating: number): Promise<void> {
    const oldKey = oldRating.toString();
    const newKey = newRating.toString();

    const pipeline: PipelineStage[] = [
      {
        $set: {
          "reviewStats.totalRating": {
            $add: ["$reviewStats.totalRating", newRating - oldRating],
          },
          "reviewStats.breakdown": {
            $let: {
              vars: {
                updatedOld: {
                  $setField: {
                    field: oldKey,
                    input: "$reviewStats.breakdown",
                    value: {
                      $max: [
                        {
                          $subtract: [
                            {
                              $ifNull: [
                                {
                                  $getField: {
                                    field: oldKey,
                                    input: "$reviewStats.breakdown",
                                  },
                                },
                                0,
                              ],
                            },
                            1,
                          ],
                        },
                        0,
                      ],
                    },
                  },
                },
              },
              in: {
                $setField: {
                  field: newKey,
                  input: "$$updatedOld",
                  value: {
                    $add: [
                      {
                        $ifNull: [
                          {
                            $getField: {
                              field: newKey,
                              input: "$$updatedOld",
                            },
                          },
                          0,
                        ],
                      },
                      1,
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $set: {
          "reviewStats.averageRating": {
            $divide: ["$reviewStats.totalRating", "$reviewStats.reviewCount"],
          },
        },
      },
    ];
    await this.model.findByIdAndUpdate(workerId, pipeline);
  }

  async getWorkerReviewStats(workerId: string): Promise<IReviewStats | null> {
    const worker = await this.model
      .findById(workerId)
      .select("reviewStats")
      .lean<{ reviewStats: IReviewStats }>();

    return worker?.reviewStats ?? null;
  }

  async getWorkerGrowthAnalytics(): Promise<{ month: number; workers: number }[]> {
    const startOfYear = dayjs().startOf("year").toDate();
    const endOfYear = dayjs().endOf("year").toDate();
    return this.model.aggregate<{
      month: number;
      workers: number;
    }>([
      {
        $match: {
          createdAt: {
            $gte: startOfYear,
            $lte: endOfYear,
          },
        },
      },

      {
        $group: {
          _id: {
            $month: "$createdAt",
          },

          workers: {
            $sum: 1,
          },
        },
      },

      {
        $project: {
          month: "$_id",
          workers: 1,
        },
      },
    ]);
  }

  async updateWorkerStatus(
    workerId: string,
    status: WorkerStatus,
    reason: string
  ): Promise<Worker | null> {
    return await this.model.findByIdAndUpdate(
      workerId,
      {
        $set: {
          status,
          suspensionReason: reason,
        },
      },
      { new: true }
    );
  }
  async addWorkerDocument(
    workerId: string,
    type: DocumentType,
    url: string
  ): Promise<IWorker | null> {
    return this.model.findOneAndUpdate(
      { _id: new Types.ObjectId(workerId), "documents.type": { $ne: type } },
      { $push: { documents: { type, url } } },
      { new: true }
    );
  }

  async updateWorkerDocument(
    workerId: string,
    documentId: string,
    url: string
  ): Promise<IWorker | null> {
    return this.model.findOneAndUpdate(
      { _id: workerId, "documents._id": documentId },
      {
        $set: {
          "documents.$.url": url,
          "documents.$.status": DOCUMENT_STATUS.PENDING,
          "documents.$.uploadedAt": new Date(),
        },
        $unset: {
          "documents.$.rejectReason": "",
          "documents.$.verifiedAt": "",
        },
      },
      { new: false }
    );
  }
}
