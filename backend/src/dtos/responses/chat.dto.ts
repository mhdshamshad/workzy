import { MessageType, SenderRole } from "@/constants";
import { IStorageService } from "@/core/interfaces/services/IStorageService";
import { ChatListItem } from "@/types/chat/chat.projection";
import { resolveStorageUrl } from "@/utils/storage.utils";

export interface ChatRoomListItem {
  chat: ChatListItem;
  unread?: number;
}

export class ChatResponseDTO {
  id!: string;
  chatId!: string;
  participants!: {
    user: {
      id: string;
      name: string;
      profileImage?: string;
      lastSeen?: string | null;
    };
    worker: {
      id: string;
      name: string;
      profileImage?: string;
      lastSeen?: string | null;
    };
  };
  isBlocked!: boolean;
  blockedBy?: SenderRole;
  unread?: number;
  lastMessage?: {
    messageId: string;
    type: MessageType;
    role: SenderRole;
    content?: string;
    createdAt: Date;
    isDeleted: boolean;
  };
  static async fromEntity(
    { chat, unread }: ChatRoomListItem,
    storageService: IStorageService,
    presence?: { userLastSeen?: string | null; workerLastSeen?: string | null }
  ): Promise<ChatResponseDTO> {
    const dto = new ChatResponseDTO();
    const { lastMessage } = chat;

    dto.id = chat._id.toString();
    dto.chatId = chat.chatId;
    dto.participants = {
      user: {
        id: chat.userId._id.toString(),
        name: chat.userId.name,
        profileImage: await resolveStorageUrl(chat.userId.profileImage, storageService),
        ...(presence?.userLastSeen !== undefined ? { lastSeen: presence.userLastSeen } : {}),
      },
      worker: {
        id: chat.workerId._id.toString(),
        name: chat.workerId.displayName,
        profileImage: chat.workerId.profileImage,
        ...(presence?.workerLastSeen !== undefined ? { lastSeen: presence.workerLastSeen } : {}),
      },
    };
    dto.isBlocked = chat.isBlocked;
    dto.blockedBy = chat.blockedBy;
    dto.unread = unread;
    dto.lastMessage = lastMessage
      ? {
          ...lastMessage,
          messageId: lastMessage.messageId.toString(),
          content: lastMessage.isDeleted ? undefined : lastMessage.content,
        }
      : undefined;
    return dto;
  }

  static async fromEntities(
    entities: ChatRoomListItem[],
    storageService: IStorageService
  ): Promise<ChatResponseDTO[]> {
    return await Promise.all(entities.map((entity) => this.fromEntity(entity, storageService)));
  }
}
