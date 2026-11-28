import { CookieOptions, Response } from "express";

import { IS_PROD, REFRESH_EXPIRY_SECONDS, Role } from "@/constants";

import { generateRefreshToken } from "./jwt.util";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? "none" : "lax",
  partitioned: IS_PROD,
  path: "/",
};

export const setRefreshTokenCookie = (res: Response, payload: { id: string; role: Role }) => {
  const refreshToken = generateRefreshToken(payload);

  res.cookie("refreshToken", refreshToken, {
    ...refreshCookieOptions,
    maxAge: REFRESH_EXPIRY_SECONDS * 1000,
  });
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie("refreshToken", refreshCookieOptions);
};
