import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";

type JwtPayload = {
  id: number;
  email: string;
  role: string;
};

export const generateToken = (payload: JwtPayload) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const expiresIn: StringValue =
    (process.env.JWT_EXPIRES_IN as StringValue) || "1d";

  const options: SignOptions = {
    expiresIn,
  };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.verify(token, secret) as JwtPayload;
};