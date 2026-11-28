import { IStorageService } from "@/core/interfaces/services/IStorageService";
import { IAdress, ILocation, IUser } from "@/types/user/user.entity";
import { resolveStorageUrl } from "@/utils/storage.utils";

export class UserProfileResponseDto {
  id!: string;
  name!: string;
  email!: string;
  phone?: string;
  role!: string;
  profileImage?: string;
  isBlocked!: boolean;
  createdAt!: Date;
  profile?: { address?: IAdress; location: ILocation };

  static async fromEntity(
    entity: IUser,
    storageService: IStorageService
  ): Promise<UserProfileResponseDto> {
    const dto = new UserProfileResponseDto();

    dto.id = entity._id.toString();
    dto.name = entity.name;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.role = entity.role;
    dto.isBlocked = entity.isBlocked;
    dto.createdAt = entity.createdAt;
    dto.profile = entity.profile;
    dto.profileImage = await resolveStorageUrl(entity.profileImage, storageService);

    return dto;
  }
}
