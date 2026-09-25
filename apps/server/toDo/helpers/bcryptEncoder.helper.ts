import bcrypt from "bcrypt";

export const bcryptEncoderHelper = (rawPassword: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(rawPassword, saltRounds);
};
