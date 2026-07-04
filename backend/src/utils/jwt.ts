import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

export type AccessTokenPayload = {
    id: number;
    email: string;
    role: string;
    sessionId: number;
};

const getAccessTokenSecret = () => {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET is not configured");
    }

    return secret;
};

export const generateAccessToken = (payload: AccessTokenPayload) => {
    const accessTokenExpiresIn = (process.env.ACCESS_TOKEN_EXPIRES_IN ||
        "15m") as NonNullable<SignOptions["expiresIn"]>;

    const options: SignOptions = {
        expiresIn: accessTokenExpiresIn,
    };

    return jwt.sign(payload, getAccessTokenSecret(), options);
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, getAccessTokenSecret()) as AccessTokenPayload;
};

export const generateRefreshTokenSecret = () => {
    return crypto.randomBytes(64).toString("hex");
};

export const buildRefreshToken = (selector: string, secret: string) => {
    return `${selector}.${secret}`;
};

export const parseRefreshToken = (refreshToken: string) => {
    const parts = refreshToken.split(".");

    if (parts.length !== 2) {
        throw new Error("Invalid refresh token format");
    }

    const [selector, secret] = parts;

    if (!selector || !secret) {
        throw new Error("Invalid refresh token format");
    }

    return {
        selector,
        secret,
    };
};

export const hashRefreshToken = (refreshToken: string) => {
    const pepper = process.env.REFRESH_TOKEN_PEPPER || "";

    return crypto
        .createHash("sha256")
        .update(`${refreshToken}.${pepper}`)
        .digest("hex");
};

export const getRefreshTokenExpiryDate = () => {
    const days = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7);

    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};