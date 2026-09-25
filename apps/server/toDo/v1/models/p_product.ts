import { DataTypes, type ModelDefined } from "sequelize";

import { database as db } from "../../database";
import type { ProductModelAttributes } from "../types/models/p_product.type";
import type { ProductCreationAttributes } from "../types/modelsCreationAttributes/p_product.sequelizeAttributes.type";

export const ProductModel: ModelDefined<
  ProductModelAttributes,
  ProductCreationAttributes
> = db.define(
  "Product",
  {
    p_id_product: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    p_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    p_description: {
      type: DataTypes.STRING(8000),
      allowNull: false,
    },
    p_price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    p_registered_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    p_is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    p_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    p_disable_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    p_id_product_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    p_id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "p_product",
    timestamps: false,
  },
);

// Foreign Keys
ProductModel.belongsTo(db.models.ProductTypes, {
  foreignKey: "p_id_product_type",
  as: "ProductType",
});

ProductModel.belongsTo(db.models.Users, {
  foreignKey: "p_id_user",
  as: "User",
});
