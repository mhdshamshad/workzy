import crypto from "crypto";

import { HTTPSTATUS, PURPOSE_POLICY, UploadPurpose } from "@/constants";
import CustomError from "@/utils/customError";

export const MIME_TO_EXT: Record<string, string> = {
  // Images
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",

  // Documents
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",

  // Video
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-matroska": "mkv",
  "video/webm": "webm",

  // Audio
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",

  // Archives
  "application/zip": "zip",
  "application/x-tar": "tar",
};

export const normalizeMimeType = (mimeType: string): string =>
  mimeType.split(";")[0].trim().toLowerCase();

export function getFileExtension(mimetype: string, originalFileName?: string): string {
  const normalized = normalizeMimeType(mimetype);
  if (MIME_TO_EXT[normalized]) {
    return MIME_TO_EXT[normalized];
  }

  if (originalFileName) {
    const ext = originalFileName.split(".").pop()?.toLowerCase();
    if (ext && Object.values(MIME_TO_EXT).includes(ext)) return ext;
  }

  throw new CustomError(`Unsupported mimetype: ${mimetype}`, HTTPSTATUS.BAD_REQUEST);
}

export const generateStorageKey = (
  purpose: UploadPurpose,
  mimeType: string,
  originalFileName?: string
): string => {
  const folder = PURPOSE_POLICY[purpose].folder;
  const extension = getFileExtension(mimeType, originalFileName);
  const randomHex = crypto.randomBytes(6).toString("hex");
  return `${folder}/${Date.now()}_${randomHex}.${extension}`;
};

export const validateUploadPolicy = (
  purpose: UploadPurpose,
  mimeType: string,
  fileSizeBytes: number
): void => {
  const policy = PURPOSE_POLICY[purpose];
  if (!policy) {
    throw new CustomError(`Invalid upload purpose: "${purpose}".`, HTTPSTATUS.BAD_REQUEST);
  }

  const normalized = normalizeMimeType(mimeType);
  const allowed = policy.allowedTypes as readonly string[];

  if (!allowed.includes(normalized)) {
    throw new CustomError(
      `File type "${mimeType}" is not allowed for "${purpose}".`,
      HTTPSTATUS.BAD_REQUEST
    );
  }

  const maxBytes = policy.maxSizeMB * 1024 * 1024;
  if (fileSizeBytes > maxBytes) {
    throw new CustomError(
      `File size exceeds maximum allowed ${policy.maxSizeMB}MB for "${purpose}".`,
      HTTPSTATUS.BAD_REQUEST
    );
  }
};

export function extractKeyFromUrl(fileUrl: string): string {
  if (!fileUrl.startsWith("http")) return fileUrl;
  const directMatch = fileUrl.match(/amazonaws\.com\/(.+?)(?:\?|$)/);
  if (directMatch) return directMatch[1];

  const signedMatch = fileUrl.match(/\/s3\/[^/]+\/[^/]+\/([^&?]+)/);
  if (signedMatch) return decodeURIComponent(signedMatch[1]);

  const legacyMatch = fileUrl.match(/\/X-Amz-Algorithm[^/]+\/([^&]+)/);
  if (legacyMatch) return decodeURIComponent(legacyMatch[1]);

  return fileUrl;
}
