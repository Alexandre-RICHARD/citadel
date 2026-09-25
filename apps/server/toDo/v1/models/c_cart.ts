import { DataTypes, type ModelDefined } from "sequelize";

import { database as db } from "../../database";
import type { CartModelAttributes } from "../types/models/c_cart.type";
import type { CartCreationAttributes } from "../types/modelsCreationAttributes/c_cart.sequelizeAttributes.type";

export const CartModel: ModelDefined<
  CartModelAttributes,
  CartCreationAttributes
> = db.define(
  "Cart",
  {
    c_id_cart: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    c_id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    c_id_product: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    c_quantity: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
  },
  {
    tableName: "c_cart",
    timestamps: false,
  },
);

// Foreign Keys
CartModel.belongsTo(db.models.Users, {
  foreignKey: "c_id_user",
  as: "User",
});

CartModel.belongsTo(db.models.Product, {
  foreignKey: "c_id_product",
  as: "Product",
});
