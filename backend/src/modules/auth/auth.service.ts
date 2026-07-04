import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../../config/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  buildRefreshToken,
  generateAccessToken,
  generateRefreshTokenSecret,
  getRefreshTokenExpiryDate,
  hashRefreshToken,
  parseRefreshToken,
} from "../../utils/jwt.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: "USER" | "ADMIN";
};

type LoginInput = {
  email: string;
  password: string;
};

type RequestMeta = {
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
};

const sanitizeUser = (user: {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

const createTokensForUser = async (
  user: {
    id: number;
    email: string;
    role: string;
  },
  meta?: RequestMeta
) => {
  const selector = crypto.randomUUID();
  const refreshSecret = generateRefreshTokenSecret();
  const refreshToken = buildRefreshToken(selector, refreshSecret);
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const session = await prisma.authSession.create({
    data: {
      selector,
      refreshTokenHash,
      userId: user.id,
      expiresAt: getRefreshTokenExpiryDate(),
      ...(meta?.userAgent ? { userAgent: meta.userAgent } : {}),
      ...(meta?.ipAddress ? { ipAddress: meta.ipAddress } : {}),
    },
  });

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    sessionId: session.id,
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const registerUser = async (data: RegisterInput, meta?: RequestMeta) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "USER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const tokens = await createTokensForUser(user, meta);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

export const loginUser = async (data: LoginInput, meta?: RequestMeta) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const tokens = await createTokensForUser(user, meta);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  let selector: string;

  try {
    selector = parseRefreshToken(refreshToken).selector;
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const session = await prisma.authSession.findUnique({
    where: {
      selector,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (session.revokedAt) {
    throw new AppError("Refresh session has been revoked", 401);
  }

  if (session.expiresAt < new Date()) {
    throw new AppError("Refresh session has expired", 401);
  }

  const incomingTokenHash = hashRefreshToken(refreshToken);

  if (incomingTokenHash !== session.refreshTokenHash) {
    await prisma.authSession.update({
      where: {
        id: session.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    throw new AppError("Invalid refresh token. Session revoked.", 401);
  }

  const newRefreshSecret = generateRefreshTokenSecret();
  const newRefreshToken = buildRefreshToken(session.selector, newRefreshSecret);
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
  const newRefreshExpiry = getRefreshTokenExpiryDate();

  await prisma.authSession.update({
    where: {
      id: session.id,
    },
    data: {
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: newRefreshExpiry,
    },
  });

  const accessToken = generateAccessToken({
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    sessionId: session.id,
  });

  return {
    user: sanitizeUser(session.user),
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutByRefreshToken = async (refreshToken?: string) => {
  if (!refreshToken) {
    return;
  }

  let selector: string;

  try {
    selector = parseRefreshToken(refreshToken).selector;
  } catch {
    return;
  }

  await prisma.authSession.updateMany({
    where: {
      selector,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export const logoutAllUserSessions = async (userId: number) => {
  await prisma.authSession.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};