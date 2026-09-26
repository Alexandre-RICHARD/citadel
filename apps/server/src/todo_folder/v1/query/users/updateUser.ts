import type { UpdateUserArgs } from "../../types/query/users/args/updateUser.args.type";
import type { UpdateUserReturn } from "../../types/query/users/return/updateUser.return.type";

export const updateUser = async ({
  user,
  updateData,
}: UpdateUserArgs): UpdateUserReturn => {
  try {
    const userUpdated = await user.update(updateData);
    return userUpdated;
  } catch (error) {
    console.error("updateUser => Error when querying:", error);
    return null;
  }
};
