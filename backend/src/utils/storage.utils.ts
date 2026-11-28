import { IStorageService } from "@/core/interfaces/services/IStorageService";

export const resolveStorageUrl = async (
  path: string | undefined,
  storageService: IStorageService
): Promise<string | undefined> => {
  if (!path) return undefined;
  if (path.includes("private")) {
    return await storageService.generateSignedUrl(path);
  }
  return path;
};
