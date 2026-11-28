import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import { CHAT, HTTPSTATUS, ROLE, SenderRole } from "@/constants";
import { IChatRepository } from "@/core/interfaces/repositories/IChatRepository";
import { IMessageRepository } from "@/core/interfaces/repositories/IMessageRepository";
import { IChatService } from "@/core/interfaces/services/IChatService";
import { IPresenceService } from "@/core/interfaces/services/IPresenceService";
import { IStorageService } from "@/core/interfaces/services/IStorageService";
import { TYPES } from "@/di/types";
import { ChatResponseDTO, ChatRoomListItem } from "@/dtos/responses/chat.dto";
import { IChat } from "@/types/chat/chat.entity";
import { ChatQuery } from "@/types/chat/chat.query";
import { CursorPaginatedResult } from "@/types/common/pagination";
import CustomError from "@/utils/customError";

@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject(TYPES.ChatRepository) private _chatRepository: IChatRepository,
    @inject(TYPES.MessageRepository) private _messageRepository: IMessageRepository,
    @inject(TYPES.StorageService) private _storageService: IStorageService,
    @inject(TYPES.PresenceService) private _presenceService: IPresenceService
  ) {}

  async getOrCreateChat(data: {
    creatorId: string;
    creatorRole: SenderRole;
    participantId: string;
  }): Promise<ChatResponseDTO> {
    const { creatorId, creatorRole, participantId } = data;
    const userId = creatorRole === ROLE.USER ? creatorId : participantId;
    const workerId = creatorRole === ROLE.WORKER ? creatorId : participantId;

    const existing = await this._chatRepository.findByParticipants(userId, workerId);
    if (existing) {
      return await ChatResponseDTO.fromEntity({ chat: existing }, this._storageService);
    }
    const newChat = await this._chatRepository.create({
      userId: new Types.ObjectId(userId),
      workerId: new Types.ObjectId(workerId),
      isBlocked: false,
    });
    const populated = await this._chatRepository.findByChatId(newChat._id.toString());
    if (!populated) throw new CustomError(CHAT.NOT_FOUND);

    return await ChatResponseDTO.fromEntity({ chat: populated }, this._storageService);
  }

  async authorizeChat(data: {
    chatId: string;
    participantId: string;
    role: SenderRole;
  }): Promise<IChat> {
    const { chatId, participantId, role } = data;
    const chat = await this._chatRepository.findById(chatId);
    if (!chat) {
      throw new CustomError(CHAT.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    if (chat.isBlocked && role !== ROLE.ADMIN) {
      throw new CustomError(CHAT.BLOCKED, HTTPSTATUS.FORBIDDEN);
    }
    this.authorizeChatAccess({
      participantId,
      role,
      userId: chat.userId.toString(),
      workerId: chat.workerId.toString(),
    });
    return chat;
  }

  async toggleChatStatus(data: {
    chatId: string;
    participantId: string;
    role: SenderRole;
  }): Promise<IChat> {
    const { chatId, participantId, role } = data;
    const chat = await this._chatRepository.findById(chatId);
    if (!chat) {
      throw new CustomError(CHAT.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    this.authorizeChatAccess({
      participantId,
      role,
      workerId: chat.workerId.toString(),
      userId: chat.userId.toString(),
    });
    if (chat.isBlocked && chat.blockedBy !== role && role !== ROLE.ADMIN) {
      throw new CustomError(CHAT.CANNOT_UNBLOCK, HTTPSTATUS.FORBIDDEN);
    }
    const newStatus = !chat.isBlocked;
    const blockedBy = newStatus ? role : null;
    const updated = await this._chatRepository.findByIdAndUpdate(chatId, {
      isBlocked: newStatus,
      blockedBy,
    });
    if (!updated) {
      throw new CustomError(CHAT.NOT_FOUND);
    }
    return updated;
  }

  async getChatRoomById(data: {
    chatId: string;
    participantId: string;
    role: SenderRole;
  }): Promise<ChatResponseDTO> {
    const { chatId, participantId, role } = data;
    const chat = await this._chatRepository.findByChatId(chatId);
    if (!chat) {
      throw new CustomError(CHAT.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    this.authorizeChatAccess({
      participantId,
      role,
      userId: chat.userId._id.toString(),
      workerId: chat.workerId._id.toString(),
    });
    let presence: { userLastSeen?: string | null; workerLastSeen?: string | null } | undefined;
    if (role === ROLE.USER) {
      const workerLastSeen = await this._presenceService.getLastSeen(chat.workerId._id.toString());
      presence = { workerLastSeen };
    } else if (role === ROLE.WORKER) {
      const userLastSeen = await this._presenceService.getLastSeen(chat.userId._id.toString());
      presence = { userLastSeen };
    } else if (role === ROLE.ADMIN) {
      const [userLastSeen, workerLastSeen] = await Promise.all([
        this._presenceService.getLastSeen(chat.userId._id.toString()),
        this._presenceService.getLastSeen(chat.workerId._id.toString()),
      ]);
      presence = { userLastSeen, workerLastSeen };
    }

    return await ChatResponseDTO.fromEntity({ chat }, this._storageService, presence);
  }

  async getChatRooms(input: ChatQuery): Promise<CursorPaginatedResult<ChatResponseDTO>> {
    const { data, nextCursor } = await this._chatRepository.getChatRooms(input);

    if (data.length === 0) {
      return { data: [], nextCursor };
    }
    const chatIds = data.map((chat) => chat._id.toString());

    const unreadCounts = await this._messageRepository.getUnreadCounts(chatIds, input.role);
    const unreadCountMap = new Map(unreadCounts.map((item) => [item._id.toString(), item.count]));

    const chatRooms: ChatRoomListItem[] = data.map((chat) => ({
      chat,
      unread: unreadCountMap.get(chat._id.toString()) ?? 0,
    }));

    return {
      data: await ChatResponseDTO.fromEntities(chatRooms, this._storageService),
      nextCursor,
    };
  }

  private authorizeChatAccess(data: {
    userId: string;
    workerId: string;
    participantId: string;
    role: SenderRole;
  }): void {
    const { participantId, role, userId, workerId } = data;
    if (role === ROLE.ADMIN) {
      return;
    }
    if (
      (role === ROLE.WORKER && participantId !== workerId) ||
      (role === ROLE.USER && participantId !== userId)
    ) {
      throw new CustomError(CHAT.UNAUTHORIZED, HTTPSTATUS.FORBIDDEN);
    }
  }
}
