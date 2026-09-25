import { DataTypes, type ModelDefined } from "sequelize";

import { database as db } from "../../database.ts";
import type { ImagesModelAttributes } from "../types/models/i_image.type.ts";
import type { ImagesCreationAttributes } from "../types/modelsCreationAttributes/i_image.sequelizeAttributes.type.ts";

export const ImagesModel: ModelDefined<
  ImagesModelAttributes,
  ImagesCreationAttributes
> = db.define(
  "Images",
  {
    i_id_image: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    i_image: {
      type: DataTypes.BLOB,
      allowNull: false,
    },
  },
  {
    tableName: "i_image",
    timestamps: false,
  },
);
