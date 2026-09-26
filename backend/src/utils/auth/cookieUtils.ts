import { Response } from "express";

import { NODE_ENV, REFRESH_TOKEN_TTL_SECONDS, Role } from "@/constants";

import { generateRefreshToken } from "./jwt.util";

const isProd = NODE_ENV === "production";

export const setRefreshTokenCookie = (res: Response, payload: { id: string; role: Role }) => {
  const refreshToken = generateRefreshToken(payload);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "lax" : "none",
    partitioned: isProd,
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "lax" : "none",
    partitioned: isProd,
    path: "/",
  });
};
