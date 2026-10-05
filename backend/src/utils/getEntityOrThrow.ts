import { HTTPSTATUS } from "@/constants";
import { RepositoryOptions } from "@/core/types/repository";

import CustomError from "./customError";

export async function getEntityOrThrow<T>(
  repo: { findById(id: string, options?: RepositoryOptions): Promise<T | null> },
  id: string,
  errorMessage?: string,
  options?: RepositoryOptions
): Promise<T> {
  const entity = await repo.findById(id, options);
  if (!entity) {
    throw new CustomError(errorMessage || "Item Not Found", HTTPSTATUS.NOT_FOUND);
  }
  return entity;
}
