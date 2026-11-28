import { Role } from "@/constants";
import { IStorageService } from "@/core/interfaces/services/IStorageService";
import { IAdress, ILocation, IUser } from "@/types/user/user.entity";
import { resolveStorageUrl } from "@/utils/storage.utils";

export class RegisterResponseDTO {
  id!: string;
  name!: string;
  email!: string;
  role!: Role;
}

export class LoginResponseDto {
  id!: string;
  name!: string;
  email!: string;
  role!: Role;
  phone?: string;
  profileImage?: string;
  profile?: {
    address: IAdress;
    location: ILocation;
  };
  worker?: {
    id: string;
    displayName: string;
    profileImage?: string;
  };

  static async fromEntity(
    entity: IUser & { workerData?: { _id: string; displayName: string; profileImage?: string } },
    storageService: IStorageService
  ): Promise<LoginResponseDto> {
    const dto = new LoginResponseDto();
    dto.id = entity._id.toString();
    dto.name = entity.name;
    dto.email = entity.email;
    dto.role = entity.role;
    dto.phone = entity.phone;
    dto.profileImage = await resolveStorageUrl(entity.profileImage, storageService);
    dto.profile = entity.profile;

    if (entity.workerData) {
      dto.worker = {
        id: entity.workerData._id.toString(),
        displayName: entity.workerData.displayName,
        profileImage: entity.workerData.profileImage,
      };
    }

    return dto;
  }
}
