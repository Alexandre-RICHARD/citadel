import type { Request, Response } from "express";

import { bcryptComparatorHelper } from "../../helpers/bcryptComparator.helper";
import { bcryptEncoderHelper } from "../../helpers/bcryptEncoder.helper";
import { jwtGenerator } from "../../helpers/jwtGenerator.helper";
import { RoleEnum } from "../enum/role.enum";
import { createUser } from "../query/users/createUser";
import { deleteUser as deleteUserQuery } from "../query/users/deleteUser";
import { findUserByEmail } from "../query/users/findUserByEmail";
import { findUserById } from "../query/users/findUserById";
import { getAllUsers } from "../query/users/getAllUsers";
import { getUsersByRole } from "../query/users/getUsersByRole";
import { updateUser } from "../query/users/updateUser";
import type { LoginEndpointBody } from "../types/endpointBody/users/login.endpointBody.type";
import type { RegisterEndpointBody } from "../types/endpointBody/users/register.endpointBody.type";
import type { UpdateMailEndpointBody } from "../types/endpointBody/users/updateMail.endpointBody.type";
import type { UpdatePasswordEndpointBody } from "../types/endpointBody/users/updatePassword.endpointBody.type";
import type { UpdateUserEndpointBody } from "../types/endpointBody/users/updateUser.endpointBody.type";

export const usersController = {
  getUsers: async (_req: Request, res: Response) => {
    try {
      const results = await getAllUsers();
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json(["server-error", error]);
    }
  },
  getUsersByRole: async (req: Request, res: Response) => {
    const { role } = req.params;
    try {
      const results = await getUsersByRole({ role });
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json(["server-error", error]);
    }
  },

  register: async (req: Request, res: Response) => {
    const { firstName, lastName, email, password } =
      req.body as RegisterEndpointBody;

    try {
      const hashedPassword = await bcryptEncoderHelper(password);

      const user = await createUser({
        role: RoleEnum.customer,
        registeredAt: new Date(),
        lastName,
        firstName,
        email,
        hashedPassword,
        isDeleted: false,
      });

      if (!user?.dataValues) {
        return res
          .status(500)
          .json({ error: "Échec de la création de l'utilisateur." });
      }

      const {
        u_id_user: userId,
        u_firstname: firstname,
        u_lastname: lastname,
        u_role: role,
        u_mail_adress: userEmail,
      } = user.dataValues;

      const token = jwtGenerator({
        userId,
        fullname: `${firstname} ${lastname}`,
        role,
        email: userEmail,
      });

      res.header("Authorization", `Bearer ${token}`);

      return res.status(201).json({
        user: {
          firstName: firstname,
          lastName: lastname,
          email: userEmail,
        },
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Une erreur est survenue lors de l'inscription." });
    }
  },

  login: async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginEndpointBody;

    const foundUserByMail = await findUserByEmail({ email });
    if (!foundUserByMail) {
      return res.status(404).json("user_not_found_with_mail_adress");
    }

    const {
      u_id_user: userId,
      u_firstname: firstname,
      u_lastname: lastname,
      u_role: role,
      u_mail_adress: userEmail,
      u_hashed_password: hashedPassword,
    } = foundUserByMail.dataValues;

    const isPasswordsMatches = await bcryptComparatorHelper(
      password,
      hashedPassword,
    );

    if (!isPasswordsMatches) {
      return res.status(403).json("wrong_credentials_for_login");
    }

    const token = jwtGenerator({
      userId,
      fullname: `${firstname} ${lastname}`,
      role,
      email: userEmail,
    });

    res.header("Authorization", `Bearer ${token}`);

    return res.status(200).json({
      user: {
        firstName: firstname,
        lastName: lastname,
        email: userEmail,
      },
    });
  },

  updateUser: async (req: Request, res: Response) => {
    const {
      userId,
      lastname,
      firstname,
      mail,
      rawPassword,
      adressCountry,
      adressRegionCode,
      adressCity,
      adressLocation,
      adressPrecision,
    } = req.body as UpdateUserEndpointBody;

    const userToUpdate = await findUserById({ id: userId });

    if (!userToUpdate) {
      return res.status(404).json("user_not_found");
    }

    try {
      const user = await updateUser({
        user: userToUpdate,
        updateData: {
          u_lastname: lastname,
          u_firstname: firstname,
          u_mail_adress: mail,
          u_hashed_password: await bcryptEncoderHelper(rawPassword),
          u_adress_country: adressCountry,
          u_adress_region_code: adressRegionCode,
          u_adress_city: adressCity,
          u_adress_location: adressLocation,
          u_adress_precision: adressPrecision,
        },
      });

      return res.status(200).json(user);
    } catch (error) {
      return res.status(501).json(error);
    }
  },

  updatePassword: async (req: Request, res: Response) => {
    const { email, lastPassword, rawPassword } =
      req.body as UpdatePasswordEndpointBody;

    const foundUserByMail = await findUserByEmail({ email });
    if (!foundUserByMail) {
      return res.status(404).json("user_not_found_with_mail_adress");
    }

    const { u_id_user: userId, u_hashed_password: hashedPassword } =
      foundUserByMail.dataValues;

    const isPasswordsMatches = await bcryptComparatorHelper(
      lastPassword,
      hashedPassword,
    );

    if (!isPasswordsMatches) {
      return res.status(403).json("wrong_credentials_for_login");
    }

    const userToUpdate = await findUserById({ id: userId });

    if (!userToUpdate) {
      return res.status(404).json("user_not_found");
    }

    try {
      const user = await updateUser({
        user: userToUpdate,
        updateData: {
          u_hashed_password: await bcryptEncoderHelper(rawPassword),
        },
      });
      return res.status(200).json({
        user: {
          firstName: user?.dataValues.u_firstname,
          lastName: user?.dataValues.u_lastname,
          email: user?.dataValues.u_mail_adress,
        },
      });
    } catch (error) {
      return res.status(501).json(error);
    }
  },

  updateMail: async (req: Request, res: Response) => {
    const { pastEmail, mail } = req.body as UpdateMailEndpointBody;

    const userToUpdate = await findUserByEmail({ email: pastEmail });

    if (!userToUpdate) {
      return res.status(404).json("user_not_found");
    }

    try {
      const user = await updateUser({
        user: userToUpdate,
        updateData: { u_mail_adress: mail },
      });
      return res.status(200).json({
        user: {
          firstName: user?.dataValues.u_firstname,
          lastName: user?.dataValues.u_lastname,
          email: user?.dataValues.u_mail_adress,
        },
      });
    } catch (error) {
      return res.status(501).json(error);
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userToDelete = await findUserById({ id: Number(id) });

    if (!userToDelete) {
      return res.status(404).json("user_not_found");
    }

    try {
      const user = await deleteUserQuery({ user: userToDelete });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(501).json(error);
    }
  },
};
