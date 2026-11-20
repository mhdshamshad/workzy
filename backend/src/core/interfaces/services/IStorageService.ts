import { RequestUploadUrlDTO } from "@/dtos/requests/upload.dto";

export interface UploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

export interface IStorageService {
  generateUploadPresignedUrl(data: RequestUploadUrlDTO): Promise<UploadUrlResponse>;
  generateSignedUrl(fileUrl: string, expiresIn?: number): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
}
