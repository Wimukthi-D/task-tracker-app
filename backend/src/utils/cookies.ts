import type { CookieOptions, Response } from "express";

export const REFRESH_TOKEN_COOKIE_NAME =
  process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

const getRefreshTokenMaxAge = () => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7);

  return days * 24 * 60 * 60 * 1000;
};

const getRefreshCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: getRefreshTokenMaxAge(),
  };
};

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string
) => {
  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    getRefreshCookieOptions()
  );
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    ...getRefreshCookieOptions(),
    maxAge: undefined,
  });
};