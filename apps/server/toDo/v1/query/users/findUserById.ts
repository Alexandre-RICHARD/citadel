import { UsersModel } from "../../models/u_user";
import type { FindUserByIdArgs } from "../../types/query/users/args/findUserById.args.type";
import type { FindUserByIdReturn } from "../../types/query/users/return/findUserById.return.type";

export const findUserById = async ({
  id,
}: FindUserByIdArgs): FindUserByIdReturn => {
  try {
    const user = await UsersModel.findOne({
      where: {
        u_id_user: id,
      },
    });
    return user;
  } catch (error) {
    console.error(
      "findUserById => Erreur lors de la connexion ou de la requête : ",
      error,
    );
    return null;
  }
};
