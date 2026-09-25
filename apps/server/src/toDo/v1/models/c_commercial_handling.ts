import { DataTypes, type ModelDefined } from "sequelize";

import { database as db } from "../../database.ts";
import type { CommercialHandlingModelAttributes } from "../types/models/c_commercial_handling.type.ts";
import type { CommercialHandlingCreationAttributes } from "../types/modelsCreationAttributes/c_commercial_handling.sequelizeAttributes.type.ts";

export const CommercialHandlingModel: ModelDefined<
  CommercialHandlingModelAttributes,
  CommercialHandlingCreationAttributes
> = db.define(
  "CommercialHandling",
  {
    c_id_commercial_handling: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    c_id_user_handler: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    c_id_user_handled: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "c_commercial_handling",
    timestamps: false,
  },
);

// Foreign Key
CommercialHandlingModel.belongsTo(db.models.Users, {
  foreignKey: "c_id_user_handler",
  as: "Handler",
});

CommercialHandlingModel.belongsTo(db.models.Users, {
  foreignKey: "c_id_user_handled",
  as: "Handled",
});
