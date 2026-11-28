import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { injectable } from "inversify";

import logger from "@/config/logger";
import { s3 } from "@/config/s3";
import { AWS_REGION, AWS_S3_BUCKET, AWS_S3_EXPIRY, PURPOSE_POLICY } from "@/constants";
import { IStorageService, UploadUrlResponse } from "@/core/interfaces/services/IStorageService";
import { RequestUploadUrlDTO } from "@/dtos/requests/upload.dto";
import {
  extractKeyFromUrl,
  generateStorageKey,
  normalizeMimeType,
  validateUploadPolicy,
} from "@/utils/upload";

@injectable()
export class S3StorageService implements IStorageService {
  async generateUploadPresignedUrl(data: RequestUploadUrlDTO): Promise<UploadUrlResponse> {
    const { fileName, fileType, purpose, fileSize } = data;

    validateUploadPolicy(purpose, fileType, fileSize);

    const fileKey = generateStorageKey(purpose, fileType, fileName);
    const normalizedFileType = normalizeMimeType(fileType);
    const policy = PURPOSE_POLICY[purpose];
    const isPublic = !policy.folder.startsWith("private");

    try {
      const command = new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: fileKey,
        ContentType: normalizedFileType,
        CacheControl: isPublic ? "public, max-age=31536000, immutable" : undefined,
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      const url = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileKey}`;
      const publicUrl = isPublic ? url : await this.generateSignedUrl(url);

      logger.info("Generated S3 presigned upload URL", { key: fileKey, purpose });
      return { uploadUrl, publicUrl };
    } catch (error) {
      logger.error("Failed to generate S3 presigned upload URL", { key: fileKey, error });
      throw error;
    }
  }

  async generateSignedUrl(fileUrl: string, expiresIn: number = AWS_S3_EXPIRY): Promise<string> {
    const key = extractKeyFromUrl(fileUrl);
    if (!key) return fileUrl;

    try {
      const command = new GetObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: key,
      });

      return await getSignedUrl(s3, command, { expiresIn });
    } catch (error) {
      logger.error("Failed to generate S3 signed download URL", { key, error });
      throw error;
    }
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    const key = extractKeyFromUrl(fileUrl);
    if (!key) return false;

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: AWS_S3_BUCKET,
          Key: key,
        })
      );

      logger.info("File deleted successfully from S3", { key });
      return true;
    } catch (error) {
      logger.error("Failed to delete file from S3", { key, error });
      return false;
    }
  }
}
