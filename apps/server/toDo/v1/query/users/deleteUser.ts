import type { Model } from "sequelize";

import type { DeleteUserArgs } from "../../types/query/users/args/deleteUser.args.type";
import type { DeleteUserReturn } from "../../types/query/users/return/deleteUser.return.type";

export const deleteUser = async ({
  user,
}: DeleteUserArgs): DeleteUserReturn => {
  try {
    const deletedUser = await (user as Model).update({ u_is_deleted: true });
    return deletedUser;
  } catch (error) {
    console.error("deleteUser => Error when querying:", error);
    return null;
  }
};
