import bcrypt from "bcrypt";

export const bcryptComparatorHelper = async (
  rawPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(rawPassword, hashedPassword);
};
