import jwt from "jsonwebtoken";

import type { JWTCustomPayload } from "../v1/types/jwtPayload.type";

export const jwtDecoder = (token: string): JWTCustomPayload | null => {
  const secretKey = process.env.JWT_SECRET_KEY;

  if (!secretKey) {
    throw new Error("JWT secret key is not defined in environment variables.");
  }

  try {
    const decoded = jwt.verify(token, secretKey) as JWTCustomPayload;
    return decoded;
  } catch {
    return null;
  }
};
