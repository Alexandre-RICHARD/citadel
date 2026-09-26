import jwt from "jsonwebtoken";

import type { JWTCreate } from "../v1/types/jwtCreate.type";

export const jwtGenerator = (payload: JWTCreate): string => {
  const secretKey = process.env.JWT_SECRET_KEY;

  if (!secretKey) {
    throw new Error("JWT secret key is not defined in environment variables.");
  }

  const expiresIn = 24 * 60 * 60;
  return jwt.sign(
    {
      userId: payload.userId,
      fullname: payload.fullname,
      role: payload.role,
      email: payload.email,
    },
    secretKey,
    {
      expiresIn,
    },
  );
};
