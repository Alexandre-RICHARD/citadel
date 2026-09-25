import type { Model } from "sequelize";

import type { UserModelAttributes } from "../../../models/u_user.type";
import type { UserCreationAttributes } from "../../../modelsCreationAttributes/u_user.sequelizeAttributes.type";

export type DeleteUserArgs = {
  user: Model<UserModelAttributes, UserCreationAttributes>;
};
