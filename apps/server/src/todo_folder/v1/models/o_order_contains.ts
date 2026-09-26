import { DataTypes, type ModelDefined } from "sequelize";

import { database as db } from "../../database";
import type { OrderContainsModelAttributes } from "../types/models/o_order_contains.type";
import type { OrderContainsCreationAttributes } from "../types/modelsCreationAttributes/o_order_contains.sequelizeAttributes.type";

export const OrderContainsModel: ModelDefined<
  OrderContainsModelAttributes,
  OrderContainsCreationAttributes
> = db.define(
  "OrderContains",
  {
    o_id_order_contains: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    o_id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    o_id_product: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    o_id_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    o_id_delivery: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    o_quantity: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    o_individual_price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  },
  {
    tableName: "o_order_contains",
    timestamps: false,
  },
);

// Foreign Keys
OrderContainsModel.belongsTo(db.models.User, {
  foreignKey: "o_id_user",
  as: "User",
});

OrderContainsModel.belongsTo(db.models.Product, {
  foreignKey: "o_id_product",
  as: "Product",
});

OrderContainsModel.belongsTo(db.models.Order, {
  foreignKey: "o_id_order",
  as: "Order",
});

OrderContainsModel.belongsTo(db.models.Delivery, {
  foreignKey: "o_id_delivery",
  as: "Delivery",
});
