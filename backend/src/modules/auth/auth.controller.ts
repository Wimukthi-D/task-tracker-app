import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import {
    loginUser,
    logoutAllUserSessions,
    logoutByRefreshToken,
    refreshAccessToken,
    registerUser,
} from "./auth.service.js";
import {
    clearRefreshTokenCookie,
    REFRESH_TOKEN_COOKIE_NAME,
    setRefreshTokenCookie,
} from "../../utils/cookies.js";

const getRequestMeta = (req: Request) => {
    return {
        userAgent:
            typeof req.headers["user-agent"] === "string"
                ? req.headers["user-agent"]
                : undefined,
        ipAddress: req.ip || undefined,
    };
};

const getRefreshTokenFromRequest = (req: Request) => {
    const requestWithCookies = req as Request & {
        cookies?: Record<string, string>;
    };

    return requestWithCookies.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
};

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await registerUser(req.body, getRequestMeta(req));

        setRefreshTokenCookie(res, result.refreshToken);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await loginUser(req.body, getRequestMeta(req));

        setRefreshTokenCookie(res, result.refreshToken);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const existingRefreshToken = getRefreshTokenFromRequest(req);

        if (!existingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        const result = await refreshAccessToken(existingRefreshToken);

        setRefreshTokenCookie(res, result.refreshToken);

        res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });
    } catch (error) {
        clearRefreshTokenCookie(res);
        next(error);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const existingRefreshToken = getRefreshTokenFromRequest(req);

        await logoutByRefreshToken(existingRefreshToken);

        clearRefreshTokenCookie(res);

        res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        next(error);
    }
};

export const logoutAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        await logoutAllUserSessions(req.user.id);

        clearRefreshTokenCookie(res);

        res.status(200).json({
            success: true,
            message: "Logged out from all sessions successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        res.status(200).json({
            success: true,
            message: "Current user retrieved successfully",
            data: req.user,
        });
    } catch (error) {
        next(error);
    }
};