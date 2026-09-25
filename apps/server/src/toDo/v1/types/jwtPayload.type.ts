export type JWTCustomPayload = {
  userId: number;
  fullname: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
};
