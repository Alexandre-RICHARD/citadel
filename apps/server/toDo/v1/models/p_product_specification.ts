import { DataTypes, type ModelDefined } from "sequelize";

import { database as db } from "../../database";
import type { ProductSpecificationsModelAttributes } from "../types/models/p_product_specification.type";
import type { ProductSpecificationsCreationAttributes } from "../types/modelsCreationAttributes/p_product_specification.sequelizeAttributes.type";

export const ProductSpecificationsModel: ModelDefined<
  ProductSpecificationsModelAttributes,
  ProductSpecificationsCreationAttributes
> = db.define(
  "ProductSpecifications",
  {
    p_id_product_specification: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    p_specification_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    p_is_specific_value: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    p_possible_value: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  },
  {
    tableName: "p_product_specification",
    timestamps: false,
  },
);
