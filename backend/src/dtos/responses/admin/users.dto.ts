import { Role } from "@/constants";
import { IStorageService } from "@/core/interfaces/services/IStorageService";
import { UserListItem } from "@/types/user/user.projection";
import { resolveStorageUrl } from "@/utils/storage.utils";

export class UsersResponseDTO {
  id!: string;
  name!: string;
  email!: string;
  role!: Role;
  phone?: string;
  profileImage?: string;
  isBlocked!: boolean;
  createdAt!: Date;

  static async fromEntity(
    entity: UserListItem,
    storageService: IStorageService
  ): Promise<UsersResponseDTO> {
    const dto = new UsersResponseDTO();

    dto.id = entity._id;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.role = entity.role;
    dto.profileImage = await resolveStorageUrl(entity.profileImage, storageService);
    dto.isBlocked = entity.isBlocked;
    dto.createdAt = entity.createdAt;

    return dto;
  }

  static async fromEntities(
    entities: UserListItem[],
    storageService: IStorageService
  ): Promise<UsersResponseDTO[]> {
    const promises = entities.map((entity) => this.fromEntity(entity, storageService));
    return Promise.all(promises);
  }
}
