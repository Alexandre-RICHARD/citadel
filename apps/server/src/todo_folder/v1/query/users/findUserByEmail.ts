import { UsersModel } from "../../models/u_user.ts";
import type { FindUserByEmailArgs } from "../../types/query/users/args/findUserByEmail.args.type.ts";
import type { FindUserByEmailReturn } from "../../types/query/users/return/findUserByEmail.return.type.ts";

export const findUserByEmail = async ({
  email,
}: FindUserByEmailArgs): FindUserByEmailReturn => {
  try {
    const user = await UsersModel.findOne({
      where: {
        u_mail_adress: email,
      },
    });
    return user;
  } catch (error) {
    console.error(
      "findUserByEmail => Erreur lors de la connexion ou de la requête : ",
      error,
    );
    return null;
  }
};
