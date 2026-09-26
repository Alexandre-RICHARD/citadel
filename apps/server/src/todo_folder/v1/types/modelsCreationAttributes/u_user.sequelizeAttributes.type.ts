import type { Optional } from "sequelize";

import type { UserModelAttributes } from "../models/u_user.type";

export type UserCreationAttributes = Optional<
  UserModelAttributes,
  | "u_id_user"
  | "u_adress_city"
  | "u_adress_country"
  | "u_adress_location"
  | "u_adress_precision"
  | "u_adress_region_code"
>;
