import { UsersModel } from "../../models/u_user";
import type { GetUserByRoleArgs } from "../../types/query/users/args/getUsersByRole.args.type";
import type { GetUserByRoleReturn } from "../../types/query/users/return/getUsersByRole.return.type";

export const getUsersByRole = async ({
  role,
}: GetUserByRoleArgs): GetUserByRoleReturn => {
  try {
    const users = await UsersModel.findAll({
      where: {
        u_role: role,
      },
    });
    return users;
  } catch (error) {
    console.error(
      "getUsersByRole => Erreur lors de la connexion ou de la requête : ",
      error,
    );
    return null;
  }
};
