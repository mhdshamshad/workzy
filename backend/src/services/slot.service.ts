import dayjs from "dayjs";
import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import {
  CATEGORY,
  HTTPSTATUS,
  PRICING_MODE,
  Role,
  ROLE,
  SERVICE,
  SERVICE_TYPE,
  SLOT,
  WORKER,
} from "@/constants";
import { SLOT_STATUS } from "@/constants/booking";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { ICategoryRepository } from "@/core/interfaces/repositories/ICategoryRepository";
import { ILeaveRepository } from "@/core/interfaces/repositories/ILeaveRepository";
import { IServiceRepository } from "@/core/interfaces/repositories/IServiceRepository";
import { ISlotRepository } from "@/core/interfaces/repositories/ISlotRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { ISlotService } from "@/core/interfaces/services/ISlotService";
import { TYPES } from "@/di/types";
import { CreateQuoteSlotsDTO, CreateSlotDTO, RescheduleSlotDto } from "@/dtos/requests/slot.dto";
import { SlotOptionResponseDto } from "@/dtos/responses/slot.dto";
import { IBookingSlot } from "@/types/booking/booking.entity";
import { ICategory } from "@/types/category";
import { IService } from "@/types/service/service.entity";
import {
  AvailableSlot,
  GetAvailableDatesDTO,
  GetQuoteAvailableDatesDTO,
  GetSlotsDTO,
  ISlot,
} from "@/types/slot";
import { Day, IWorker } from "@/types/worker/worker.entity";
import CustomError from "@/utils/customError";
import { calculateDistanceKm } from "@/utils/geo";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";
import { minutesToTime, timeToMinutes } from "@/utils/time.convert";

const RESERVATION_TTL_SECONDS = 15 * 60;
const QUOTE_TTL_SECONDS = 48 * 60 * 60;

@injectable()
export class SlotService implements ISlotService {
  constructor(
    @inject(TYPES.SlotRepository) private _slotRepository: ISlotRepository,
    @inject(TYPES.ServiceRepository) private _serviceRepository: IServiceRepository,
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository,
    @inject(TYPES.CategoryRepository) private _categoryRepository: ICategoryRepository,
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.LeaveRepository) private _leaveRepository: ILeaveRepository,
    @inject(TYPES.RedisService) private _redisService: IRedisService
  ) {}

  async getAvailableDates(dto: GetAvailableDatesDTO): Promise<Record<string, boolean>> {
    const { workerId, serviceId, lat, lng, itemCount = 1 } = dto;

    const today = dayjs().startOf("day");

    const start = dto.startDate ? dayjs(dto.startDate).startOf("day") : today;

    if (start.isBefore(today)) {
      throw new CustomError("Cannot query past dates");
    }
    const end = dto.endDate ? dayjs(dto.endDate).startOf("day") : start.add(30, "day");

    if (end.isBefore(start)) {
      throw new CustomError("endDate cannot be before startDate");
    }

    const totalDays = end.diff(start, "day");

    if (totalDays > 45) {
      throw new CustomError("Date range too large");
    }

    const [{ worker, service, category }, allOccupied, leaves] = await Promise.all([
      this.getSlotContext(workerId, serviceId),
      this._slotRepository.getOccupiedSlots(workerId, start.toDate(), end.toDate()),
      this._leaveRepository.getActiveLeaves(workerId, start.toDate(), end.toDate()),
    ]);

    const duration = this.resolveDuration(service, category, itemCount);
    const allowSudden = service.allowSuddenBooking ?? false;
    const userLocation = { lat, lng };
    const workerLocation = {
      lat: worker.location.coordinates[1],
      lng: worker.location.coordinates[0],
    };
    const earliest = this.getEarliestBookableDate(allowSudden);

    const occupiedByDate = new Map<string, typeof allOccupied>();
    for (const s of allOccupied) {
      const key = dayjs(s.date).format("YYYY-MM-DD");
      if (!occupiedByDate.has(key)) occupiedByDate.set(key, []);
      occupiedByDate.get(key)!.push(s);
    }

    const leaveRanges = leaves.map((l) => ({
      start: dayjs(l.startDate).startOf("day"),
      end: dayjs(l.endDate).startOf("day"),
    }));

    const result: Record<string, boolean> = {};

    for (let i = 0; i <= totalDays; i++) {
      const current = start.add(i, "day");
      const dateStr = current.format("YYYY-MM-DD");

      if (current.isBefore(earliest, "day")) {
        result[dateStr] = false;
        continue;
      }
      const isOnLeave = leaveRanges.some(
        (l) => !current.isBefore(l.start, "day") && !current.isAfter(l.end, "day")
      );
      if (isOnLeave) {
        result[dateStr] = false;
        continue;
      }

      const dayName = current.format("dddd").toLowerCase() as Day;
      const dayWindows = worker.availability[dayName];
      if (!dayWindows || dayWindows.length === 0) {
        result[dateStr] = false;
        continue;
      }

      const dayOccupied = occupiedByDate.get(dateStr) ?? [];
      const hasFullDay = dayOccupied.some((s) => s.isFullDay);
      if (hasFullDay) {
        result[dateStr] = false;
        continue;
      }
      const isToday = current.isSame(dayjs(), "day");
      const bookedSlots = this.mapOccupied(dayOccupied);

      let hasSlot = false;
      for (const win of dayWindows) {
        const slots = this.generateAvailableSlots({
          availability: { start: win.startTime, end: win.endTime },
          bookedSlots,
          duration,
          userLocation,
          workerLocation,
          isToday,
        });
        if (slots.length > 0) {
          hasSlot = true;
          break;
        }
      }
      result[dateStr] = hasSlot;
    }
    return result;
  }

  async getAvailableDatesForQuotes(
    dto: GetQuoteAvailableDatesDTO
  ): Promise<Record<string, boolean>> {
    const { serviceId, workerId, endDate, startDate } = dto;
    const today = dayjs().startOf("day");
    const start = startDate ? dayjs(startDate).startOf("day") : today;
    if (start.isBefore(today)) {
      throw new CustomError("Cannot query past dates");
    }
    const end = endDate ? dayjs(endDate).startOf("day") : start.add(30, "day");
    if (end.isBefore(start)) {
      throw new CustomError("endDate cannot be before startDate");
    }
    const totalDays = end.diff(start, "day");
    if (totalDays > 60) {
      throw new CustomError("Date range too large");
    }
    const [{ worker }, allOccupied, leaves] = await Promise.all([
      this.getSlotContext(workerId, serviceId),
      this._slotRepository.getOccupiedSlots(workerId, start.toDate(), end.toDate()),
      this._leaveRepository.getActiveLeaves(workerId, start.toDate(), end.toDate()),
    ]);

    const occupiedByDate = new Map<string, typeof allOccupied>();
    for (const s of allOccupied) {
      const key = dayjs(s.date).format("YYYY-MM-DD");
      if (!occupiedByDate.has(key)) occupiedByDate.set(key, []);
      occupiedByDate.get(key)!.push(s);
    }
    const leaveRanges = leaves.map((l) => ({
      start: dayjs(l.startDate).startOf("day"),
      end: dayjs(l.endDate).startOf("day"),
    }));
    const result: Record<string, boolean> = {};
    const REQUIRED_MINUTES = 8 * 60;
    for (let i = 0; i <= totalDays; i++) {
      const current = start.add(i, "day");
      const dateStr = current.format("YYYY-MM-DD");
      const isOnLeave = leaveRanges.some(
        (l) => !current.isBefore(l.start, "day") && !current.isAfter(l.end, "day")
      );
      if (isOnLeave) {
        result[dateStr] = false;
        continue;
      }
      const dayOccupied = occupiedByDate.get(dateStr) ?? [];
      if (dayOccupied.length > 0) {
        result[dateStr] = false;
        continue;
      }
      const dayName = current.format("dddd").toLowerCase() as Day;
      const dayWindows = worker.availability[dayName];
      if (!dayWindows || dayWindows.length === 0) {
        result[dateStr] = false;
        continue;
      }
      let totalMinutes = 0;
      for (const win of dayWindows) {
        const startMin = timeToMinutes(win.startTime);
        const endMin = timeToMinutes(win.endTime);
        totalMinutes += endMin - startMin;
      }
      if (totalMinutes < REQUIRED_MINUTES) {
        result[dateStr] = false;
        continue;
      }
      result[dateStr] = true;
    }

    return result;
  }

  async getAvailableSlots(dto: GetSlotsDTO): Promise<AvailableSlot[]> {
    const { date, serviceId, workerId, lat, lng, itemCount = 1 } = dto;
    const [{ category, service, worker }, leaves] = await Promise.all([
      this.getSlotContext(workerId, serviceId),
      this._leaveRepository.getActiveLeaves(workerId, date, date),
    ]);
    if (leaves.length > 0) return [];

    const dayName = dayjs(date).format("dddd").toLowerCase() as Day;
    const dayWindows = worker.availability[dayName];
    if (!dayWindows || dayWindows.length === 0) return [];

    const duration = this.resolveDuration(service, category, itemCount);
    const userLocation = { lat, lng };
    const workerLocation = {
      lat: worker.location.coordinates[1],
      lng: worker.location.coordinates[0],
    };
    const isToday = dayjs(date).isSame(dayjs(), "day");

    const occupiedSlots = await this._slotRepository.getOccupiedSlots(
      workerId,
      dayjs(date).startOf("day").toDate(),
      dayjs(date).endOf("day").toDate()
    );
    if (occupiedSlots.some((s) => s.isFullDay)) return [];
    const bookedSlots = this.mapOccupied(occupiedSlots);

    const allSlots: AvailableSlot[] = [];
    for (const win of dayWindows) {
      const slots = this.generateAvailableSlots({
        availability: { start: win.startTime, end: win.endTime },
        bookedSlots,
        duration,
        userLocation,
        workerLocation,
        isToday,
      });
      allSlots.push(...slots);
    }
    return allSlots;
  }

  async reserveSlot(
    userId: string,
    data: CreateSlotDTO
  ): Promise<{ slotId: string; reservedUntil: Date }> {
    const { workerId, serviceId, date, startTime, lat, lng, itemCount = 1 } = data;

    const lockKey = `slot:${workerId}:${dayjs(date).format("YYYY-MM-DD")}:${startTime}`;
    const existing = await this._redisService.get(lockKey);
    if (existing) {
      console.error(SLOT.EXISTS);
      // throw new CustomError(SLOT.EXISTS, HTTPSTATUS.CONFLICT);
    }

    const [{ service, category }, availableSlots] = await Promise.all([
      this.getSlotContext(workerId, serviceId),
      this.getAvailableSlots({
        workerId,
        serviceId,
        date,
        lat,
        lng,
        itemCount,
      }),
    ]);
    const duration = this.resolveDuration(service, category, itemCount);

    const slot = availableSlots.find((s) => s.startTime === startTime);
    if (!slot) throw new CustomError(SLOT.NOT_AVAILABLE, HTTPSTATUS.CONFLICT);

    const reservedUntil = new Date(Date.now() + RESERVATION_TTL_SECONDS * 1000);

    const newSlot = await this._slotRepository.create({
      workerId: new Types.ObjectId(workerId),
      serviceId: new Types.ObjectId(serviceId),
      date,
      startTime,
      endTime: slot.endTime,
      isFullDay: false,
      duration,
      status: SLOT_STATUS.RESERVED,
      location: { type: "Point", coordinates: [lng, lat] },
      travelFromPrev: slot.travelFromPrev,
      reservedBy: new Types.ObjectId(userId),
      reservedUntil,
    });
    await this._redisService.set(lockKey, workerId, 60);
    return {
      slotId: newSlot._id.toString(),
      reservedUntil,
    };
  }

  async reserveQuoteSlots(
    workerId: string,
    data: CreateQuoteSlotsDTO
  ): Promise<{ slotIds: string[]; reservedUntil: Date; dates: IBookingSlot[] }> {
    const { serviceId, dates, lat, lng, bookingId } = data;

    const { worker } = await this.getSlotContext(workerId, serviceId);
    const reservedUntil = new Date(Date.now() + QUOTE_TTL_SECONDS * 1000);

    const createdIds: string[] = [];
    const acquiredLocks: string[] = [];
    const createdSlots: IBookingSlot[] = [];

    try {
      for (const date of dates) {
        const dateStr = dayjs(date).format("YYYY-MM-DD");
        const lockKey = `slot:${workerId}:${dateStr}:fullday`;

        const lockAcquired = await this._redisService.setIfNotExists(lockKey, workerId, 60);
        if (!lockAcquired) {
          throw new CustomError(SLOT.EXISTS, HTTPSTATUS.CONFLICT);
        }
        acquiredLocks.push(lockKey);

        const dayName = dayjs(date).format("dddd").toLowerCase() as Day;
        const dayWindows = worker.availability[dayName];
        if (!dayWindows || dayWindows.length === 0) {
          throw new CustomError(SLOT.NOT_AVAILABLE, HTTPSTATUS.BAD_REQUEST);
        }
      }
      const slotPromises = dates.map(async (date) => {
        const dayName = dayjs(date).format("dddd").toLowerCase() as Day;
        const dayWindows = worker.availability[dayName]!;

        const startTime = dayWindows[0].startTime;
        const endTime = dayWindows[dayWindows.length - 1].endTime;

        const newSlot = await this._slotRepository.create({
          workerId: new Types.ObjectId(workerId),
          serviceId: new Types.ObjectId(serviceId),
          date,
          startTime,
          endTime,
          isFullDay: true,
          duration: 0,
          status: SLOT_STATUS.RESERVED,
          location: { type: "Point", coordinates: [lng, lat] },
          reservedBy: new Types.ObjectId(workerId),
          bookingId: new Types.ObjectId(bookingId),
          travelFromPrev: 0,
          reservedUntil,
        });

        return newSlot;
      });

      const results = await Promise.all(slotPromises);
      results.forEach((slot) => {
        createdIds.push(slot._id.toString());
        createdSlots.push({
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      });
    } catch (err) {
      if (createdIds.length > 0) {
        await this._slotRepository.deleteManyByIds(createdIds);
      }
      if (acquiredLocks.length > 0) {
        await this._redisService.deleteMany(acquiredLocks);
      }
      throw err;
    }
    return {
      slotIds: createdIds,
      reservedUntil,
      dates: createdSlots,
    };
  }

  async releaseQuoteSlots(slotIds: string[]): Promise<boolean> {
    try {
      const slots = await this._slotRepository.findManyByIds(slotIds);
      await this._slotRepository.deleteManyByIds(slotIds);
      const lockKeys = slots.map(
        (s) => `slot:${s.workerId}:${dayjs(s.date).format("YYYY-MM-DD")}:fullday`
      );
      await this._redisService.deleteMany(lockKeys);
      return true;
    } catch (err) {
      console.error("Failed to release quote slots:", err);
      return false;
    }
  }

  async releaseSlot(slotId: string, userId: string): Promise<boolean> {
    const slot = await this._slotRepository.findOneAndDelete({
      _id: new Types.ObjectId(slotId),
      reservedBy: new Types.ObjectId(userId),
      status: SLOT_STATUS.RESERVED,
    });
    if (!slot) return true;
    const lockKey = `slot:${slot.workerId}:${dayjs(slot.date).format("YYYY-MM-DD")}:${slot.startTime}`;
    await this._redisService.delete(lockKey);
    return true;
  }

  async cleanupExpired(): Promise<number> {
    return await this._slotRepository.cleanupExpiredReservations();
  }

  private async getSlotContext(
    workerId: string,
    serviceId: string
  ): Promise<{ service: IService; worker: IWorker; category: ICategory }> {
    const [service, worker] = await Promise.all([
      this._serviceRepository.findById(serviceId),
      this._workerRepository.findById(workerId),
    ]);
    if (!service) {
      throw new CustomError(SERVICE.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    if (!worker) {
      throw new CustomError(WORKER.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    const category = await this._categoryRepository.findById(service.categoryId.toString());
    if (!category) {
      throw new CustomError(CATEGORY.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    return { service, worker, category };
  }

  private generateAvailableSlots(input: {
    availability: { start: string; end: string };
    bookedSlots: {
      startTime: string;
      endTime: string;
      location: { lat: number; lng: number };
    }[];
    duration: number;
    workerLocation: { lat: number; lng: number };
    userLocation: { lat: number; lng: number };
    isToday: boolean;
  }): AvailableSlot[] {
    const { availability, bookedSlots, duration, userLocation, workerLocation, isToday } = input;

    const INCREMENT = 30;
    const PREP_BUFFER = 15;
    const dayStart = timeToMinutes(availability.start);
    const dayEnd = timeToMinutes(availability.end);

    const jobs = [...bookedSlots].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    type Window = {
      windowStart: number;
      windowEnd: number;
      prevLoc: { lat: number; lng: number } | null;
      nextLoc: { lat: number; lng: number } | null;
    };

    const windows: Window[] = [];

    windows.push({
      windowStart: dayStart,
      windowEnd: jobs.length > 0 ? timeToMinutes(jobs[0].startTime) : dayEnd,
      prevLoc: isToday ? workerLocation : null,
      nextLoc: jobs.length > 0 ? jobs[0].location : null,
    });

    for (let i = 0; i < jobs.length - 1; i++) {
      windows.push({
        windowStart: timeToMinutes(jobs[i].endTime),
        windowEnd: timeToMinutes(jobs[i + 1].startTime),
        prevLoc: jobs[i].location,
        nextLoc: jobs[i + 1].location,
      });
    }

    if (jobs.length > 0) {
      windows.push({
        windowStart: timeToMinutes(jobs[jobs.length - 1].endTime),
        windowEnd: dayEnd,
        prevLoc: jobs[jobs.length - 1].location,
        nextLoc: null,
      });
    }

    const result: AvailableSlot[] = [];

    for (const win of windows) {
      let tIn = this.travelMin(win.prevLoc, userLocation);
      if (isToday) {
        const travelFromWorkerNow = this.travelMin(workerLocation, userLocation);
        tIn = Math.max(tIn, travelFromWorkerNow);
      }
      const tOut = this.travelMin(userLocation, win.nextLoc);
      const earliest = win.windowStart + tIn;
      const latest = win.windowEnd - duration - tOut;

      const effectiveEarliest = isToday
        ? Math.max(win.windowStart, timeToMinutes(dayjs().format("HH:mm")) + PREP_BUFFER + tIn)
        : earliest;
      let cursor = Math.ceil(effectiveEarliest / INCREMENT) * INCREMENT;

      while (cursor <= latest) {
        result.push({
          startTime: minutesToTime(cursor),
          endTime: minutesToTime(cursor + duration),
          travelFromPrev: tIn,
        });
        cursor += INCREMENT;
      }
    }
    return result;
  }

  private getEarliestBookableDate(allowSuddenBooking: boolean): dayjs.Dayjs {
    const now = dayjs();
    if (allowSuddenBooking) return now.startOf("day");

    const daysToAdd = now.hour() >= 17 ? 2 : 1;
    return now.add(daysToAdd, "day").startOf("day");
  }

  private travelMin(
    from: { lat: number; lng: number } | null,
    to: { lat: number; lng: number } | null
  ): number {
    if (!from || !to) return 0;
    const km = calculateDistanceKm(from, to);
    const raw = km * 3;
    return Math.ceil(raw / 10) * 10;
  }

  private resolveDuration(service: IService, category: ICategory, itemCount: number): number {
    const base = service.estimatedDuration;
    const duration = category.pricingMode === PRICING_MODE.PER_UNIT ? base * itemCount : base;
    return duration + service.bufferTime;
  }

  private mapOccupied(
    occupied: ISlot[]
  ): { startTime: string; endTime: string; location: { lat: number; lng: number } }[] {
    return occupied.map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
      location: {
        lat: s.location.coordinates[1],
        lng: s.location.coordinates[0],
      },
    }));
  }

  async getRescheduleDates(
    bookingId: string
  ): Promise<{ dates: Record<string, boolean>; isFullDay: boolean }> {
    const booking = await getEntityOrThrow(this._bookingRepository, bookingId);
    const { serviceId, workerId, address, itemCount, snapshot } = booking;
    const isFullDay = snapshot.category.serviceType === SERVICE_TYPE.MAJOR_PROJECT;
    let result: Record<string, boolean> = {};
    if (isFullDay) {
      result = await this.getAvailableDatesForQuotes({
        serviceId: serviceId.toString(),
        workerId: workerId.toString(),
        itemCount: itemCount,
      });
    } else {
      result = await this.getAvailableDates({
        serviceId: serviceId.toString(),
        workerId: workerId.toString(),
        itemCount: itemCount,
        lat: address.location.coordinates[1],
        lng: address.location.coordinates[0],
      });
    }
    return { dates: result, isFullDay };
  }

  async getRescheduleSlots(bookingId: string, date: Date): Promise<AvailableSlot[]> {
    const booking = await getEntityOrThrow(this._bookingRepository, bookingId);
    const { serviceId, workerId, address, itemCount } = booking;
    return await this.getAvailableSlots({
      serviceId: serviceId.toString(),
      workerId: workerId.toString(),
      itemCount: itemCount,
      lat: address.location.coordinates[1],
      lng: address.location.coordinates[0],
      date,
    });
  }

  async getRescheduleSlotOptions(bookingId: string): Promise<SlotOptionResponseDto[]> {
    const slots = await this._slotRepository.getRescheduleSlotOptions(bookingId);
    return SlotOptionResponseDto.fromEntities(slots);
  }

  async reserveRescheduleSlot({
    bookingId,
    data,
    initiatorId,
  }: {
    bookingId: string;
    initiatorId: string;
    data: RescheduleSlotDto;
  }): Promise<{ slotId: string; reservedUntil: Date }> {
    const { date, isFullDay, requestedBy, startTime } = data;
    const booking = await getEntityOrThrow(this._bookingRepository, bookingId);
    const { serviceId, workerId, userId, address, itemCount, dates } = booking;

    if ((!isFullDay && !startTime) || (dates.length > 1 && !isFullDay)) {
      throw new CustomError(SLOT.RESCHEDULE_INVALID_PARAMS, HTTPSTATUS.BAD_REQUEST);
    }
    if (
      (requestedBy === ROLE.WORKER && initiatorId !== workerId.toString()) ||
      (requestedBy === ROLE.USER && initiatorId !== userId.toString())
    ) {
      throw new CustomError(SLOT.RESCHEDULE_UNAUTHORIZED, HTTPSTATUS.FORBIDDEN);
    }
    let slotId: string;
    let reservedUntil: Date;

    if (isFullDay) {
      const res = await this.reserveQuoteSlots(workerId.toString(), {
        bookingId,
        dates: [date],
        lat: address.location.coordinates[1],
        lng: address.location.coordinates[0],
        serviceId: serviceId.toString(),
      });
      reservedUntil = res.reservedUntil;
      slotId = res.slotIds[0];
    } else {
      if (!startTime) {
        throw new CustomError("");
      }
      const res = await this.reserveSlot(initiatorId, {
        date,
        startTime,
        workerId: workerId.toString(),
        itemCount,
        lat: address.location.coordinates[1],
        lng: address.location.coordinates[0],
        serviceId: serviceId.toString(),
      });
      slotId = res.slotId;
      reservedUntil = res.reservedUntil;
    }
    return {
      slotId,
      reservedUntil,
    };
  }

  async releaseRescheduleSlot(slotId: string, initiatorId: string, role: Role): Promise<void> {
    if (role === ROLE.USER) {
      await this.releaseSlot(slotId, initiatorId);
    } else if (role === ROLE.WORKER) {
      await this.releaseQuoteSlots([slotId]);
    }
  }
}
