import { Role, ROLE } from "@/constants";
import { type MessageType, type SenderRole } from "@/constants/chat";
import { IStorageService } from "@/core/interfaces/services/IStorageService";
import { IChatMessage } from "@/types/chat/chatMessage.entity";
import { resolveStorageUrl } from "@/utils/storage.utils";

type MessageStatus = "pending" | "sent" | "delivered" | "read";

export class ChatMessageResponseDTO {
  id!: string;
  chatId!: string;
  type!: MessageType;
  role!: Role;
  content?: string;
  mediaUrl?: string;
  bookingId?: string;

  replyTo?: {
    messageId: string;
    content?: string;
    type: MessageType;
    role: SenderRole;
  };

  isEdited!: boolean;
  status!: MessageStatus;
  readByRoles!: SenderRole[];
  isDeleted!: boolean;
  createdAt!: Date;

  static async fromEntity(
    entity: IChatMessage,
    storageService: IStorageService,
    role: SenderRole
  ): Promise<ChatMessageResponseDTO> {
    const dto = new ChatMessageResponseDTO();

    const isHideDeleted = role !== ROLE.ADMIN && entity.isDeleted;

    dto.id = entity._id.toString();
    dto.chatId = entity.chatId.toString();
    dto.type = entity.type;
    dto.role = entity.role;

    dto.content = isHideDeleted ? undefined : entity.content;
    dto.mediaUrl = isHideDeleted
      ? undefined
      : await resolveStorageUrl(entity.mediaUrl, storageService);
    dto.bookingId = entity.bookingId?.toString();
    dto.replyTo =
      entity.replyTo && entity.replyTo?.messageId
        ? {
            ...entity.replyTo,
            messageId: entity.replyTo.messageId.toString(),
          }
        : undefined;
    dto.readByRoles = isHideDeleted ? [] : entity.readByRoles;
    dto.status = getMessageStatus(entity);

    dto.isEdited = entity.isEdited;
    dto.isDeleted = entity.isDeleted;
    dto.createdAt = entity.createdAt;
    return dto;
  }
  static async fromEntities(
    entities: IChatMessage[],
    storageService: IStorageService,
    role: SenderRole
  ): Promise<ChatMessageResponseDTO[]> {
    return await Promise.all(
      entities.map((entity) => this.fromEntity(entity, storageService, role))
    );
  }
}

function getTargetRoles(role: Role): SenderRole[] {
  switch (role) {
    case ROLE.USER:
      return [ROLE.WORKER];

    case ROLE.WORKER:
      return [ROLE.USER];

    case ROLE.ADMIN:
    case ROLE.SYSTEM:
      return [ROLE.USER, ROLE.WORKER];
    default:
      return [];
  }
}

function getMessageStatus(entity: IChatMessage): MessageStatus {
  if (entity._id.toString().startsWith("temp-")) return "pending";

  const targetRoles = getTargetRoles(entity.role);
  const readSet = new Set(entity.readByRoles);
  const deliveredSet = new Set(entity.deliveredToRoles);

  if (targetRoles.some((role) => readSet.has(role))) {
    return "read";
  }

  if (targetRoles.some((role) => deliveredSet.has(role))) {
    return "delivered";
  }
  return "sent";
}
