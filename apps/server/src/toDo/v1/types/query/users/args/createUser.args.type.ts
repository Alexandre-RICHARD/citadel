export type CreateUserArgs = {
  role: string;
  registeredAt: Date;
  lastName: string;
  firstName: string;
  email: string;
  hashedPassword: string;
  isDeleted: boolean;
};
