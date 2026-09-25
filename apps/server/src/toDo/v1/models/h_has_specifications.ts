import { DataTypes, type ModelDefined } from "sequelize";

import { database as db } from "../../database.ts";
import type { HasSpecificationsModelAttributes } from "../types/models/h_has_specifications.type.ts";
import type { HasSpecificationsCreationAttributes } from "../types/modelsCreationAttributes/h_has_specifications.sequelizeAttributes.type.ts";

export const HasSpecificationsModel: ModelDefined<
  HasSpecificationsModelAttributes,
  HasSpecificationsCreationAttributes
> = db.define(
  "HasSpecifications",
  {
    h_id_has_specifications: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    h_id_product_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    h_id_product_specification: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "h_has_specifications",
    timestamps: false,
  },
);

// Foreign Keys
HasSpecificationsModel.belongsTo(db.models.ProductType, {
  foreignKey: "h_id_product_type",
  as: "ProductType",
});

HasSpecificationsModel.belongsTo(db.models.ProductSpecification, {
  foreignKey: "h_id_product_specification",
  as: "ProductSpecification",
});
