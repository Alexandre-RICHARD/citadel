import { UsersModel } from "../../models/u_user";
import type { CreateUserArgs } from "../../types/query/users/args/createUser.args.type";
import type { CreateUserReturn } from "../../types/query/users/return/createUser.return.type";

export const createUser = async ({
  role,
  registeredAt,
  lastName,
  firstName,
  email,
  hashedPassword,
  isDeleted,
}: CreateUserArgs): CreateUserReturn => {
  try {
    const newUser = await UsersModel.create({
      u_role: role,
      u_registered_at: registeredAt,
      u_lastname: lastName,
      u_firstname: firstName,
      u_mail_adress: email,
      u_hashed_password: hashedPassword,
      u_is_deleted: isDeleted,
    });
    return newUser;
  } catch (error) {
    console.error(
      "createUser => Erreur lors de la connexion ou de la requête : ",
      error,
    );
    return null;
  }
};
