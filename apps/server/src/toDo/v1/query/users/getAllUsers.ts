import { UsersModel } from "../../models/u_user.ts";
import type { GetAllUsersReturn } from "../../types/query/users/return/getAllUsers.return.type.ts";

export const getAllUsers = async (): GetAllUsersReturn => {
  try {
    const users = await UsersModel.findAll();
    return users;
  } catch (error) {
    console.error("getAllUsers => Error when querying:", error);
    return null;
  }
};
