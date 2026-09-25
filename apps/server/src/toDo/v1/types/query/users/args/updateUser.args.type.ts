import type { Model } from "sequelize";

import type { UserModelAttributes } from "../../../models/u_user.type.ts";
import type { UserCreationAttributes } from "../../../modelsCreationAttributes/u_user.sequelizeAttributes.type.ts";

export type UpdateUserArgs = {
  user: Model<UserModelAttributes, UserCreationAttributes>;
  updateData: Partial<UserCreationAttributes>;
};
